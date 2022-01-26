import core from 'jscodeshift';
import { Transformer, getJSXElementName, literal, toString } from '../utils';
import { analyze } from '../analyze';
import { j } from '../jscodeshift';
import { yellow } from 'chalk';

const data: Record<number, Record<string, { name: string; value: any }[]>> = {
  7: {
    Tabs: [{ name: 'type', value: 'card' }],
  },
  8: {
    InfiniteScroller: [
      { name: 'hasMore', value: true },
      { name: 'useWindow', value: true },
    ],
    Affix: [{ name: 'offsetTop', value: 0 }],
  },
  10: {
    FullScreenLoading: [{ name: 'icon', value: 'youzan' }],
    BlockLoading: [{ name: 'icon', value: 'youzan' }],
    InlineLoading: [{ name: 'icon', value: 'youzan' }],
    Tag: [{ name: 'theme', value: 'red' }],
  },
};

export const transformer: Transformer = (ast, { file, target, zentJSXElements, getImportedByLocal }) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  zentJSXElements.forEach(it => {
    const local = getJSXElementName(it.node.openingElement);
    const imported = getImportedByLocal(local);
    if (!imported) {
      return;
    }
    const props = changelog[imported];
    if (!props) {
      return;
    }
    const { attributes } = it.node.openingElement;
    for (const { name, value } of props) {
      const attr = attributes.find(it => it.type === 'JSXAttribute' && it.name.name === name);
      if (!attr) {
        analyze(
          imported,
          `The default value of ${yellow(name)} has been changed. Explicitly specify it as ${yellow(toString(value))}`,
          file,
          it.node.loc?.end
        );
        attributes.unshift(
          j.jsxAttribute(
            j.jsxIdentifier(name),
            typeof value === 'string'
              ? (literal(value) as core.Literal)
              : value === true
              ? null
              : j.jsxExpressionContainer(literal(value))
          )
        );
      }
    }
  });
};
