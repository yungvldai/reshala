import chalk from 'chalk';

import { areEqual, isArray, isObject, what } from './utils/is.js';
import semver from './utils/semver.js';
import allKeys from './utils/allKeys.js';
import { ab } from './utils/prompt.js';

const checkExcluded = async (key, valueA, valueB, mergeOptions, prefix) => {
  if (valueB === undefined && valueA) {
    if (mergeOptions.include) {
      return {
        has: true,
        choice: valueA
      };
    }

    console.log(
      `Key ${chalk.blue(
        prefix + key
      )} included in ours, but not included in theirs. What to include?`
    );

    const choice = await ab({
      message: `${key}:`,
      a: valueA
    });

    return {
      has: true,
      choice: choice === 'nothing' ? null : choice
    };
  }

  if (valueA === undefined && valueB) {
    if (mergeOptions.include) {
      return {
        has: true,
        choice: valueB
      };
    }

    console.log(
      `Key ${chalk.blue(
        prefix + key
      )} included in theirs, but not included in ours. What to include?`
    );

    const choice = await ab({
      message: `${key}:`,
      a: valueB
    });

    return {
      has: true,
      choice: choice === 'nothing' ? null : choice
    };
  }

  return { has: false };
};

const resolveVersion = async (pkg, versionA, versionB) => {
  const parsedA = semver.parse(versionA);
  const parsedB = semver.parse(versionB);

  if (parsedA && parsedB) {
    const newer = semver.newer(parsedA, parsedB);

    if (newer) {
      return semver.create(newer);
    }
  }

  if (pkg === 'root') {
    console.log(
      'The package version in ours is different from the package version in theirs. And it cannot be parsed.'
    );
  } else {
    console.log(
      `The ${chalk.blue(pkg)} version in ours is different from the ${chalk.blue(
        pkg
      )} version in theirs. And it cannot be parsed.`
    );
  }

  const choice = await ab({
    message: pkg === 'root' ? 'version:' : `version of ${pkg}:`,
    a: versionA,
    b: versionB
  });

  return choice;
};

const mergeDeps = async (key, a, b, mergeOptions) => {
  const result = {};

  for (const dep of allKeys(a, b)) {
    const valueA = a[dep];
    const valueB = b[dep];

    const { has, ...excluded } = await checkExcluded(dep, valueA, valueB, mergeOptions, key);

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

    result[dep] = await resolveVersion(dep, valueA, valueB);
  }

  return result;
};

const merge = async (a, b, mergeOptions, prefix = '') => {
  let result = {};

  for (const key of allKeys(a, b)) {
    const valueA = a[key];
    const valueB = b[key];

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
      result[key] = await resolveVersion('root', valueA, valueB);

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
      console.log(`Keys ${chalk.blue(prefix + key)} in ours and theirs don\`t match.`);

      const choice = await ab({
        message: `${prefix}${key}:`,
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
      message: `${prefix}${key}:`,
      a: valueA,
      b: valueB
    });

    result[key] = choice;
  }

  return result;
};

export default merge;
