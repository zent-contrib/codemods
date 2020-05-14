import core from 'jscodeshift';
import { ComponentName, PropName, Transformer, Version, entries, getJSXElementName } from '../utils';
import { analyze } from '../analyze';
import { green, red, yellow } from 'chalk';

const data: Record<Version, Record<ComponentName, Record<PropName, Record<string, string>>>> = {
  7: {
    Alert: {
      type: {
        danger: 'error',
      },
    },
  },
  8: {
    Icon: {
      type: {
        'text-guide': 'text-guide-o',
        'video-guide': 'video-guide-o',
      },
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
    for (const [prop, values] of entries(props)) {
      const attr = attributes.find(it => it.type === 'JSXAttribute' && it.name.name === prop) as
        | core.JSXAttribute
        | undefined;
      if (attr?.value?.type === 'StringLiteral' && values[attr.value.value]) {
        analyze(
          imported,
          `${yellow(attr.name.name)}: ${red(attr.value.value)} -> ${green(values[attr.value.value])}`,
          file
        );
        attr.value.value = values[attr.value.value];
      }
    }
  });
};
