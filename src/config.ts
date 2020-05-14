import * as fs from 'fs-extra';
import globby from 'globby';
import { IOptions } from '.';
import { info } from './logger';

export interface IConfiguration {
  pattern?: string;
  transformers?: string[];
  options?: IOptions;
}

let config: IConfiguration | null = null;
let loaded = false;

export function getConfig() {
  if (!loaded) {
    load();
  }
  return config;
}

function load() {
  const [configFile] = globby.sync('**/zent-codemod.json', {
    gitignore: true,
  });
  if (configFile && fs.existsSync(configFile)) {
    try {
      config = require(configFile);
      info('using config file ' + configFile);
    } catch (e) {
      // ignore
    }
  }
  loaded = true;
}
