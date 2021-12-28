const regex =
  /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;

const create = ({ major, minor, patch, pre }) => {
  return `${major}.${minor}.${patch}` + (Boolean(pre) ? `-${pre}` : '');
};

const newer = (a, b) => {
  if (a.major !== b.major) {
    return a.major > b.major ? a : b;
  }

  if (a.minor !== b.minor) {
    return a.minor > b.minor ? a : b;
  }

  if (a.patch !== b.patch) {
    return a.patch > b.patch ? a : b;
  }

  if (a.pre && b.pre) {
    return null;
  }

  if (a.pre && !b.pre) {
    return b;
  }

  return a;
};

const parse = (string) => {
  const result = regex.exec(string);

  if (!result) {
    return null;
  }

  const [, major, minor, patch, pre] = result;

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    pre
  };
};

const prepare = (string) => {
  return string.replace(/[~^]/g, '');
}

export default {
  parse,
  newer,
  create,
  prepare
};
