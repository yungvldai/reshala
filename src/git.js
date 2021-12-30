import { promises as fs } from 'fs';
import path from 'path';
import logger from './logger.js';
import exec from './utils/exec.js';

export const getRoot = async () => {
  return (await exec('git rev-parse --show-toplevel')).trim();
};

export const getOursVersion = async (file) => {
  const branch = await exec('git branch --show-current');

  if (!branch) {
    // e.g. detached HEAD
    throw new Error('detached HEAD');
  }

  return exec(`git show ${branch.trim()}:${file.trim()}`);
};

export const getTheirsVersion = async (file) => {
  const gitRoot = await getRoot();
  const mergeHeadPath = path.resolve(gitRoot, '.git', 'MERGE_HEAD');
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
