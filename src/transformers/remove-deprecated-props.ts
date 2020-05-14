import chalk from 'chalk';
import core from 'jscodeshift';
import { Transformer } from '../utils';
import { analyze } from '../analyze';

const data: Record<number, Record<string, string[]>> = {
  7: {
    Loading: ['containerClass'],
    BlockLoading: ['containerClass'], // 防止refactor-loading修改后找不到Loading组件
    FullScreenLoading: ['containerClass'], // 防止refactor-loading修改后找不到Loading组件
    BlockHeader: ['children'],
    Alert: ['size', 'rounded'],
    Tabs: ['onTabReady', 'align', 'canadd', 'onAdd', 'size'],
  },
  8: {
    InfiniteScroller: ['offset', 'useCapture', 'prefix'],
    Cascader: ['prefix'],
    Select: ['prefix'],
  },
};

export const transformer: Transformer = (ast, { file, target, getImported, findZentJSXElements }) => {
  const deprecated = data[target] || {};
  if (!deprecated) {
    return;
  }

  const elms = findZentJSXElements();

  elms.forEach(it => {
    const { openingElement } = it.node;
    const { name: elmName } = openingElement;
    if (elmName.type === 'JSXIdentifier') {
      const props = deprecated[getImported(elmName.name)];
      const deprecatedProps = openingElement.attributes.filter(
        it => it.type === 'JSXAttribute' && it.name.type === 'JSXIdentifier' && props.includes(it.name.name)
      ) as core.JSXAttribute[];
      for (const prop of deprecatedProps) {
        analyze(elmName.name, `remove ${chalk.red(prop.name.name)}`, file, it.node.loc?.start);
      }
      openingElement.attributes = openingElement.attributes.filter(
        it => it.type === 'JSXAttribute' && !deprecatedProps.includes(it)
      );
      if (props.includes('children')) {
        analyze(elmName.name, `remove ${chalk.red('children')}`, file, it.node.loc?.start);
        it.node.children = [];
        it.node.closingElement = null;
        openingElement.selfClosing = true;
        it.node.selfClosing = true;
      }
    }
  });
};
