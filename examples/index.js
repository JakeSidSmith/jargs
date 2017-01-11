#! /usr/bin/env node

// Ref: http://docopt.org/

/*

Chain commands
Positional arguments
Named arguments
Required arguments
Limit arguments options
Set option type (e.g. string, number)
Set number of options (exact, min, & max)
Nest commands & arguments

*/

'use strict';

(function () {

  var jargs = require('../src/index');
  var Command = jargs.Command;
  var KWArg = jargs.KWArg;
  var Arg = jargs.Arg;

  var args = jargs.collect([
    Command({
      name: 'init',
      children: [
        Arg({
          name: 'path',
          required: true,
          type: 'string'
        })
      ]
    }),
    Command({
      name: 'build',
      children: [
        KWArg({
          name: 'config',
          alias: 'c',
          type: 'string',
          default: 'config.json'
        })
      ]
    }),
    KWArg({
      name: 'help',
      alias: 'h',
      type: 'boolean',
      description: 'Displays help & usage info'
    }),
    KWArg({
      name: 'version',
      alias: 'v',
      type: 'boolean',
      description: 'Displays version number'
    })
  ]);

  console.log(args);

})();
