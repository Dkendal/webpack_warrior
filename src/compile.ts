import Module = require('module');
import babylon = require('babylon');
import * as _ from 'lodash';
import * as path from 'path';
import {Configuration, Stats, CachedSource} from 'webpack';

export default function compile(stats: Stats) {
  const {compilation: {assets, compiler: {outputPath}}} = stats;

  return _(assets)
    .toPairs()
    .map(([localpath, cachedSource]: [string, CachedSource]) => {
      const {_cachedSource: source, existsAt} = cachedSource;
      const mod = new Module(localpath);
      mod.paths = module.paths;
      const ast = babylon.parse(source, {sourceType: 'module'});
      mod._compile(source, path.basename(localpath));
      const augmentedModule = {...mod, ast};
      return [localpath, augmentedModule] as [string, typeof augmentedModule];
    })
    .thru(x => new Map(x))
    .value();
}
