import merge from '../src/merge.js';

const preMerge = (key, a, b) => {
  if (key === 'stars') {
    return { [key]: Math.max(a, b) };
  }

  return null;
}

describe('driver', () => {
  it('basic', async () => {
    const packageA = {
      "name": "hello",
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "dependencies": {
        "chalk": "2.1.0",
        "commander": "1.3.1",
        "inquirer": "8.2.1"
      },
      "stars": 4
    };

    const packageB = {
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "name": "hello",
      "stars": 5,
      "dependencies": {
        "chalk": "2.1.2",
        "commander": "1.4.0",
        "inquirer": "6.4.2"
      },
    };

    const merged = await merge(packageA, packageB, { preMerge });

    expect(merged).toEqual({
      "name": "hello",
      "stars": 5,
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "dependencies": {
        "chalk": "2.1.2",
        "commander": "1.4.0",
        "inquirer": "8.2.1"
      },
    });
  });
});