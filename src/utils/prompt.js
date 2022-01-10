import inquirer from 'inquirer';
import chalk from 'chalk';

import { isPrimitive } from './is.js';
import logger from '../logger.js';

export const ab = async (params) => {
  const { message, a, b } = params;

  if (a && b) {
    logger.log(chalk.magenta('a:'), a);
    logger.log(chalk.cyan('b:'), b);
  }

  try {
    if (!b) {
      const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'expand',
        default: 2,
        choices: [
          { key: 'y', name: 'yes', value: true },
          { key: 'n', name: 'no', value: false }
        ]
      });

      return answer;
    }

    const { answer } = await inquirer.prompt({
      name: 'answer',
      message,
      type: 'expand',
      default: 2,
      choices: [
        { key: 'a', name: isPrimitive(a) ? a : JSON.stringify(a), value: a },
        { key: 'b', name: isPrimitive(b) ? b : JSON.stringify(b), value: b }
      ]
    });

    return answer;
  } catch (error) {
    logger.err(
      'Cannot create question. Check `inquirer` (npm package) support in your environment.'
    );
    process.exit(1);
  }
};
