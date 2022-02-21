import chalk from 'chalk';
import { Transformer, getJSXElementName, renameJSXElement } from '../utils';
import { analyze } from '../analyze';

type ComponentName = string;

const data: Record<number, Record<ComponentName, ComponentName>> = {
  10: {
    Swiper: 'Carousel',
  },
};

export const transformer: Transformer = (
  _,
  { file, target, getImportedByLocal, zentJSXElements, zentImportSpecifiers }
) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  for (const [oldName, newName] of Object.entries(changelog)) {
    const local = getImportedByLocal(oldName);
    if (local === oldName) {
      // 没有使用别名，需要重命名标识符
      zentJSXElements
        .filter(it => getJSXElementName(it.node.openingElement) === oldName)
        .forEach(it => {
          const { node } = it;
          analyze(chalk.red(oldName), `rename to ${chalk.green(newName)}`, file, node.loc?.start);
          renameJSXElement(node, newName);
        });
    }

    // 替换 import
    zentImportSpecifiers.forEach(it => {
      const { node } = it;
      if (node.imported.name === oldName) {
        analyze(chalk.red(oldName), `rename to ${chalk.green(newName)}`, file, node.loc?.start);
        node.imported.name = newName;
      }
    });
  }
};
