import chalk from 'chalk';

const silent = process.argv.includes('--silent') || process.argv.includes('-s');

export function info(msg: string) {
  silent || console.log(chalk.yellow('info: ') + msg);
}
