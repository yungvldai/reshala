import chalk from 'chalk';

import { areEqual, isArray, isObject, what } from './utils/is.js';
import semver from './utils/semver.js';
import allKeys from './utils/allKeys.js';
import { ab } from './utils/prompt.js';
import logger from './logger.js';

const checkExcluded = async (key, valueA, valueB, mergeOptions, prefix) => {
  if (valueB === undefined && valueA) {
    if (mergeOptions.includeAll) {
      return {
        has: true,
        choice: valueA
      };
    }

    if (mergeOptions.excludeAll) {
      return {
        has: true,
        choice: null
      };
    }

    logger.info(`Key ${chalk.magenta(prefix + key)} included in ours, but not included in theirs.`);

    const choice = await ab({
      message: `Include key ${chalk.magenta(prefix + key)}?`,
      a: valueA
    });

    return {
      has: true,
      choice: choice ? valueA : null
    };
  }

  if (valueA === undefined && valueB) {
    if (mergeOptions.includeAll) {
      return {
        has: true,
        choice: valueB
      };
    }

    if (mergeOptions.excludeAll) {
      return {
        has: true,
        choice: null
      };
    }

    logger.info(`Key ${chalk.magenta(prefix + key)} included in theirs, but not included in ours.`);

    const choice = await ab({
      message: `Include ${chalk.magenta(prefix + key)}?`,
      a: valueB
    });

    return {
      has: true,
      choice: choice ? valueB : null
    };
  }

  return { has: false };
};

const resolveVersion = async (pkg, versionA, versionB, depType) => {
  const parsedA = semver.parse(versionA);
  const parsedB = semver.parse(versionB);

  if (parsedA && parsedB) {
    const newer = semver.newer(parsedA, parsedB);

    if (newer) {
      return semver.create(newer);
    }
  }

  if (pkg === null) {
    logger.info(
      'The package version in ours is different from the version in theirs and it cannot be parsed.'
    );

    const choice = await ab({
      message: 'package version:',
      a: versionA,
      b: versionB
    });

    return choice;
  } else {
    logger.info(
      `The ${chalk.magenta(pkg)} (${
        depType || 'common'
      } dependency) version in ours is different from the version in theirs and it cannot be parsed.`
    );

    const choice = await ab({
      message: `Choose version of ${chalk.magenta(pkg)} (${depType || 'common'} dependency):`,
      a: versionA,
      b: versionB
    });

    return choice;
  }
};

const mergeDeps = async (key, a, b, mergeOptions) => {
  const result = {};
  let depType;

  const match = /(.*)[Dd]{1}ependencies/.exec(key);

  if (match) {
    [, depType] = match;
  }

  for (const dep of allKeys(a, b)) {
    const valueA = a[dep];
    const valueB = b[dep];

    const { has, ...excluded } = await checkExcluded(dep, valueA, valueB, mergeOptions, `${key}.`);

    if (has) {
      const { choice } = excluded;

      if (choice) {
        result[dep] = choice;
      }

      continue;
    }

    if (valueA === valueB) {
      result[dep] = valueA;
      continue;
    }

    result[dep] = await resolveVersion(dep, valueA, valueB, depType);
  }

  return result;
};

const merge = async (a, b, mergeOptions = {}, prefix = '') => {
  let result = {};

  for (const key of allKeys(a, b)) {
    const valueA = a[key];
    const valueB = b[key];

    if (mergeOptions.preMerge) {
      try {
        const preMergeResult = await mergeOptions.preMerge(key, valueA, valueB);

        if (preMergeResult) {
          result = {
            ...result,
            ...preMergeResult
          };

          continue;
        }
      } catch (error) {
        logger.debug(error);
        logger.err('An error occurred while running the driver. Please, check its source code.');
        process.exit(1);
      }
    }

    const { has, ...excluded } = await checkExcluded(key, valueA, valueB, mergeOptions, prefix);

    if (has) {
      const { choice } = excluded;

      if (choice) {
        result[key] = choice;
      }

      continue;
    }

    if (areEqual(valueA, valueB)) {
      result[key] = valueA;
      continue;
    }

    if (key === 'version' && !prefix) {
      result[key] = await resolveVersion(null, valueA, valueB);

      continue;
    }

    if (['dependencies', 'devDependencies', 'peerDependencies'].includes(key) && !prefix) {
      result = {
        ...result,
        [key]: await mergeDeps(key, valueA, valueB, mergeOptions)
      };

      continue;
    }

    if (what(valueA) !== what(valueB) || isArray(valueA)) {
      logger.info(`Keys ${chalk.magenta(prefix + key)} in ours and theirs don\`t match.`);

      const choice = await ab({
        message: `Choose value of key ${chalk.magenta(prefix + key)}:`,
        a: valueA,
        b: valueB
      });

      result[key] = choice;
      continue;
    }

    if (isObject(valueA)) {
      result = {
        ...result,
        [key]: await merge(valueA, valueB, mergeOptions, `${prefix}${key}.`)
      };

      continue;
    }

    const choice = await ab({
      message: `Choose value of key ${chalk.magenta(prefix + key)}:`,
      a: valueA,
      b: valueB
    });

    result[key] = choice;
  }

  return result;
};

export default merge;
