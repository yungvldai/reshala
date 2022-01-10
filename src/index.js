import chalk from 'chalk';
import path, { dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { Command } from 'commander/esm.mjs';
import checkForUpdate from 'update-check';

import { getOursVersion, getRoot, getTheirsVersion } from './git.js';
import merge from './merge.js';
import getPackages from './packages.js';
import logger from './logger.js';

const run = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const reshalaPackagePath = path.resolve(__dirname, '../package.json');

  let pkg;

  try {
    pkg = JSON.parse(await fs.readFile(reshalaPackagePath, 'utf-8'));
  } catch (error) {
    logger.err('Something went wrong. Please, reinstall package using `npm i -g reshala`.');
    process.exit(1);
  }

  const version = pkg.version;

  try {
    const result = await checkForUpdate(pkg);

    if (result) {
      logger.log(
        `Update available ${chalk.red(version)} → ${chalk.green(result.latest)}. Please, update.`
      );
    }
  } catch (err) {
    // do nothing
  }

  const program = new Command();

  program
    .option('-i, --include-all', 'include all conflicted lines')
    .option('-e, --exclude-all', 'exclude all conflicted lines')
    .option('-d, --debug', 'run in debug mode')
    .version(version, '-v, --version', 'print reshala version')
    .action(async (options) => {
      const { includeAll = false, excludeAll = false, debug = false } = options;

      if (debug) {
        global.__isDebug = true;
      }

      const mergeOptions = {
        includeAll,
        excludeAll
      };

      let gitRoot;

      if (includeAll && excludeAll) {
        logger.err('Please, choose one.');
        process.exit(1);
      }

      try {
        gitRoot = await getRoot();
      } catch (error) {
        logger.debug(error);
        logger.err('Cannot get git root.');
        process.exit(1);
      }

      const packages = await getPackages();

      if (packages.length < 1) {
        logger.log('No conflicted `package.json` files.');
        process.exit(0);
      }

      logger.log(`${chalk.yellow(packages.length)} conflicted packages.`);

      for (const pkg of packages) {
        logger.log(chalk.blue(pkg));

        try {
          const ours = JSON.parse(await getOursVersion(pkg));
          const theirs = JSON.parse(await getTheirsVersion(pkg));

          const merged = await merge(ours, theirs, mergeOptions);
          const jsonString = JSON.stringify(merged, null, 2);

          await fs.writeFile(path.resolve(gitRoot, pkg), jsonString);

          logger.log(chalk.green('Merged.'));
        } catch (error) {
          logger.debug(error);
          logger.log(chalk.yellow('Skipped.'));
        }
      }

      logger.log('🤝 Thank you for using `reshala`. Have a nice day!');
    });

  program.parse(process.argv);
};

export default run;
