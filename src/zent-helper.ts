import core from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';
import { getJSXElementName } from './utils';
import { j } from './jscodeshift';

export function createZentHelper(ast: Collection<any>) {
  const zentImport = ast.find(j.ImportDeclaration, (node: core.ImportDeclaration) => node.source.value === 'zent');
  const zentImportSpecifiers = zentImport.find(j.ImportSpecifier);

  const importedComponents: IImportedCoponent[] = zentImportSpecifiers
    .nodes()
    .map(it => ({ imported: it.imported.name, local: it.local ? it.local.name : it.imported.name }));

  const zentJSXElements = ast.findJSXElements().filter(it => {
    const { node } = it;
    const { openingElement } = node;
    const name = getJSXElementName(openingElement);
    if (name.includes('.')) {
      // JSXMemberExpression, such as `Collapse.Panel`
      const [namespace] = name.split('.');
      return importedComponents.some(it => it.local === namespace);
    } else {
      return importedComponents.some(it => it.local === name);
    }
  });

  function getImportedByLocal(local: string) {
    if (local.includes('.')) {
      const [namespace, ...chain] = local.split('.');
      const importedComponent = importedComponents.find(it => it.local === namespace);
      return importedComponent && importedComponent.imported + chain.join('.');
    } else {
      return importedComponents.find(it => it.local === local)?.imported;
    }
  }

  function getLocalByImported(imported: string) {
    if (imported.includes('.')) {
      const [namespace, ...chain] = imported.split('.');
      const importedComponent = importedComponents.find(it => it.imported === namespace);
      return importedComponent && importedComponent.local + chain.join('.');
    } else {
      return importedComponents.find(it => it.imported === imported)?.local;
    }
  }

  return {
    zentImport,
    zentImportSpecifiers,
    zentJSXElements,
    getImportedByLocal,
    getLocalByImported,
  };
}

export interface IImportedCoponent {
  imported: string;
  local: string;
}
