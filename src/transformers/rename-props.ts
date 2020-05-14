import { Transformer, entries } from '../utils';
import { analyze } from '../analyze';
import { red, green } from 'chalk';
import core from 'jscodeshift';
import { j } from '../jscodeshift';

const data: Record<number, Record<string, Record<string, string>>> = {
  7: {
    Pagination: {
      totalItem: 'total',
    },
    Loading: {
      showDelay: 'delay',
      show: 'loading',
    },
    // 防止refactor-loading修改后找不到Loading组件
    BlockLoading: {
      showDelay: 'delay',
      show: 'loading',
    },
    // 防止refactor-loading修改后找不到Loading组件
    FullScreenLoading: {
      showDelay: 'delay',
      show: 'loading',
    },
    Tree: {
      defaultCheckedKeys: 'checkedKeys',
    },
    BlockHeader: {
      content: 'leftContent',
      childAlign: 'rightContent',
    },
    Tabs: {
      onTabChange: 'onChange',
    },
  },
};

export const transformer: Transformer = (
  ast,
  { file, target, getImported, findZentJSXElements }
) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  const elms = findZentJSXElements();

  elms.forEach(it => {
    const { node } = it;
    const { openingElement } = node;
    const { name } = openingElement;
    if (name.type === 'JSXIdentifier') {
      const props = changelog[getImported(name.name)];
      if (props) {
        for (const [prev, next] of entries(props)) {
          const attr = openingElement.attributes.find(
            it => it.type === 'JSXAttribute' && it.name.name === prev
          ) as core.JSXAttribute | undefined;
          if (attr) {
            analyze(
              name.name,
              `${red(prev)} -> ${green(next)}`,
              file,
              attr.loc?.start
            );
            attr.name = j.jsxIdentifier(next);
          }
        }
      }
    }
  });
};
