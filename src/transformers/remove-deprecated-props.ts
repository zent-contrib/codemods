import chalk from 'chalk';
import core from 'jscodeshift';
import { Transformer, getJSXElementName } from '../utils';
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
  9: {
    Pop: ['prefix'],
    Popover: ['prefix'],
    Avatar: ['prefix'],
    Badge: ['prefix'],
    Breadcrumb: ['prefix'],
    Button: ['prefix'],
    Card: ['prefix'],
    Checkbox: ['prefix'],
    ClampLines: ['prefix'],
    Collapse: ['prefix'],
    DatePicker: ['prefix'],
    Dialog: ['prefix'],
    Grid: ['prefix'],
    Input: ['prefix'],
    Mention: ['prefix'],
    Menu: ['prefix'],
    SubMenu: ['prefix'],
    'Menu.SubMenu': ['prefix'],
    MenuItem: ['prefix'],
    'Menu.MenuItem': ['prefix'],
    TextBlock: ['prefix'],
    'Placeholder.TextBlock': ['prefix'],
    RichTextBlock: ['prefix'],
    'Placeholder.RichTextBlock': ['prefix'],
    TextRow: ['prefix'],
    'Placeholder.TextRow': ['prefix'],
    TextRowDashed: ['prefix'],
    'Placeholder.TextRowDashed': ['prefix'],
    Circle: ['prefix'],
    'Placeholder.Circle': ['prefix'],
    Rectangle: ['prefix'],
    'Placeholder.Rectangle': ['prefix'],
    PreviewImage: ['prefix'],
    Radio: ['prefix'],
    RadioGroup: ['prefix'],
    'Radio.RadioGroup': ['prefix'],
    Rate: ['prefix'],
    Slider: ['prefix'],
    Sortable: ['prefix'],
    SplitButton: ['prefix'],
    Steps: ['prefix'],
    Swiper: ['prefix'],
    Switch: ['prefix'],
    Timeline: ['prefix'],
    'Timeline.Item': ['prefix'],
    'Timeline.Array': ['prefix'],
    'Timeline.Legend': ['prefix'],
    Tooltip: ['prefix'],
    'Popover.Trigger.Click': ['isOutSide'],
    'Trigger.Click': ['isOutSide'],
    Click: ['isOutSide'],
    'Popover.Trigger.Hover': ['isOutSide', 'quirk'],
    'Trigger.Hover': ['isOutSide', 'quirk'],
    Hover: ['isOutSide', 'quirk'],
  },
};

export const transformer: Transformer = (ast, { file, target, getImportedByLocal, zentJSXElements }) => {
  const changelog = data[target];
  if (!changelog) {
    return;
  }

  zentJSXElements.forEach(it => {
    const { openingElement } = it.node;
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
    const deprecatedProps = openingElement.attributes.filter(
      it => it.type === 'JSXAttribute' && it.name.type === 'JSXIdentifier' && props.includes(it.name.name)
    ) as core.JSXAttribute[];
    for (const prop of deprecatedProps) {
      analyze(imported, `remove ${chalk.red(prop.name.name)}`, file, it.node.loc?.start);
    }
    openingElement.attributes = openingElement.attributes.filter(
      it => it.type !== 'JSXAttribute' || !deprecatedProps.includes(it)
    );
    if (props.includes('children')) {
      analyze(imported, `remove ${chalk.red('children')}`, file, it.node.loc?.start);
      it.node.children = [];
      it.node.closingElement = null;
      openingElement.selfClosing = true;
      it.node.selfClosing = true;
    }
  });
};
