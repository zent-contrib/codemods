import * as fs from 'fs-extra';
import chalk from 'chalk';
import core from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';
import { IOptions } from '.';
import { highlight } from './hl';
import { j } from './jscodeshift';
import { keys, resolveTransformer, send } from './utils';

process.on('message', perform);

export async function perform({
  file,
  options: { target, quote, output, color, silent },
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
        beautified = color ? highlight(beautified) : beautified;
        beautified = chalk.yellow('1') + '    ' + beautified;
        let count = 2;
        beautified = beautified.replace(/\n/g, e => {
          return e + chalk.yellow(count++) + ' '.repeat(5 - (count - 1).toString().length);
        });
        console.log(file);
        console.log(beautified);
        console.log('');
      } else {
        await fs.writeFile(file, out);
      }
    }
    send({ action: 'done', file });
  } catch (error) {
    send({ action: 'error', message: error?.message || '', file });
  }
}

function createZentHelper(ast: Collection<any>) {
  const mapComponentToLocals: Record<string, string> = {};
  const zentImport = ast.find(j.ImportDeclaration, (node: core.ImportDeclaration) => node.source.value === 'zent');
  const zentImportSpecifiers = zentImport.find(j.ImportSpecifier);
  zentImportSpecifiers.forEach(it => {
    mapComponentToLocals[it.node.imported.name] = it.node.local?.name || it.node.imported.name;
  });
  /**
   * 根据组件名找出组件在当前模块的别名
   * @param component 组件名
   * @returns 组件的别名
   */
  function getLocal(component: string): string | undefined {
    return mapComponentToLocals[component];
  }
  function getImported(local: string) {
    return keys(mapComponentToLocals).find(it => mapComponentToLocals[it] === local) as string;
  }
  function findZentJSXElements() {
    return ast.findJSXElements().filter(it => {
      const { name } = it.node.openingElement;
      return (
        name.type === 'JSXIdentifier' &&
        zentImportSpecifiers.some(it => (it.node.local || it.node.imported).name === name.name)
      );
    });
  }
  return {
    getLocal,
    getImported,
    findZentJSXElements,
    zentImport,
    zentImportSpecifiers,
  };
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
