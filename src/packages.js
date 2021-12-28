import path from 'path';
import { getConflictedFiles } from "./git.js";

const getPackages = async () => {
  const conflicted = await getConflictedFiles();

  return conflicted.reduce((acc, file) => {
    if (path.basename(file) === 'package.json') {
      return [
        ...acc,
        file
      ];
    }

    return acc;
  }, []);
}

export default getPackages;