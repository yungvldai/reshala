import { jest } from '@jest/globals';
import { ab } from '../src/utils/prompt.js';
import logger from '../src/logger.js';
import inquirer from 'inquirer';

jest.mock('inquirer');

describe('cli', () => {
  it('basic', async () => {
    expect.assertions(1);
    inquirer.prompt = jest.fn().mockResolvedValue({ answer: 'test' });

    await expect(ab({ message: 'test' })).resolves.toEqual('test');
  });

  it('error', async () => {
    logger.err = jest.fn();
    process.exit = jest.fn();

    inquirer.prompt = jest.fn().mockRejectedValue(new Error());

    await ab({ message: test });

    expect(logger.err).toHaveBeenCalledWith('Cannot create question. Check `inquirer` (npm package) support in your environment.');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});