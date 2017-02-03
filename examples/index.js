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
  var Program = jargs.Program;
  var Command = jargs.Command;
  // var KWArg = jargs.KWArg;
  var Flag = jargs.Flag;
  var Arg = jargs.Arg;

  var root = jargs.collect(
    Program(
      'npm',
      {usage: 'npm command <library> [--flag]', examples: ['npm install jargs --save --save-exact']},
      Command(
        'init',
        {description: 'Create npm package'}
      ),
      Command(
        'install',
        {alias: 'i', description: 'Install dependencies'},
        Arg(
          'lib'
        ),
        Flag(
          'save',
          {alias: 'S'}
        ),
        Flag(
          'save-dev',
          {alias: 'D'}
        ),
        Flag(
          'save-exact',
          {alias: 'E'}
        ),
        Flag(
          'save-optional',
          {alias: 'O'}
        )
      ),
      Command(
        'run',
        {alias: 'run-scripts', description: 'Run a script in the package'},
        Arg(
          'command'
        )
      ),
      Flag(
        'help',
        {alias: 'h', description: 'Displays help & usage info'}
      ),
      Flag(
        'version',
        {alias: 'v', description: 'Displays version number'}
      )
    )
  );

  if (root.command) {
    switch (root.command.name) {
      case 'init':
        // Do init stuff
        break;
      case 'install':
        // Do install stuff
        break;
      case 'run':
        // Do run stuff
        break;
      default:
        // Should never get here
    }
  } else if (root.flags.help) {
    // Display help
  } else if (root.flags.version) {
    // Display version
  }

})();
