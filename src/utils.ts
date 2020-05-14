import * as path from 'path';
import core from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';
import { WorkerMessage } from './worker';
import { info } from './logger';
import { j } from './jscodeshift';

export const { is, keys, values, entries } = Object;

export interface ITransformContext {
  target: number;
  file: string;
  zentImport: Collection<core.ImportDeclaration>;
  zentImportSpecifiers: Collection<core.ImportSpecifier>;
  getLocal(component: string): string | undefined;
  getImported(local: string): string;
  findZentJSXElements(): Collection<core.JSXElement>;
}

export type Transformer = (ast: Collection<any>, ctx: ITransformContext) => void;

export function isPlainObject(val: any): val is Record<string, any> {
  return val && typeof val === 'object' && Object.prototype.toString.call(val) === '[object Object]';
}

export function toString(value: any) {
  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}

export function literal(value: any): core.Literal | core.Identifier | core.ObjectExpression | core.ArrayExpression {
  if (value === undefined) {
    return j.identifier('undefined');
  } else if (isPlainObject(value)) {
    return j.objectExpression(
      Object.keys(value).map(key => j.objectProperty(j.stringLiteral(key), literal(value[key])))
    );
  } else if (Array.isArray(value)) {
    return j.arrayExpression(value.map(it => literal(it)));
  } else {
    return j.literal(value);
  }
}

export function send(message: WorkerMessage) {
  process.send?.(message);
}

export function resolveTransformer(name: string): Transformer {
  const modulePath = path.join(__dirname, './transformers', name);
  try {
    return require(modulePath).transformer;
  } catch (e) {
    info('unknown transformer ' + name);
    process.exit(1);
  }
}

export function renameJSXElement(elm: core.JSXElement, name: string) {
  elm.openingElement.name = j.jsxIdentifier(name);
  if (elm.closingElement) {
    elm.closingElement.name = j.jsxIdentifier(name);
  }
}

export type Version = number;
export type ComponentName = string;
export type PropName = string;

export function getJSXElementName(node: core.JSXOpeningElement) {
  switch (node.name.type) {
    case 'JSXIdentifier':
      return node.name.name;
    case 'JSXMemberExpression':
      return node.name.property.name;
    default:
      return null;
  }
}
