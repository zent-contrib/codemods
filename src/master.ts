import * as path from 'path';
import globby from 'globby';
import { ChildProcess, fork } from 'child_process';
import { IOptions, getOptions } from './options';
import { IWorkerContext, WorkerMessage } from './worker';
import { analyze, printAnalyzes } from './analyze';
import { cpus } from 'os';
import { errors } from './error';
import { info } from './logger';
import { printError, pushError } from './error';

export function run(transformers: string[], pattern: string, options: IOptions) {
  info('start working');
  console.log('');
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

  function perform(worker: ChildProcess) {
    if (!files.exhausted()) {
      worker.send(createWorkerContext());
    } else if (files.finish()) {
      process.exit(errors.length);
    }
  }

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
