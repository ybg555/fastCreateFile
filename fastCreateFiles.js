/**
 * 快速创建文件,解决某目录下手动创建多个文件和写内容的痛苦；
 *
 * Quick Start
 * 1.该文件放在项目的根目录
 * 2.配置文件相关信息
 * 3.node fastCreateFiles.js
 *
 * @version 1.0.0
 * @author yongbigang
 * @date 9/24/2016
 */

'use strict';

console.time('fastCreateFiles');

let fs = require('fs');
let path = require('path');
var util = require('util');
let FCF_NS = {
  // 根目录
  baseDir: './',
  // 创建文件的目录，路径基于根目录baseDir
  dir: 'app/public', // 不能用__dirname todo 优化绝对路径规则；
  // 创建的文件列表
  files: [ {
    name: 'index',
    suffix: 'html',
    content: "<!DOCTYPE html> \n" +
    "<html lang='en'> \n" +
    "<meta charset='UTF-8'> \n" +
    "<title>Document</title> \n" +
    "<meta name='keywords' content='keywords'> \n" +
    "<meta name='description' content='description'> \n" +
    "<meta name='format-detection' content='telephone=no'> \n" +
    "<body></body> \n" +
    "</html>"
  },
    {
      name: 'index',
      suffix: 'js',
      content: "/** \n" +
      "* @author ${USER} \n" +
      "* @date ${DATE} \n" +
      "*/\n" +
      "\n'use strict';"
    },
    {
      name: 'index',
      suffix: 'scss',
      content: "@charset 'UTF-8'; \n"
    }
    , {
      name: 'images',
      suffix: ''  // 后缀为空，生成目录；
    }
  ],
  // git ignore，路径基于根目录baseDir
  gitIgnore: {
    ignoreFile: '.gitignore',
    ignoreContent: [ 'fastCreateFiles.js' ]
  },
  // 允许的文件后缀名
  extensions: [ '.js', '.scss', '.html' ],
  // 是否开启调试模式;
  debug: true,
  // 调试信息
  msg: {
    extensions: 'suffix is not allowed!',
    createSuccess: 'has been successfully created!'
  }
};

var createFiles = {
  main: function() {
    // 创建目录
    this._createDir.apply(this, [ FCF_NS.baseDir + FCF_NS.dir ]);
    // 创建文件；
    this._createFiles();
    // 当前文件忽略提交到git
    this._ignore(FCF_NS.baseDir + FCF_NS.gitIgnore.ignoreFile, FCF_NS.gitIgnore.ignoreContent);
  },
  getExistFiles: function(dir) {
    // 返回目录下所有文件
    return fs.readdirSync(dir);
  },
  _filter: function(suffix) {
    let _match = false;
    if (util.isArray(FCF_NS.extensions)) {
      FCF_NS.extensions.forEach((v)=> {
        if (v.search(suffix) != -1) {
          _match = true;
          return;
        }
      });
    }
    return _match;
  },
  _ignore: function(ignoreFile, ignoreContent) {
    fs.exists(ignoreFile, (exist)=> {
      if (exist) {
        fs.readFile(ignoreFile, function(err, buffer) {
          if (err) {
            console.error(err);
            return;
          }
          let readContent = buffer.toString('utf8');
          ignoreContent.forEach((v)=> {
            if (readContent.search(v) == -1) {
              fs.appendFile(ignoreFile, '\n' + v, 'utf8', (err) => {
                if (err) throw err; 
              });
            }
          });
        });
      }
    });
  },
  _createDir: function(dir) {
    let joinPath = '';
    dir.split(path.sep).forEach((v, i) => {
      // 过滤
      if (v.search(/\./) != -1) return false;

      joinPath = path.join(joinPath, v);
      // 目录不存在才创建
      if (!fs.existsSync(joinPath)) {
        fs.mkdirSync(joinPath);
      }
    });
  },
  _createFiles: function() {
    let alias = this;

    for (var i in FCF_NS.files) {
      let currentFileName = '';
      let currentFileSuffix = FCF_NS.files[ i ].suffix;
      let currentFileContent = FCF_NS.files[ i ].content; // 当前作用域

      if (!currentFileSuffix) {
        currentFileName = FCF_NS.baseDir + FCF_NS.dir + path.sep + FCF_NS.files[ i ].name;
        if (!fs.existsSync(currentFileName)) {
          fs.mkdirSync(currentFileName);
          if (FCF_NS.debug) console.log(currentFileName + ' ' + FCF_NS.msg.createSuccess);
        } else {
          if (FCF_NS.debug) console.log(currentFileName + ' exists yet!');
        }
        continue;
      }

      currentFileName = FCF_NS.baseDir + FCF_NS.dir + path.sep + FCF_NS.files[ i ].name + '.' + FCF_NS.files[ i ].suffix;
      if (FCF_NS.dir.match(/\w+\/$/gi) && FCF_NS.dir.match(/\w+\/$/gi).length > 0) {
        currentFileName = FCF_NS.baseDir + FCF_NS.dir + FCF_NS.files[ i ].name + '.' + FCF_NS.files[ i ].suffix;
      }
      fs.exists(currentFileName, function(exits) {
        if (exits) {
          if (FCF_NS.debug) console.log(currentFileName + ' exists yet!');
        } else {
          // 过滤非法文件后缀名
          if (!alias._filter(currentFileSuffix)) {
            console.error('.' + currentFileSuffix, FCF_NS.msg.extensions);
            return false;
          }

          fs.writeFile(currentFileName, currentFileContent, {
            encoding: 'utf8',
            mode: 777,
            flag: 'w'
          }, (err)=> {
            if (FCF_NS.debug) console.log(currentFileName + ' ' + FCF_NS.msg.createSuccess);
            if (err) throw err;
          });
        }
      });
    }
  }
};

createFiles.main();
console.timeEnd('fastCreateFiles');

module.exports = createFiles;
