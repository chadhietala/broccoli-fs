'use strict';
/*jshint node:true*/

var mergeTrees = require('broccoli-merge-trees');
var stew       = require('broccoli-stew');
var util       = require('util');
var resolve    = require('resolve');
var find       = stew.find;
var mv         = stew.mv;
var log        = stew.log;

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
 *   include: {
 *     'developmet' : 'ember.debug.js',
 *     'production': 'ember.min.js'
 *   }
 * });
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


function addInDevelopment(tree) {
  return 'development/' + tree;
} 

function addInProduction(tree) {
  return 'development/' + tree;
} 

module.exports = CoreObject.extend({
  init: function(options) {
    options = options || {};
    this.root = options.root || '/';
    this.resolvers = options.resolvers;
    this.fs = undefined;
  },
  add: function(tree, options) {
    if (options && options.include) {
      if (util.isArray(options.include)) {
        tree = mv(find(tree, {
          include: options.include
        }), addInDevelopment(tree));
      } else {
        tree = mergeTrees(Object.keys(options.include).map(function(destDir) {
          var include = util.isArray(options.include[destDir]) ? options.include[destDir] : [options.include[destDir]];

          return mv(find(tree, {
            include: include
          }), destDir + '/' + tree);
        }));
      }
    } else {
      tree = mv(find(tree), 'development');
    }

    if (typeof this.fs === 'object') {
      this.fs = mergeTrees([this.fs, tree]);
    } else {
      this.fs = tree;
    }
  }
});