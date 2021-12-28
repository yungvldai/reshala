import { promises as fs } from 'fs';
import path from 'path';
import exec from './utils/exec.js';

const pwd = process.cwd();

export const getOursVersion = async (file) => {
  try {
    const branch = (await exec('git branch --show-current')).trim();
    return await exec(`git show ${branch}:${file}`);
  } catch (error) {
    return null;
  }
};

export const getTheirsVersion = async (file) => {
  const mergeHeadPath = path.resolve(pwd, '.git', 'MERGE_HEAD');

  try {
    const mergeHead = await fs.readFile(mergeHeadPath, 'utf-8');
    return await exec(`git show ${mergeHead}:${file}`);
  } catch (error) {
    return null;
  }
};

export const getConflictedFiles = async () => {
  try {
    const output = (await exec('git diff --name-only --diff-filter=U')).trim();
    return output.split('\n');
  } catch (error) {
    return [];
  }
}

export const getRoot = async () => {
  try {
    return (await exec('git rev-parse --show-toplevel')).trim();
  } catch (error) {
    return null;
  }
}