import chalk from 'chalk';
import { Transformer } from '../utils';
import { analyze } from '../analyze';

type Version = number;
type Component = string;
type Transform =
  | {
      props: [string, string][];
    }
  | string;

const data: Record<Version, Record<Component, Transform>> = {
  7: {
    Button: {
      props: [['component', `rewrite by ${correct('ButtonDirective')}`]],
    },
    Pagination: {
      props: [
        ['onChange', `the type of the first parameter changes from ${uncorrect('number')} to ${correct('object')}`],
        ['onPageSizeChange', `use new ${correct('onChange')} with page info`],
        ['maxPageToShow', `use ${correct('formatTotal')} to implement it`],
        [
          'pageSize',
          `${uncorrect('pageSize')} now is split into ${correct('pageSize')} and ${correct('pageSizeOptions')}`,
        ],
      ],
    },
    Grid: {
      props: [
        ['onPageSizeChange', `use new ${correct('onChange')} with page info`],
        [
          'pageInfo',
          `${uncorrect('pageSize')} now is split into ${correct('pageSize')} and ${correct('pageSizeOptions')}`,
        ],
      ],
    },
    Table: {
      props: [
        ['onPageSizeChange', `use new ${correct('onChange')} with page info`],
        [
          'pageInfo',
          `${uncorrect('pageSize')} now is split into ${correct('pageSize')} and ${correct('pageSizeOptions')}`,
        ],
      ],
    },
    Tree: {
      props: [['onCheck', `breaking change on ${uncorrect('parameters')}`]],
    },
    NumberInput: {
      props: [
        [
          'onChange',
          `the type of the parameter changes from ${uncorrect('Event')} to ${correct('string')} or ${correct(
            'number'
          )}(with enabled integer)`,
        ],
      ],
    },
    'Layout.Row': `use ${correct('LayoutRow')} within ${correct('LayoutGrid')}`,
    'Layout.Col': `use ${correct('LayoutCol')} within ${correct('LayoutGrid')}`,
    Tag: {
      props: [
        ['onVisibleChange', `use ${correct('visible')} and ${correct('onClose')}`],
        ['borderColor', `use ${correct('style.borderColor')}`],
        ['bgColor', `use ${correct('style.backgroundColor')}`],
        ['fontColor', `use ${correct('style.color')}`],
        ['closeButtonFontColor', `use ${correct('closeButtonStyle')}`],
        ['color', `use ${correct('theme')} or ${correct('style')}`],
      ],
    },
    Portal: `${correct('new usage')}, rewrite it`,
    LayeredPortal: `use ${correct('Portal')}`,
    SearchInput: `use ${correct('<input icon="search" />')}`,
  },
};

export const transformer: Transformer = (ast, { target, file }) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  const elms = ast.findJSXElements();

  elms.forEach(it => {
    const { node } = it;
    const { openingElement } = node;
    const { name, attributes } = openingElement;
    if (name.type !== 'JSXIdentifier') {
      return;
    }
    const transform = changelog[name.name];
    if (!transform) {
      return;
    }
    if (typeof transform === 'string') {
      analyze(name.name, transform, file, node.loc?.start);
    } else {
      for (const [prop, msg] of transform.props) {
        const attr = attributes.find(it => it.type === 'JSXAttribute' && it.name.name === prop);
        if (attr) {
          analyze(uncorrect(name.name), chalk.yellow(prop) + ': ' + msg, file, attr.loc?.start);
        }
      }
    }
  });
};

function correct(str: string) {
  return chalk.green(str);
}
function uncorrect(str: string) {
  return chalk.red(str);
}
