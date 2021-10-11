
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
      require('./src/index.js')

    })({"./src/index.js":{"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\n\nvar _sup = _interopRequireDefault(require(\"./sup.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log((0, _add[\"default\"])(1, 2));\nconsole.log((0, _sup[\"default\"])(3, 1));","deps":{"./add.js":"C:\\Users\\12411\\Desktop\\学习笔记\\webpack\\myWebpack\\src\\add.js","./sup.js":"C:\\Users\\12411\\Desktop\\学习笔记\\webpack\\myWebpack\\src\\sup.js"}},"C:\\Users\\12411\\Desktop\\学习笔记\\webpack\\myWebpack\\src\\add.js":{"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nfunction add(x, y) {\n  return x + y;\n}\n\nvar _default = add;\nexports[\"default\"] = _default;","deps":{}},"C:\\Users\\12411\\Desktop\\学习笔记\\webpack\\myWebpack\\src\\sup.js":{"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nfunction sup(x, y) {\n  return x - y;\n}\n\nvar _default = sup;\nexports[\"default\"] = _default;","deps":{}}})
    