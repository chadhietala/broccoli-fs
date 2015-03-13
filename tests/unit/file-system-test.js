'use strict';
/*jshint node:true*/
var expect = require('chai').expect;
var BroccoliFileSystem = require('../../lib/file-system');
var broccoli = require('broccoli');
var log = require('broccoli-stew').log;
var walkSync = require('walk-sync');
var Promise = require('rsvp').Promise;
var builders = [];
var cwd = process.cwd();

function inspectFs(tree) {
  var builder = new broccoli.Builder(tree);
  builders.push(builder);

  return builder.build().then(function(inputTree) {
    return walkSync(inputTree.directory);
  });
}

function cleanupBuilder() {
  if (builders.length > 0) {
    return Promise.all(builders.map(function(builder) {
      process.chdir(cwd);
      return builder.cleanup();
    }));
  } else {
    return Promise.resolve();
  }
}

describe('Broccoli File System', function() {
  describe('add', function() {
    var bfs;

    beforeEach(function() {
      bfs = new BroccoliFileSystem();
      process.chdir('./tests/fixtures/app');
    });

    afterEach(function() {
      return cleanupBuilder();
    });

    it('can a single file to the system', function() {
      bfs.add('lib', {
        include: ['bar.js']
      });
      return inspectFs(bfs.fs).then(function(files) {
        expect(files).to.deep.equal([
          'development/',
          'development/lib/',
          'development/lib/bar.js'
        ]);
      });    
    });

    it('can add multiple files to the system', function() {
      bfs.add('lib', {
        include: ['bar.js']
      });

      bfs.add('src/controller');

      return inspectFs(bfs.fs).then(function(files) {
        expect(files).to.deep.equal([
          'development/',
          'development/lib/',
          'development/lib/bar.js',
          'development/src/',
          'development/src/controller/',
          'development/src/controller/baz.js'
        ]);
      });    
    });

    it('can add env specific files', function() {
      bfs.add('src/config', {
        include: {
          'development': 'development.js',
          'production': 'production.js'
        }
      });
      
      return inspectFs(bfs.fs).then(function(files) {
        expect(files).to.deep.equal([
          'development/',
          'development/src/',
          'development/src/config/',
          'development/src/config/development.js',
          'production/',
          'production/src/',
          'production/src/config/',
          'production/src/config/production.js'
        ]);
      });    
    });
  });
});