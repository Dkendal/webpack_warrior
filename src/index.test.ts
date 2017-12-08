import * as bluebird from 'bluebird';
import * as path from 'path';
import {Configuration, Stats} from 'webpack';
import {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  SUGGEST_TO_EQUAL,
  ensureNoExpected,
  ensureNumbers,
  matcherHint,
  printReceived,
  printExpected,
  printWithType,
} from 'jest-matcher-utils';

declare module 'webpack' {
  interface Stats {
    compilation: {errors: Error[]};
  }
}

type webpack = (config: Configuration) => bluebird<Stats>;

const webpack: webpack = bluebird.promisify(require('webpack'));

function isWebpackStats(x: any): x is Stats {
  if (x.constructor && x.constructor.name === 'Stats') {
    return true;
  }
  return false;
}

expect.extend({
  toBeValid(actual: any) {
    if (!isWebpackStats(actual)) {
      return {
        pass: false,
        message: () =>
          `Expected the result of a webpack compiler (webpack.Stats)\n` +
          'Received:\n' +
          `${  printReceived(JSON.stringify(actual))}`,
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

test("entry's are the starting point for your library", async () => {
  const configuration: Configuration = {
    context: path.resolve(__dirname, '../examples/javascript'),
    entry: './entry.js',
    output: {
      path: '/tmp',
    },
  };

  expect(await webpack(configuration)).toBeValid();
});
