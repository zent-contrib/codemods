import * as path from 'path';
import chalk from 'chalk';
import globby from 'globby';
import { ChildProcess, execSync, fork } from 'child_process';
import { IOptions, getOptions } from './options';
import { IWorkerContext, WorkerMessage } from './worker';
import { analyze, printAnalyzes } from './analyze';
import { br, info, warn } from './logger';
import { cpus } from 'os';
import { errors } from './error';
import { printError, pushError } from './error';

/**
 * 创建worker，在其中跑代码转换的任务，主进
 * 程仅接收worker发出的消息，不做代码转换的
 * 操作
 * @param transformers
 * @param pattern
 * @param options
 */
export function run(transformers: string[], pattern: string, options: IOptions) {
  if (!options.force) {
    checkGitWorkingTree();
  }

  info('start working');
  br();
  const files = getFiles(pattern);
  if (files.exhausted()) {
    info(`no matched files by ${pattern}, check your project`);
    process.exit(0);
  }
  const workerNum = cpus().length;
  for (let i = 0; i < workerNum; i++) {
    if (files.exhausted()) {
      break;
    }
    const worker = fork(path.join(__dirname, './worker'));
    worker.send(createWorkerContext());
    worker.on('message', (e: WorkerMessage) => {
      switch (e.action) {
        case 'error':
          pushError(e.message);
        /* eslint-disable-next-line no-fallthrough */
        case 'done':
          files.done(e.file);
          perform(worker);
          break;
        case 'analyze':
          analyze(...e.analyze);
          break;
      }
    });
  }

  process.on('exit', () => {
    if (!getOptions().silent) {
      printAnalyzes();
      printError();
    }
  });

  /**
   * 为worker分配下一个任务
   * @param worker
   */
  function perform(worker: ChildProcess) {
    if (!files.exhausted()) {
      worker.send(createWorkerContext());
    } else if (files.finish()) {
      process.exit(errors.length);
    }
  }

  /**
   * 创建参数供worker使用
   */
  function createWorkerContext(): IWorkerContext {
    return {
      file: files.next(),
      options,
      transformers,
    };
  }
}

function getFiles(pattern: string) {
  const files = globby.sync(pattern, { gitignore: true });
  const workingFiles: string[] = [];
  const finishedFiles: string[] = [];

  function next() {
    const file = files.pop();
    if (file) {
      workingFiles.push(file);
      return file;
    }
    info('Unexpected worker message');
    process.exit(1);
  }

  function exhausted() {
    return !files.length;
  }

  function done(file: string) {
    const index = workingFiles.indexOf(file);
    workingFiles.splice(index, 1);
    finishedFiles.push(file);
  }

  function finish() {
    return exhausted() && !workingFiles.length;
  }

  return {
    next,
    done,
    exhausted,
    finish,
  };
}

/**
 * 检查git状态，必须commit所有改动后才可以进行转换
 */
function checkGitWorkingTree() {
  try {
    const msg = execSync('git status');
    if (!msg.includes('working tree clean')) {
      warn(`Please ${chalk.yellow(chalk.bold('CLEAN'))} working tree before running zent-codemod`);
      process.exit(1);
    }
    /* eslint-disable-next-line no-empty */
  } catch (e) {}
}
