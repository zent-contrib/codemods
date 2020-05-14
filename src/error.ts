import { info } from './logger';
import { red } from 'chalk';

export const errors: string[] = [];

export function pushError(msg: string) {
  errors.push(red('X') + ' ' + msg);
}

export function printError() {
  if (errors.length) {
    info('Some error occured during transform: ');
  }
  for (const error of errors) {
    console.log(error);
  }
}
