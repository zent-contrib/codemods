import chalk from 'chalk';
import core from 'jscodeshift';
import { Transformer, renameJSXElement } from '../utils';
import { analyze } from '../analyze';
import { j } from '../jscodeshift';

const Loading = 'Loading';
const FullScreenLoading = 'FullScreenLoading';
const BlockLoading = 'BlockLoading';

export const transformer: Transformer = (ast, { file, target, getLocalByImported, zentJSXElements, zentImport }) => {
  if (target !== 7) {
    return;
  }

  const local = getLocalByImported(Loading);
  if (!local) {
    return;
  }

  const elms = zentJSXElements.findJSXElements(local);
  zentImport.find(j.ImportSpecifier, (it: core.ImportSpecifier) => it.imported.name === Loading).remove();

  elms.forEach(it => {
    const { node } = it;
    const float = node.openingElement.attributes.find(it => it.type === 'JSXAttribute') as
      | core.JSXAttribute
      | undefined;
    if (float) {
      if (!float.value) {
        analyze(chalk.red(Loading), `替换为 ${chalk.green(FullScreenLoading)}`, file, node.loc?.start);
        renameJSXElement(node, FullScreenLoading);
        zentImport.find(j.ImportSpecifier).insertBefore(j.importSpecifier(j.identifier(FullScreenLoading)));
      } else {
        analyze(
          chalk.red(Loading),
          `无法替换为 ${chalk.green(BlockLoading)} 或 ${chalk.green(FullScreenLoading)}`,
          file,
          node.loc?.start
        );
      }
    } else {
      analyze(chalk.red(Loading), `替换为 ${chalk.green(BlockLoading)}`, file, node.loc?.start);
      renameJSXElement(node, BlockLoading);
      zentImport.find(j.ImportSpecifier).insertBefore(j.importSpecifier(j.identifier(BlockLoading)));
    }
  });
};
