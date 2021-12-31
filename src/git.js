import { promises as fs } from 'fs';
import path from 'path';
import logger from './logger.js';
import exec from './utils/exec.js';

export const getRoot = async () => {
  return (await exec('git rev-parse --show-toplevel')).trim();
};

export const getOursVersion = async (file) => {
  const branch = (await exec('git branch --show-current')).trim();

  if (!branch) {
    // e.g. detached HEAD
    throw new Error('detached HEAD');
  }

  return exec(`git show ${branch}:${file}`);
};

export const getTheirsVersion = async (file) => {
  const gitRoot = await getRoot();
  const mergeHeadPath = path.resolve(gitRoot, '.git', 'MERGE_HEAD');
  const mergeHead = (await fs.readFile(mergeHeadPath, 'utf-8')).trim();
  return exec(`git show ${mergeHead}:${file}`);
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
