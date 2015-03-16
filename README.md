# Broccoli-fs

Broccoli-fs provides an interface for mutating a virtualized file system based on broccoli trees.

## Example

```js
var BFS = require('broccoli-fs');
var bfs = new BFS();

/**
 * Given a project structure that looks like
 *  
 * lib/
 *  a.js
 *  b.js
 *  utils/
 *   to-string.js
 */

bfs.add('lib');

/*
bfs.fs => [
  'lib/'
  'lib/a.js',
  'lib/b.js',
  'lib/utils/',
  'lib/utils/to-string.js'
] 
*/

bfs.rm('lib/b.js')

/*
bfs.fs => [
  'lib/'
  'lib/a.js',
  'lib/utils/',
  'lib/utils/to-string.js'
] 
*/

bfs.mv('lib/a.js', 'a-module/')

/*
bfs.fs => [
  'a-module/',
  'a-module/a.js',
  'lib/'
  'lib/utils/',
  'lib/utils/to-string.js'
] 
*/
```