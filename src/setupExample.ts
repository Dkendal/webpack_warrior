import * as path from 'path';

export default async function setupExample(exampleName: string) {
  const dir = path.join(__dirname, '../examples/', exampleName);
  const webpackConfig = path.join(dir, 'webpack.config');
  const configuration = await require(webpackConfig);
  process.chdir(dir);
  return configuration;
}
