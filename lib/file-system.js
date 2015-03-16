'use strict';
/*jshint node:true*/

var mergeTrees = require('broccoli-merge-trees');
var broccoli   = require('broccoli');
var stew       = require('broccoli-stew');
var util       = require('util');
var resolve    = require('resolve');
var Funnel     = require('broccoli-funnel');
var find       = stew.find;
var mv         = stew.mv;
var rm         = stew.rm;
var rename     = stew.rename;

var CoreObject = require('core-object');

module.exports = CoreObject.extend({
  init: function() {
    var options = {};
    
    if (arguments[0]) {
      options = arguments[0];
    }

    this.resolvers = options.resolvers;
    this.fs = undefined;
  },

  /**
   * Adds trees to the file system.
   *
   * @example
   *
   * var BFS = require('broccoli-fs'); 
   * var log = require('broccoli-stew').log;
   * var bfs = new BFS();
   *
   * // Given
   *
   * lib/
   *   a.js
   *   b.js
   * index.js
   *
   * bfs.add('lib');
   *
   * var files = log(bfs.fs);
   * 
   * // [
   * //   'lib/',
   * //   'lib/a.js',
   * //   'lib/b.js'
   * // ]
   *
   * module.exports = bfs.fs;
   * 
   * @param {String|Object} tree    A broccoli tree we want to add to the file system
   * @param {Object} options allows you to define to cherry pick specific files to be added
   */
  add: function(tree, options) {
    if (options && options.include) {
      if (util.isArray(options.include)) {
        tree = mv(find(tree, {
          include: options.include
        }), tree);
      } else {
        tree = mergeTrees(Object.keys(options.include).map(function(destDir) {
          var include = util.isArray(options.include[destDir]) ? options.include[destDir] : [options.include[destDir]];
          return mv(find(tree, {
            include: include
          }), destDir + '/' + tree);
        }));
      }
    } else {
      tree = mv(find(tree));
    }

    if (typeof this.fs === 'object') {
      this.fs = mergeTrees([this.fs, tree]);
    } else {
      this.fs = tree;
    }
  },

  /**
   * Moves files and directories on the file system.
   *
   * bfs.mv('/', 'development');
   *
   * bfs.mv('foo/bar.js', 'development/bar.js');
   * 
   * @param  {String} from The source files
   * @param  {String} to   Where we want to move the files
   */
  mv: function(from, to) {
    var fromIsDir = from.slice(-1) === '/';
    var toIsDir = to.slice(-1) === '/';

    // Moving directories
    if (fromIsDir && toIsDir) {
      from = new Funnel(this.fs, {
        srcDir: from
      });

      this.fs = new Funnel(from, { destDir: to });
    } else {
      this.fs = mv(this.fs, from, to);
    }
  },

  /**
   * Removes files from the file system.
   *
   * bfs.rm('src/foo.js', 'config/developement.js.example');
   * 
   * @return {[type]} [description]
   */
  rm: function() {
    if (!this.fs) {
      throw Error('The file system is empty.');
    }

    var args = [];

    for(var i = 0, l = arguments.length; i < l; i++) {
      args[i] = arguments[i];
    }

    args.unshift(this.fs);

    this.fs = rm.apply(undefined, args);
  }
});