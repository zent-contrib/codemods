import { green } from 'chalk';
import { isMaster, send } from './utils';
import { plain } from './logger';

const analyzes: Record<string, Record<string, string[]>> = {};

export function analyze(component: string, message: string, file: string, loc?: { line: number; column: number }) {
  if (isMaster) {
    send({
      action: 'analyze',
      analyze: [component, message, file, loc],
    });
  } else {
    if (loc) {
      file += `:${loc.line}:${loc.column + 1}`;
    }

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
    plain('');
    plain('Nothing transformed. This can be caused by the following reasons: ');
    plain('1. There are few incompatibilities');
    plain('2. Incompatibilities can be complicated to change. Check the change log carefully. Go for it ! 🚀');
  } else {
    plain('');
    plain('⬇️  Zent Codemod Analyzes');
    plain('');
    for (const [component, messages] of Object.entries(analyzes)) {
      plain('🌟 ' + component);
      for (const [message, files] of Object.entries(messages)) {
        plain('    🔧 ' + message);
        for (const file of files) {
          plain('        at ' + file);
        }
      }
    }
  }
  plain('');
  plain(`${green('Change Log')}: https://youzan.github.io/zent/zh/guides/changelog`);
  plain('');
}
