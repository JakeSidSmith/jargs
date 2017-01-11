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
Adjust kwarg scope (global / children)
Allow kwarg booleans without values to be true e.g. --thing false (false becomes the next arg)

*/

'use strict';

(function () {

  var jargs = require('../src/index');
  var Command = jargs.Command;
  var KWArg = jargs.KWArg;
  var Arg = jargs.Arg;

  var args = jargs.collect([
    Command(
      'init',
      null,
      Arg(
        'path',
        {required: true, type: 'string'}
      )
    ),
    Command(
      'build',
      null,
      KWArg(
        'config',
        {alias: 'c', type: 'string', default: 'config.json'}
      )
    ),
    KWArg(
      'help',
      {alias: 'h', type: 'boolean', description: 'Displays help & usage info'}
    ),
    KWArg(
      'version',
      {alias: 'v', type: 'boolean', description: 'Displays version number'}
    )
  ]);

  console.log(args);

})();
