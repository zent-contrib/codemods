import * as fs from 'fs-extra';
import chalk from 'chalk';
import { IOptions } from './options';
import { br, plain } from './logger';
import { createZentHelper } from './zent-helper';
import { highlight } from './hl';
import { j } from './jscodeshift';
import { resolveTransformer, send } from './utils';

process.on('message', perform);

/**
 * 当master分配任务时执行
 * @param context
 */
export async function perform({
  file,
  options: { target, quote, output, silent, color },
  transformers,
}: IWorkerContext) {
  try {
    const source = (await fs.readFile(file)).toString();
    const ast = j(source);
    const helper = createZentHelper(ast);
    for (const transformer of transformers) {
      const transformerFn = resolveTransformer(transformer);
      transformerFn(ast, {
        target,
        file,
        ...helper,
      });
    }

    if (!helper.zentImport.find(j.ImportSpecifier).size()) {
      helper.zentImport.remove();
    }

    const out = ast.toSource({ quote });
    const modified = source !== out;
    if (modified) {
      if (output && modified && !silent) {
        let beautified = out;
        beautified = highlight(beautified, color);
        beautified = chalk.yellow('1') + '    ' + beautified;
        let count = 2;
        beautified = beautified.replace(/\n/g, e => {
          return e + chalk.yellow(count++) + ' '.repeat(5 - (count - 1).toString().length);
        });
        plain(file);
        plain(beautified);
        br();
      } else if (!output) {
        await fs.writeFile(file, out);
      }
    }
    send({ action: 'done', file });
  } catch (error) {
    send({
      file,
      action: 'error',
      message: error?.stack || error?.message || 'unknown error',
    });
  }
}

export interface IWorkerContext {
  file: string;
  options: IOptions;
  transformers: string[];
}

export type WorkerMessage =
  | {
      action: 'error';
      file: string;
      message: string;
    }
  | {
      action: 'done';
      file: string;
    }
  | {
      action: 'ready';
    }
  | {
      action: 'analyze';
      analyze: [string, string, string, { line: number; column: number }?];
    };
