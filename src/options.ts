import { ZentVersion } from './zent';
import { getConfig } from './config';
import { program } from './program';

export function getOptions(): IOptions {
  const options: IOptions = {
    target: ZentVersion,
    quote: 'auto',
    silent: false,
    output: false,
    color: 'javascript',
  };
  const config = getConfig();
  Object.assign(options, config?.options, {
    target: Number(program.target || ZentVersion),
    silent: program.silent,
    quote: program.quote,
    output: program.output,
    color: program.color,
  });
  return options;
}

export interface IOptions {
  target: number;
  quote: 'single' | 'double' | 'auto';
  silent: boolean;
  output: boolean;
  color: string;
}
