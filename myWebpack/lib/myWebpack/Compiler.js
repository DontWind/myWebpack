const Parser = require('./parser');
const path = require('path');
const fs = require('fs');

class Compiler {
  constructor(options = {}) {
    // webpack 配置对象
    this.options = options;
    // 所有依赖的容器
    this.modules = [];
  }

  // 启动webpack打包
  run() {
    // 1.获取入口文件路径
    const filePath = this.options.entry;
    // 第一次构建，得到入口文件的信息
    const fileInfo = this.build(filePath);

    this.modules.push(fileInfo);

    //递归依赖
    this.getDepsMethod(0);

    const depsGraph = this.modules.reduce((graph, module) => {
      return {
        ...graph,
        [module.filePath]: {
          code: module.code,
          deps: module.deps,
        },
      };
    }, {});

    this.generate(depsGraph);
  }
  // 开始构建
  build(filePath) {
    // 2.获取抽象语法树
    const ast = Parser.getAst(filePath);
    // 3.收集依赖
    const deps = Parser.getDeps(filePath, ast);
    // 4解析编译代码
    const code = Parser.getCode(ast, deps);
    return {
      // 文件路径
      filePath,
      // 文件的所有依赖
      deps,
      // 文件解析后的代码
      code,
    };
  }

  // 生成输出资源
  generate(depsGraph) {
    const bundle = `
    (function(depsGraph){
      // require目的：为了加载入口文件
      function require(module){
        // 定义模块内部的require函数
        function localRequire(relativePath){
          // 为了找到当前要引入模块的绝对路径，通过require加载
          return require(depsGraph[module].deps[relativePath])
        }
        // 定义暴露对象(将来模块要暴露的内容)
        var exports={};

        (function(require,exports,code){
          eval(code)
        }(localRequire,exports,depsGraph[module].code))
        
        // 作为require函数的返回值返回出去
        // 后面的require函数能得到暴露的内容
        return exports;
      }

      // 加载入口文件
      require('${this.options.entry}')

    })(${JSON.stringify(depsGraph)})
    `;

    // 生成输出文件的绝对路径
    const filePath = path.resolve(this.options.output.path, this.options.output.filename);
    // 写入文件
    fs.writeFileSync(filePath, bundle, 'utf-8');
  }

  // 递归收集所有依赖
  getDepsMethod = index => {
    const deps = this.modules[index].deps;
    // 取出当前文件的所有依赖
    for (const relativePath in deps) {
      // 依赖文件的绝对路径
      const absloutePath = deps[relativePath];
      // 收集当前文件的依赖
      const fileInfo = this.build(absloutePath);
      this.modules.push(fileInfo);
    }
    if (index < this.modules.length - 1) {
      this.getDepsMethod(index + 1);
    }
  };
}

module.exports = Compiler;
