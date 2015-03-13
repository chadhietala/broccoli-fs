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
  var bfs;

  beforeEach(function() {
    bfs = new BroccoliFileSystem();
    process.chdir('./tests/fixtures/app');
  });

  afterEach(function() {
    return cleanupBuilder();
  });

  describe('add', function() {
    it('can a single file to the system', function() {
      bfs.add('lib', {
        include: ['bar.js']
      });
      return inspectFs(bfs.fs).then(function(files) {
        expect(files).to.deep.equal([
          'lib/',
          'lib/bar.js'
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
          'lib/',
          'lib/bar.js',
          'src/',
          'src/controller/',
          'src/controller/baz.js'
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

  describe('remove', function() {
    it('should throw if the fs is empty', function() {
      var willThrow = function() {
        return bfs.remove('foo.js');
      };
      expect(willThrow).to.throw(/The file system is empty\./);
    });

    it('should remove all bar files from the fs', function() {
      bfs.add('lib');
      bfs.remove('lib/bar.js');
      return inspectFs(bfs.fs).then(function(files) {
         expect(files).to.deep.equal([]);
      });
    });
  });
});