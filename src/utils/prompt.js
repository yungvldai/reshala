import inquirer from 'inquirer';
import chalk from 'chalk';

import { isPrimitive } from './is.js';

export const ab = async (params) => {
  const { message, skip = false } = params;

  if (skip) {
    return params.a;
  }

  console.log(chalk.magenta('a:'), params.a);
  console.log(chalk.cyan('b:'), chalk.gray(params.b || 'nothing'));

  const choices = ['a', 'b'].reduce((acc, choice) => {
    const value = params[choice] || chalk.gray('nothing');
    const name = isPrimitive(value) ? value : JSON.stringify(value);

    return [
      ...acc,
      {
        key: choice,
        name,
        value
      }
    ];
  }, []);

  try {
    const { answer } = await inquirer.prompt({
      name: 'answer',
      message,
      type: 'expand',
      default: 2,
      choices
    });

    return answer;
  } catch (error) {
    console.log(
      'Cannot create question. Check `inquirer` (npm package) support in your environment.'
    );
    process.exit(1);
  }
};
