export const isObject = (check) => {
  return check && typeof check === 'object' && !Array.isArray(check);
};

export const isArray = (check) => {
  return Array.isArray(check);
};

export const isPrimitive = (check) => check !== Object(check);

export const what = (check) => {
  if (isObject(check)) {
    return 'object';
  }

  if (isArray(check)) {
    return 'array';
  }

  return 'primitive';
};

export const areEqual = (a, b) => {
  if (isPrimitive(a) !== isPrimitive(b)) {
    return false;
  }

  if (isPrimitive(a)) {
    return a === b;
  }

  if (isArray(a) !== isArray(b)) {
    return false;
  }

  if (isArray(a)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i += 1) {
      if (!areEqual(a[i], b[i])) {
        return false;
      }
    }
  }

  if (isObject(a) !== isObject(b)) {
    return false;
  }

  if (isObject(a)) {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    for (const key in a) {
      if (!areEqual(a[key], b[key])) {
        return false;
      }
    }
  }

  return true;
};
