const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const { validate } = require('schema-utils');
// 专用于匹配文件列表的库
const globby = require('globby');
const webpack = require('webpack');

const schema = require('./schema.json');
const readFile = promisify(fs.readFile);
const { RawSource } = webpack.sources;
class CopyWebpackPlugin {
  constructor(options = {}) {
    // 验证options是否符合规范
    validate(schema, options, {
      name: 'CopyWebpackPlugin',
    });

    this.options = options;
  }

  apply(compiler) {
    // 初始化compilation
    compiler.hooks.thisCompilation.tap('CopyWebpackPlugin', compilation => {
      // 添加资源的hooks
      compilation.hooks.additionalAssets.tapAsync('CopyWebpackPlugin', async cb => {
        // 将from中的资源复制到to中
        const { from, ignore } = this.options;
        const to = this.options.to ? this.options.to : '.';
        // 1.读取from中所有的资源
        // context就是webpack配置
        const context = compiler.options.context;
        // 将输入路径变成绝对路径
        let absoluteFrom = path.isAbsolute(from) ? from : path.resolve(context, from);
        absoluteFrom = absoluteFrom.replace(/\\/g, '/');

        // 2.过滤掉要ignore的文件
        // globby(要处理的文件夹，options)
        const paths = await globby(absoluteFrom, { ignore });

        // 3.读取paths中所有的资源
        const files = await Promise.all(
          paths.map(async absolutePath => {
            // 读取文件
            const data = await readFile(absolutePath);
            const relativePath = path.basename(absolutePath);
            // 若to不为默认值，则更改filename的值
            const filename = path.join(to, relativePath);
            return {
              // 文件数据
              data,
              // 文件名称
              filename,
            };
          })
        );

        // 4.生成webpack格式的资源
        const assets = files.map(file => {
          const source = new RawSource(file.data);
          return {
            source,
            filename: file.filename,
          };
        });

        // 5.添加compilation中,输出出去
        assets.forEach(asset => {
          compilation.emitAsset(asset.filename, asset.source);
        });

        cb();
      });
    });
  }
}

module.exports = CopyWebpackPlugin;
