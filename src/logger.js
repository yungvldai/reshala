import chalk from 'chalk';

const debug = (...args) => {
  if (!global.__isDebug) {
    return;
  }

  console.log(`[${chalk.magenta('debug')}]:`, ...args);
};

const log = (...args) => console.log(...args);

const err = (msg) => console.log(chalk.red(msg));

export default { debug, log, err };
