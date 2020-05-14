import { ZentVersion } from './zent';
import { getConfig } from './config';
import { program } from './program';

const DefaultOptions: IOptions = {
  target: ZentVersion,
  quote: 'auto',
  silent: false,
  output: false,
  color: 'javascript',
  force: false,
};

export function getOptions(): IOptions {
  const options: IOptions = { ...DefaultOptions };
  const config = getConfig();
  Object.assign(options, config?.options, pickOptions());
  return options;
}

export interface IOptions {
  target: number;
  quote: 'single' | 'double' | 'auto';
  silent: boolean;
  output: boolean;
  color: string;
  force: boolean;
}

function pickOptions() {
  const keys = Object.keys(DefaultOptions);
  const options: Partial<IOptions> = {};
  for (const key of keys) {
    if (program[key] !== undefined) {
      (options as Record<string, unknown>)[key] = program[key];
    }
  }
  return options;
}
