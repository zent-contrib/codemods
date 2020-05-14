import { green } from 'chalk';
import { send } from './utils';

const analyzes: Record<string, Record<string, string[]>> = {};

export function analyze(component: string, message: string, file: string, loc?: { line: number; column: number }) {
  if (loc) {
    file += `:${loc.line}:${loc.column + 1}`;
  }
  if (process.send) {
    send({
      action: 'analyze',
      analyze: [component, message, file, loc],
    });
  } else {
    let messages = analyzes[component];
    if (!messages) {
      messages = {};
      analyzes[component] = messages;
    }
    let files = messages[message];
    if (!files) {
      files = [];
      messages[message] = files;
    }
    files.push(file);
  }
}

export function printAnalyzes() {
  if (!Object.keys(analyzes).length) {
    console.log('');
    console.log('Nothing transformed. This can be caused by the following reasons: ');
    console.log('1. There are few incompatibilities');
    console.log('2. Incompatibilities can be complicated to change. Check the change log carefully. Go for it ! 🚀');
  } else {
    console.log('');
    console.log('⬇️  Zent Codemod Analyzes');
    console.log('');
    for (const [component, messages] of Object.entries(analyzes)) {
      console.log('- ' + component);
      for (const [message, files] of Object.entries(messages)) {
        console.log('    - ' + message);
        for (const file of files) {
          console.log('        - ' + file);
        }
      }
    }
  }
  console.log('');
  console.log(`${green('Change Log')}: https://youzan.github.io/zent/zh/guides/changelog`);
  console.log('');
}
