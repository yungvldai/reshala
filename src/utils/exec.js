import { exec as originalExec } from 'child_process';

const execParams = {
  stdio: ['pipe', 'pipe', 'ignore']
};

const exec = (command) => {
  return new Promise((resolve, reject) => {
    originalExec(command, execParams, (error, stdout) => {
      if (error) {
        reject(error);
      }

      resolve(stdout instanceof Buffer ? stdout.toString('utf-8') : stdout);
    });
  });
};

export default exec;
