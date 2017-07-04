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
      {
        usage: 'npm command <library> [--flag]',
        examples: [
          'npm run jargs --save --save-exact'
        ],
        callback: function (tree) {
          if (tree.flags.version) {
            console.log('1.0.0');
            process.exit(0);
          }

          if (tree.flags.help) {
            console.log('Some help stuff');
            process.exit(0);
          }
        }
      },
      Command(
        'init',
        {
          description: 'Create npm package',
          usage: 'npm init',
          required: true
        }
      ),
      Command(
        'install',
        {
          alias: 'i',
          description: 'Install dependencies',
          usage: 'npm install <lib> [--flags]',
          examples: [
            'npm install jargs --save --save-exact'
          ],
          required: true
        },
        Arg(
          'lib'
        ),
        Flag(
          'save',
          {
            alias: 'S',
            description: 'Add to package.json dependencies'
          }
        ),
        Flag(
          'save-dev',
          {
            alias: 'D',
            description: 'Add to package.json dev-dependencies'
          }
        ),
        Flag(
          'save-exact',
          {
            alias: 'E',
            description: 'Save exact latest version to package.json'
          }
        ),
        Flag(
          'save-optional',
          {
            alias: 'O',
            description: 'Add to package.json optional-dependencies'
          }
        )
      ),
      Command(
        'run',
        {
          alias: 'run-scripts',
          description: 'Run a script in the package',
          required: true
        },
        Arg(
          'script',
          {
            description: 'Script from package.json to run'
          }
        )
      ),
      Flag(
        'help',
        {
          alias: 'h',
          description: 'Display help & usage info'
        }
      ),
      Flag(
        'version',
        {
          alias: 'v',
          description: 'Display version number'
        }
      )
    )
  );

  // Alternatively to callbacks you can inspect the tree yourself
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
