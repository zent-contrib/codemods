import { Falsey } from 'utility-types';
import { program } from './program';

program.parse(process.argv);

declare global {
  /* eslint-disable-next-line @typescript-eslint/interface-name-prefix */
  interface Array<T> {
    /* eslint-disable-next-line no-undef */
    filter(cb: typeof Boolean): Exclude<T, Falsey>[];
  }
}
