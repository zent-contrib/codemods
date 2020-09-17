import core from 'jscodeshift';
import { Transformer, entries, getJSXElementName } from '../utils';
import { analyze } from '../analyze';
import { green, red } from 'chalk';
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
  9: {
    'Popover.Trigger.Click': {
      autoClose: 'closeOnClickOutside',
    },
  },
};

export const transformer: Transformer = (ast, { file, target, getImportedByLocal, zentJSXElements }) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  zentJSXElements.forEach(it => {
    const { node } = it;
    const { openingElement } = node;
    const local = getJSXElementName(openingElement);
    if (!local) {
      return;
    }
    const imported = getImportedByLocal(local);
    if (!imported) {
      return;
    }
    const props = changelog[imported];
    if (!props) {
      return;
    }
    for (const [prev, next] of entries(props)) {
      const attr = openingElement.attributes.find(it => it.type === 'JSXAttribute' && it.name.name === prev) as
        | core.JSXAttribute
        | undefined;
      if (attr) {
        analyze(imported, `${red(prev)} -> ${green(next)}`, file, attr.loc?.start);
        attr.name = j.jsxIdentifier(next);
      }
    }
  });
};
