import { jest } from '@jest/globals';
import { ab } from '../src/utils/prompt.js';
import inquirer from 'inquirer';

jest.mock('inquirer');

describe('cli', () => {
  it('basic', async () => {
    expect.assertions(1);
    inquirer.prompt = jest.fn().mockResolvedValue({ answer: 'test' });

    await expect(ab({ message: 'test' })).resolves.toEqual('test');
  });
});