'use strict';
/*jshint node:true*/

var mergeTrees = require('broccoli-merge-trees');
var broccoli   = require('broccoli');
var stew       = require('broccoli-stew');
var util       = require('util');
var resolve    = require('resolve');
var find       = stew.find;
var mv         = stew.mv;
var rm         = stew.rm;

var CoreObject = require('core-object');

/**
 * var bfs = new BroccoliFileSystem({
 *   resolvers: ['npm-resolver', 'bower-resolver']
 * });
 *
 * bfs.app('loader.js');
 *
 * /
 *    vendor/
 *      development/
 *        loader.js/
 *           loader.js
 *        ember/
 *           ember.debug.js
 *        moment/
 *           moment.js
 *        jquery/
 *           jquery.js
 *      production/
 *        jquery/
 *           jquery.min.js
 *        ember/
 *           ember.min.js
 * 
 * bfs.add('ember', {
 *   srcDir: 'node_modules',
 *   include: {
 *     'developmet' : 'ember.debug.js',
 *     'production': 'ember.min.js'
 *   }
 * });
 *
 * 
 *
 *
 * 
 * bfs.add('moment', {
 *   include: ['lib/moment.js']
 * });
 *
 * 
 *
 *
 * 
 */

// function resolvePackage(package, resolvers) {
//   return resolve.sync(package, {
//     paths: resolvers
//   });
// }


module.exports = CoreObject.extend({
  init: function() {
    var options = {};
    
    if (arguments[0]) {
      options = arguments[0];
    }

    this.resolvers = options.resolvers;
    this.fs = undefined;
  },
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

  move: function(from, to) {
    this.fs = mv(find(this.fs, from), to);
  },

  remove: function() {
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