import core from 'jscodeshift';
import { Transformer, entries, getJSXElementName } from '../utils';
import { analyze } from '../analyze';
import { green, red } from 'chalk';
import { j } from '../jscodeshift';

const data: Record<number, Record<string, Record<string, string>>> = {
  8: {
    InfiniteScroller: {
      initialLoad: 'skipLoadOnMount',
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
    const { attributes } = openingElement;
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
      const attr = attributes.find(it => it.type === 'JSXAttribute' && it.name.name === prev) as
        | core.JSXAttribute
        | undefined;

      if (attr) {
        const value = attr.value;
        attr.name = j.jsxIdentifier(next);
        if (!value) {
          attr.value = j.jsxExpressionContainer(j.booleanLiteral(false));
        } else if (value.type === 'JSXExpressionContainer') {
          if (value.expression.type === 'BooleanLiteral') {
            value.expression = j.booleanLiteral(!value.expression.value);
          } else if (value.expression.type !== 'JSXEmptyExpression') {
            value.expression = j.unaryExpression('!', value.expression);
          } else {
            continue;
          }
        }
        analyze(imported, `${red(prev)} rename to ${green(next)}, switch it`, file, attr.loc?.start);
      }
    }
  });
};
