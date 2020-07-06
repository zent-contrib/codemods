/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const v7Dir = './test/v7';
const v8Dir = './test/v8';

const v7 = fs.readdirSync(v7Dir);
const v8 = fs.readdirSync(v8Dir);

/**
 *
 * @param {string} dir
 * @param {string[]} files
 * @param {string} args
 */
function test(dir, files, args) {
  for (const file of files) {
    execSync(`node ./dist/index.js ${file.replace('.js', '')} ${path.join(dir, file)} ${args}`, {
      stdio: 'inherit',
    });
  }
}

test(v7Dir, v7, '-t 7 -o -f -s');
test(v8Dir, v8, '-t 8 -o -f');
