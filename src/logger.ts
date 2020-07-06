import chalk from 'chalk';

const silent = process.argv.includes('--silent') || process.argv.includes('-s');

export function info(msg: string) {
  silent || console.log(chalk.yellow('info: ') + msg);
}

export function plain(msg: string) {
  silent || console.log(msg);
}

export function br() {
  silent || console.log('');
}

export function warn(msg: string) {
  silent || console.log(chalk.yellow('WARNING: ') + msg);
}
