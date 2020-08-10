import * as fs from 'fs-extra';
import * as path from 'path';
import commander from 'commander';
import { ZentVersion } from './zent';
import { getConfig } from './config';
import { getOptions } from './options';
import { info } from './logger';
import { run } from './master';

const transformsDir = path.join(__dirname, 'transformers');
const availableTransformers = fs
  .readdirSync(transformsDir)
  .filter(it => it.match(/\.js$/))
  .map(it => it.replace('.js', ''));

export const program = commander.version(require('../package.json').version);

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

for (const name of availableTransformers) {
  program.command(name + ' <pattern>').action((pattern: string) => {
    run([name], pattern, getOptions());
  });
}

program.command('all <glob_pattern>').action((pattern: string) => {
  run(availableTransformers, pattern, getOptions());
});

program
  .option('-s --silent', 'no stdout, default is false')
  .option('-t --target <target>', 'target verison of zent, default is ' + ZentVersion)
  .option('-o --output', 'write to output instead of overwriting files')
  .option('-f --force', 'skip check for git working tree')
  .option('-q --quote', 'tells code generator which style of quote to use');
