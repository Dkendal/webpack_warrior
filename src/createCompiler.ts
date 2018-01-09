import _ = require('lodash');
import webpack = require('webpack');
import MemoryFileSystem = require('memory-fs');
import {promisify} from 'bluebird';

type Path = string;

declare module 'webpack' {
  interface CachedSource {
    _cachedSource: string;
    existsAt: Path;
  }
  interface Stats {
    compilation: {
      errors: Error[];
      compiler: Compiler;
      assets: {[filename: string]: CachedSource};
    };
  }
  interface Compiler {
    outputPath: string;
    run(): Stats;
  }
}

let mfs: MemoryFileSystem;

webpack.Compiler.prototype.run = promisify(
  webpack.Compiler.prototype.run
) as any;

function load(
  c: webpack.MultiCompiler | webpack.Compiler,
  options = {}
): webpack.Compiler {
  if (c instanceof webpack.Compiler) {
    c.outputFileSystem = mfs;
  } else if (c instanceof webpack.MultiCompiler) {
    throw new Error("MultiCompiler isn't supported yet.");
  }
  return c;
}

// Purge all compiled assets between test builds.
beforeEach(() => {
  mfs = new MemoryFileSystem();
});

const createCompiler = _.flow(webpack, load);

export default createCompiler;
