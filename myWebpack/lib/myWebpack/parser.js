const fs = require('fs');
const babelParser = require('@babel/parser');
const path = require('path');
const babelTraverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');

const Parser = {
  // 获取抽象语法树
  getAst(filePath) {
    // 读取文件
    const file = fs.readFileSync(filePath, 'utf-8');
    // 将其解析成ast抽象语法树
    const ast = babelParser.parse(file, {
      sourceType: 'module', // 解析文件的模块化方案是 ES Module
    });

    return ast;
  },

  // 获取依赖
  getDeps(filePath, ast) {
    // 获取到文件文件夹路径
    const dirname = path.dirname(filePath);

    // 定义存储依赖的容器
    const deps = {};

    // 收集依赖
    babelTraverse(ast, {
      // 内部会遍历ast中program.body，判断里面语句类型
      // 如果type：ImportDeclartation 就会触发当前函数
      ImportDeclaration(code) {
        debugger;
        // 文件相对路径
        const relativePath = code.node.source.value;
        // 生成基于入口文件的绝对路径
        const absolutePath = path.resolve(dirname, relativePath);
        console.log(absolutePath);
        // 添加依赖
        deps[relativePath] = absolutePath;
      },
    });

    return deps;
  },
  // 将ast解析编译成code
  getCode(ast) {
    // 编译代码:将代码中浏览器不能识别的语法进行编译
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    });
    return code;
  },
};

module.exports = Parser;
