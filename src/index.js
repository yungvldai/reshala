import chalk from 'chalk';
import path, { dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { Command } from 'commander/esm.mjs';

import { getOursVersion, getRoot, getTheirsVersion } from './git.js';
import merge from './merge.js';
import getPackages from './packages.js';

const run = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const reshalaPackagePath = path.resolve(__dirname, '../package.json');

  let version;

  try {
    const reshalaPackage = JSON.parse(await fs.readFile(reshalaPackagePath, 'utf-8'));
    version = reshalaPackage.version;
  } catch (error) {
    console.log('Something went wrong. Please, reinstall package using `npm i -g reshala`.');
    process.exit(1);
  }

  const program = new Command();

  program
    .option('-i, --include', 'include all conflicted lines')
    .version(version, '-v, --version', 'print reshala version')
    .action(async (options) => {
      const { include = false } = options;

      const mergeOptions = {
        include
      };

      const gitRoot = await getRoot();

      if (!gitRoot) {
        console.log('Cannot get git root.');
        process.exit(1);
      }

      const packages = await getPackages();

      for (const pkg of packages) {
        console.log(chalk.yellow(pkg));

        try {
          const ours = JSON.parse(await getOursVersion(pkg));
          const theirs = JSON.parse(await getTheirsVersion(pkg));

          const merged = await merge(ours, theirs, mergeOptions);
          const json = JSON.stringify(merged, null, 2);

          await fs.writeFile(path.resolve(gitRoot, pkg), json);

          console.log(chalk.green('OK!'));
        } catch (error) {
          console.log('Skipped.');
        }
      }
    });

  program.parse(process.argv);
};

export default run;
