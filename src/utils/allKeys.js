const allKeys = (...args) => {
  return [...new Set(args.reduce((acc, object) => [...acc, ...Object.keys(object)], []))];
};

export default allKeys;
