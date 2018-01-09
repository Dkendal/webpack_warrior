import fs = require('fs');
import MemoryFileSystem = require('memory-fs');
import Module = require('module');
import {printReceived, printExpected} from 'jest-matcher-utils';
import {Stats} from 'webpack';
import compile from './compile';
import createCompiler from './createCompiler';
import setupExample from './setupExample';

require('pretty-error').start();

function isWebpackStats(x: any): x is Stats {
  if (x.constructor && x.constructor.name === 'Stats') {
    return true;
  }
  return false;
}

expect.extend({
  toOutputFile(actual: Map<string, Module>, localpath: string) {
    expect(actual).toBeInstanceOf(Map);

    const module = actual.get(localpath);

    if (!module) {
      return {
        pass: false,
        message() {
          return (
            'I Expected to find:\n' +
            `  ${printExpected(localpath)}\n` +
            'in the list of outputted files, Instead I found:\n' +
            `  ${printReceived([...actual.keys()])}`
          );
        },
      };
    }

    return {
      pass: true,
      message() {
        return '';
      },
    };
  },

  toExport(actual: Map<string, Module>, localpath: string, matcher: Function) {
    try {
      expect(actual).toOutputFile(localpath);

      const module = actual.get(localpath);

      if (!module) {
        throw new Error();
      }

      expect(module.exports).toEqual(matcher);

      return {
        pass: true,
        message() {
          return '';
        },
      };
    } catch ({message}) {
      return {
        pass: false,
        message() {
          return message;
        },
      };
    }
  },

  toBeValid(actual: any) {
    if (!isWebpackStats(actual)) {
      return {
        pass: false,
        message: () =>
          `Expected the result of a webpack compiler (webpack.Stats)\n` +
          'Received:\n' +
          `  ${printReceived(JSON.stringify(actual))}`,
      };
    }

    function message(): string {
      let buff: string[] = [];

      if (actual.hasErrors()) {
        buff.push('Webpack finished with errors:');
      }

      actual.compilation.errors.forEach((err: Error) => {
        buff.push(`  ${printReceived(err.message)}`);
      });

      if (actual.hasWarnings()) {
        buff.push('Webpack finished with warnings:');
      }

      return buff.join('\n');
    }

    return {
      message,
      pass: !(actual.hasErrors() || actual.hasWarnings()),
    };
  },
});

const cwd = process.cwd();

afterEach(() => {
  process.chdir(cwd);
});

test('entries are the starting point for your library', async () => {
  const config = await setupExample('1');
  const compiler = createCompiler(config);
  expect(await compiler.run()).toBeValid();
});

test('output allows you to write to a specific file', async () => {
  const config = await setupExample('2');
  const compiler = createCompiler(config);
  const stats = await compiler.run();
  expect(stats).toBeValid();
  expect(compile(stats)).toOutputFile('myAwesomeLib.js');
});

test('library targets allow you to create packages that can be reused', async () => {
  const config = await setupExample('3');
  const compiler = createCompiler(config);
  const stats = await compiler.run();
  expect(stats).toBeValid();
  expect(compile(stats)).toExport(
    'main.js',
    expect.stringMatching('hello world')
  );
});
