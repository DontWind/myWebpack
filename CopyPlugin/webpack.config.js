const CopyWebpackPlugin = require('./plugins/CopyWebpackPlugin');

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      from: 'public',
      to: 'css', // 代表输出到默认路径
      ignore: ['**/index.html'],
    }),
  ],
};
