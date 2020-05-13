import { fork, ChildProcess } from 'child_process';
import globby from 'globby';
import { cpus } from 'os';
import { IWorkerContext, WorkerMessage } from './worker';
import { pushError, printError } from './error';
import { info } from './logger';
import { getOptions, IOptions } from '.';
import { printAnalyzes, analyze } from './analyze';
import * as path from 'path';

export function run(
  transformers: string[],
  pattern: string,
  options: IOptions
) {
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

  function perform(worker: ChildProcess) {
    if (!files.exhausted()) {
      worker.send(createWorkerContext());
    } else if (files.finish()) {
      process.exit(0);
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

process.on('exit', e => {
  if (!getOptions().silent && !e) {
    printAnalyzes();
    printError();
  }
});
