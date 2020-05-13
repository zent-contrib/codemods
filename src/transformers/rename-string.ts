import { analyze } from '../analyze';
import { red, green, yellow } from 'chalk';
import {
  ComponentName,
  PropName,
  Version,
  Transformer,
  getJSXElementName,
  entries,
} from '../utils';
import core from 'jscodeshift';

const data: Record<
  Version,
  Record<ComponentName, Record<PropName, Record<string, string>>>
> = {
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
    const { attributes } = openingElement;
    const local = getJSXElementName(openingElement);
    if (!local) {
      return;
    }
    const props = changelog[getImported(local)];
    if (!props) {
      return;
    }
    for (const [prop, values] of entries(props)) {
      const attr = attributes.find(
        it => it.type === 'JSXAttribute' && it.name.name === prop
      ) as core.JSXAttribute | undefined;
      if (attr?.value?.type === 'StringLiteral' && values[attr.value.value]) {
        analyze(
          getImported(local),
          `${yellow(attr.name.name)}: ${red(attr.value.value)} -> ${green(
            values[attr.value.value]
          )}`,
          file
        );
        attr.value.value = values[attr.value.value];
      }
    }
  });
};
