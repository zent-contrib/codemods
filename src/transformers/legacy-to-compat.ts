import core from 'jscodeshift';
import { Transformer } from '../utils';
import { analyze } from '../analyze';
import { green } from 'chalk';
import { j } from '../jscodeshift';

const data: Record<number, string[]> = {
  7: ['Form'],
  8: ['Upload'],
};

export const transformer: Transformer = (ast, { file, target, zentImportSpecifiers }) => {
  const legacy = data[target];
  if (!legacy) {
    return;
  }

  const zentCompatImport = j.importDeclaration([], j.stringLiteral('@zent/compat'));

  let i = 0;
  const specifiers = zentImportSpecifiers.nodes();
  const { length } = specifiers;
  while (i < length) {
    const specifier = specifiers[i];
    const { name: importedname } = specifier.imported;
    if (legacy.includes(importedname)) {
      zentImportSpecifiers.at(i).remove();
      analyze(importedname, `import from ${green('@zent/compat')}`, file);
      zentCompatImport.specifiers.push(
        j.importSpecifier(j.identifier(importedname), specifier.local && j.identifier(specifier.local.name))
      );
    }
    i++;
  }
  if (zentCompatImport.specifiers.length) {
    ast.find(j.Program, (it: core.Program) => {
      it.body.unshift(zentCompatImport);
    });
  }
};
