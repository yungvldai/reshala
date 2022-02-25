import chalk from 'chalk';
import path, { dirname } from 'path';
import { createRequire } from 'module';
import vm from 'vm';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { Command } from 'commander/esm.mjs';
import checkForUpdate from 'update-check';

import { getOursVersion, getRoot, getTheirsVersion } from './git.js';
import merge from './merge.js';
import getPackages from './packages.js';
import logger from './logger.js';
import exec from './utils/exec.js';
import { ab } from './utils/prompt.js';

const pwd = process.cwd();

const driverContext = {
  logger,
  chalk,
  $: exec,
  ab
};

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
      logger.info(
        `Update available ${chalk.red(version)} → ${chalk.green(result.latest)}. Please, update.`
      );
    }
  } catch (error) {
    // do nothing
  }

  const program = new Command();

  program
    .option('-i, --include-all', 'include all lines that are in ours/theirs but not in the other')
    .option('-e, --exclude-all', 'exclude all lines that are in ours/theirs but not in the other')
    .option('-d, --driver <path>', 'use custom driver to merge files')
    .option('-d, --debug', 'run in debug mode')
    .version(version, '-v, --version', 'print reshala version')
    .action(async (options) => {
      const { includeAll = false, excludeAll = false, debug = false, driver } = options;

      if (debug) {
        global.__isDebug = true;
      }

      let preMerge = null;

      if (driver) {
        try {
          const driverFullPath = path.isAbsolute(driver) ? driver : path.resolve(pwd, driver);
          preMerge = vm.runInNewContext(await fs.readFile(driverFullPath, 'utf-8'), {
            ...driverContext,
            require: createRequire(`file://${driverFullPath}`)
          });
        } catch (error) {
          logger.debug(error);
          logger.err('Cannot read or compile driver.');
          process.exit(1);
        }

        if (typeof preMerge !== 'function') {
          logger.err('Driver must be a function!');
          process.exit(1);
        }

        if (preMerge.length > 3) {
          logger.err('Driver takes at most 3 arguments!');
          process.exit(1);
        }
      }

      const mergeOptions = {
        includeAll,
        excludeAll,
        preMerge
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
        logger.info('No conflicted `package.json` files.');
        process.exit(0);
      }

      logger.info(`${chalk.yellow(packages.length)} conflicted packages.`);

      for (const pkg of packages) {
        logger.info(chalk.blue(pkg));

        try {
          const ours = JSON.parse(await getOursVersion(pkg));
          const theirs = JSON.parse(await getTheirsVersion(pkg));

          const merged = await merge(ours, theirs, mergeOptions);
          const jsonString = JSON.stringify(merged, null, 2);

          await fs.writeFile(path.resolve(gitRoot, pkg), jsonString);

          logger.info(chalk.green('Merged.'));
        } catch (error) {
          logger.debug(error);
          logger.warn('Skipped.');
        }
      }

      logger.info('🤝 Thank you for using `reshala`. Have a nice day!');
    });

  program.parse(process.argv);
};

export default run;
