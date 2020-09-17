import core from 'jscodeshift';
import { Transformer } from '../utils';
import { analyze } from '../analyze';
import { green } from 'chalk';
import { j } from '../jscodeshift';

interface ILegacy {
  type: 'standard' | 'formulr';
  name: string;
}

const data: Record<number, ILegacy[]> = {
  7: [{ type: 'standard', name: 'Form' }],
  8: [{ type: 'standard', name: 'Upload' }],
  9: [
    { type: 'standard', name: 'Popover' },
    { type: 'standard', name: 'Select' },
    { type: 'standard', name: 'QuarterPicker' },
    { type: 'standard', name: 'TimePicker' },
    { type: 'standard', name: 'DatePicker' },
    { type: 'standard', name: 'WeekPicker' },
    { type: 'standard', name: 'MonthPicker' },
    { type: 'standard', name: 'YearPicker' },
    { type: 'standard', name: 'TimeRangePicker' },
    { type: 'standard', name: 'DateRangePicker' },
    { type: 'standard', name: 'DateRangeQuickPickerField' },
    { type: 'standard', name: 'Cascader' },
    { type: 'formulr', name: 'FormSelectField' },
    { type: 'formulr', name: 'FormQuarterPickerField' },
    { type: 'formulr', name: 'FormDatePickerField' },
    { type: 'formulr', name: 'FormDateRangePickerField' },
    { type: 'formulr', name: 'FormDateRangeQuickPickerField' },
    { type: 'formulr', name: 'FormWeekPickerField' },
    { type: 'formulr', name: 'FormMonthPickerField' },
    { type: 'formulr', name: 'FormYearPickerField' },
    { type: 'formulr', name: 'FormTimePickerField' },
    { type: 'formulr', name: 'FormTimeRangePickerField' },
  ],
};

export const transformer: Transformer = (ast, { file, target, zentImportSpecifiers }) => {
  const legacy = data[target];
  if (!legacy) {
    return;
  }

  const zentCompatImport = j.importDeclaration([], j.stringLiteral('@zent/compat'));
  const formulrImport = j.importDeclaration([], j.stringLiteral('@zent/compat/formulr/form-components'));

  let i = 0;
  const specifiers = zentImportSpecifiers.nodes();
  const { length } = specifiers;
  while (i < length) {
    const specifier = specifiers[i];
    const { name: importedname } = specifier.imported;
    const target = legacy.find(({ name }) => importedname === name);
    if (target) {
      zentImportSpecifiers.at(i).remove();
      analyze(
        importedname,
        `import from ${green(`@zent/compat${target.type === 'standard' ? '' : 'formulr/form-components'}`)}`,
        file
      );
      if (target.type === 'standard') {
        zentCompatImport.specifiers.push(
          j.importSpecifier(j.identifier(importedname), specifier.local && j.identifier(specifier.local.name))
        );
      } else {
        formulrImport.specifiers.push(
          j.importSpecifier(j.identifier(importedname), specifier.local && j.identifier(specifier.local.name))
        );
      }
    }
    i++;
  }
  if (formulrImport.specifiers.length) {
    ast.find(j.Program, (it: core.Program) => {
      it.body.unshift(formulrImport);
    });
  }
  if (zentCompatImport.specifiers.length) {
    ast.find(j.Program, (it: core.Program) => {
      it.body.unshift(zentCompatImport);
    });
  }
};
