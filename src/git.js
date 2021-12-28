import { promises as fs } from 'fs';
import path from 'path';
import logger from './logger.js';
import exec from './utils/exec.js';

const pwd = process.cwd();

export const getOursVersion = async (file) => {
  const branch = await exec('git branch --show-current');
  return exec(`git show ${branch.trim()}:${file.trim()}`);
};

export const getTheirsVersion = async (file) => {
  const mergeHeadPath = path.resolve(pwd, '.git', 'MERGE_HEAD');
  const mergeHead = await fs.readFile(mergeHeadPath, 'utf-8');
  return exec(`git show ${mergeHead.trim()}:${file.trim()}`);
};

export const getConflictedFiles = async () => {
  try {
    const output = (await exec('git diff --name-only --diff-filter=U')).trim();
    return output.split('\n');
  } catch (error) {
    logger.debug(error);
    return [];
  }
};

export const getRoot = async () => {
  try {
    return (await exec('git rev-parse --show-toplevel')).trim();
  } catch (error) {
    logger.debug(error);
    return null;
  }
};
