import * as fs from 'fs-extra';
import * as path from 'path';
import commander from 'commander';
import { Falsey } from 'utility-types';
import { ZentVersion } from './version';
import { getConfig } from './config';
import { info } from './logger';
import { run } from './master';

const program = commander.version('0.0.1');

function getOptions(): IOptions {
  const options: IOptions = {
    target: ZentVersion,
    quote: 'auto',
    silent: false,
    output: false,
    color: true,
  };
  const config = getConfig();
  Object.assign(options, config?.options, {
    target: Number(program.target),
    silent: program.silent,
    quote: program.quote,
    output: program.output,
  });
  return options;
}

interface IOptions {
  target: number;
  quote: 'single' | 'double' | 'auto';
  silent: boolean;
  output: boolean;
  color: boolean;
}

/* eslint-disable-next-line no-undef */
export { getOptions, IOptions };

const transformsDir = path.join(__dirname, 'transformers');
const allTransformers = fs
  .readdirSync(transformsDir)
  .filter(it => it.match(/\.js$/))
  .map(it => it.replace('.js', ''));

program.action(() => {
  const config = getConfig();
  if (!config) {
    info('no available config file, exit immediately.');
    process.exit(1);
  }
  const { pattern, transformers } = config;
  const options = getOptions();

  if (!pattern) {
    info('no available pattern, exit immediately.');
    process.exit(1);
  }

  if (!transformers) {
    info('no available transformers, exit immediately.');
    process.exit(1);
  }

  run(transformers, pattern, options);
});

for (const name of allTransformers) {
  program.command(name + ' <pattern>').action((pattern: string) => {
    run([name], pattern, getOptions());
  });
}

program.command('all <glob_pattern>').action((pattern: string) => {
  run(allTransformers, pattern, getOptions());
});

program
  .option('-s --silent', 'no stdout, default is false')
  .option('-t --target <target>', 'target verison of zent, default is ' + ZentVersion)
  .option('-o --output', 'write to output instead of overwriting files')
  .option('-c --color', 'highlight output')
  .option('-q --quote', 'tells code generator which style of quote to use');

program.parse(process.argv);

declare global {
  /* eslint-disable-next-line @typescript-eslint/interface-name-prefix */
  interface Array<T> {
    /* eslint-disable-next-line no-undef */
    filter(cb: typeof Boolean): Exclude<T, Falsey>[];
  }
}
