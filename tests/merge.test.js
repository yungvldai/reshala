import merge from '../src/merge.js';

describe('merge', () => {
  it('basic', async () => {
    const merged = await merge({}, {});

    expect(merged).toEqual({});
  });

  it('deps', async () => {
    const packageA = {
      dependencies: {
        react: '16.0.3',
        redux: '7.4.1'
      }
    };

    const packageB = {
      dependencies: {
        react: '17.0.2',
        redux: '6.2.4'
      }
    };

    const merged = await merge(packageA, packageB);

    expect(merged).toEqual({
      dependencies: {
        react: '17.0.2',
        redux: '7.4.1'
      }
    });
  });

  it('version', async () => {
    const packageA = {
      name: 'test-package',
      version: '1.2.0',
      dependencies: {
        react: '16.0.3',
        redux: '7.4.1'
      }
    };

    const packageB = {
      name: 'test-package',
      version: '3.2.1',
      dependencies: {
        react: '17.0.2',
        redux: '6.2.4'
      }
    };

    const merged = await merge(packageA, packageB);

    expect(merged).toEqual({
      name: 'test-package',
      version: '3.2.1',
      dependencies: {
        react: '17.0.2',
        redux: '7.4.1'
      }
    });
  });

  it('include all', async () => {
    const packageA = {
      name: 'test-package',
      version: '1.2.0',
      dependencies: {
        react: '16.0.3',
      }
    };

    const packageB = {
      name: 'test-package',
      dependencies: {
        react: '17.0.2',
        redux: '6.2.4'
      }
    };

    const merged = await merge(packageA, packageB, { includeAll: true });

    expect(merged).toEqual({
      name: 'test-package',
      version: '1.2.0',
      dependencies: {
        react: '17.0.2',
        redux: '6.2.4'
      }
    });
  });

  it('exclude all', async () => {
    const packageA = {
      name: 'test-package',
      version: '1.2.0',
      dependencies: {
        react: '16.0.3',
      }
    };

    const packageB = {
      name: 'test-package',
      dependencies: {
        react: '17.0.2',
        redux: '6.2.4'
      }
    };

    const merged = await merge(packageA, packageB, { excludeAll: true });

    expect(merged).toEqual({
      name: 'test-package',
      dependencies: {
        react: '17.0.2',
      }
    });
  });

  it('real package', async () => {
    const packageA = {
      "name": "reshala",
      "version": "5.0.0",
      "description": "Tool to merge package.json`s",
      "main": "index.js",
      "type": "module",
      "bin": {
        "reshala": "./bin/reshala.js"
      },
      "author": {
        "name": "Vladislav Ivanov",
        "email": "vladivanov.dev@gmail.com",
      },
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "dependencies": {
        "chalk": "4.1.0",
        "commander": "8.3.0",
        "inquirer": "1.2.0"
      },
      "devDependencies": {
        "prettier": "2.5.1"
      }
    };

    const packageB = {
      "name": "reshala",
      "version": "4.3.0-pre",
      "description": "Tool to merge package.json`s",
      "main": "index.js",
      "scripts": {
        "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
        "format": "prettier --write src/"
      },
      "author": {
        "name": "Vladislav Ivanov",
        "email": "vladivanov.dev@gmail.com",
        "url": "https://yungvldai.ru"
      },
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "dependencies": {
        "chalk": "2.1.0",
        "commander": "1.3.0",
        "inquirer": "8.2.0"
      },
      "engines": {
        "node": ">= 13"
      },
      "devDependencies": {
        "jest": "27.4.5",
        "prettier": "2.5.1"
      }
    };

    const result = {
      "name": "reshala",
      "version": "5.0.0",
      "description": "Tool to merge package.json`s",
      "main": "index.js",
      "type": "module",
      "bin": {
        "reshala": "./bin/reshala.js"
      },
      "scripts": {
        "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
        "format": "prettier --write src/"
      },
      "author": {
        "name": "Vladislav Ivanov",
        "email": "vladivanov.dev@gmail.com",
        "url": "https://yungvldai.ru"
      },
      "license": "ISC",
      "repository": {
        "type": "git",
        "url": "https://github.com/yungvldai/reshala"
      },
      "dependencies": {
        "chalk": "4.1.0",
        "commander": "8.3.0",
        "inquirer": "8.2.0"
      },
      "engines": {
        "node": ">= 13"
      },
      "devDependencies": {
        "jest": "27.4.5",
        "prettier": "2.5.1"
      }
    };    

    const merged = await merge(packageA, packageB, { includeAll: true });

    expect(merged).toEqual(result);
  })

});