import chalk from 'chalk';

const app = chalk.gray('[reshala]');

const debug = (...args) => {
  if (!global.__isDebug) {
    return;
  }

  console.log(app, `[${chalk.magenta('debug')}]:`, ...args);
};

const info = (...args) => console.log(app, ...args);

const warn = (...args) => console.log(app, chalk.yellow('WARN!'), ...args);

const err = (...args) => console.log(app, chalk.red('ERR!'), ...args);

export default { debug, info, err, warn };
