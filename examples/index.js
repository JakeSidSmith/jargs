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
Adjust kwarg scope (global / children) (Help and Version classes for globals?)
Allow kwarg booleans without values to be true e.g. --thing false (false becomes the next arg)

Return args descriptor with usefull functions like getIn, command, arg, etc

*/

'use strict';

(function () {

  var jargs = require('../src/index');
  var Command = jargs.Command;
  var KWArg = jargs.KWArg;
  var Flag = jargs.Flag;
  var Arg = jargs.Arg;

  var jarg = jargs.collect(
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
    Flag(
      'help',
      {alias: 'h', type: 'boolean', description: 'Displays help & usage info'}
    ),
    Flag(
      'version',
      {alias: 'v', type: 'boolean', description: 'Displays version number'}
    )
  );

  /*

  var initCommand = jarg.command('init');

  // command.value is a boolean like a flag, if false it was not called
  if (initCommand.value) {

  }

  var command = jarg.command();

  switch (command.name) {
    case 'init':
      // Run init command
    default:
      // Throw error or display help & usage
  }

  */

})();
