#! /usr/bin/env node

'use strict';

(function () {

  var jargs = require('../src/index');
  var Help = jargs.Help;
  var Program = jargs.Program;
  var Command = jargs.Command;
  var KWArg = jargs.KWArg;
  var Flag = jargs.Flag;
  var Arg = jargs.Arg;
  var Required = jargs.Required;
  var RequireAll = jargs.RequireAll;
  var RequireAny = jargs.RequireAny;

  var firstCommand = Command(
    'first',
    {
      description: 'The first command',
      usage: 'command first arg sub',
      examples: [
        'command first arg sub'
      ],
      callback: function (tree) {
        console.log('Command: ' + tree.name);
        return tree.args.data;
      }
    },
    RequireAll(
      Arg(
        'data',
        {
          description: 'Some data to be passed to the sub command'
        }
      ),
      Command(
        'sub',
        {
          description: 'A sub command',
          usage: 'command first sub',
          callback: function (tree, parentTree, data) {
            console.log('Command: ' + tree.name);
            console.log(data);
          }
        }
      )
    )
  );

  var secondCommand = Command(
    'second',
    {
      description: 'The second command',
      usage: 'command second [--kwarg1, --kwarg2] arg',
      examples: [
        'command --kwarg1=foo --kwarg2=bar arg'
      ]
    },
    Flag(
      'flag',
      {
        alias: 'f',
        description: 'An optional flag'
      }
    ),
    RequireAll(
      KWArg(
        'kwarg1',
        {
          alias: '1',
          type: 'string',
          description: 'A required key word argument',
          multi: true
        }
      ),
      KWArg(
        'kwarg2',
        {
          alias: '2',
          type: 'string',
          description: 'Another required key word argument',
          multi: true
        }
      )
    ),
    Required(
      Arg(
        'arg',
        {
          multi: true
        }
      )
    )
  );

  var fullTree = jargs.collect(
    Help(
      'help',
      {
        alias: 'h',
        description: 'Display help and usage'
      },
      Program(
        'command',
        {
          description: 'An example command line interface',
          examples: [
            'command first arg sub',
            'command second --flag --kwarg1=foo --kwarg2=bar arg'
          ],
          callback: function (tree) {
            console.log('Program: ' + tree.name);
          }
        },
        RequireAny(
          firstCommand,
          secondCommand
        )
      )
    ),
    process.argv
  );

  console.log('Full tree:\n');
  console.log(fullTree);
  console.log(fullTree.command.kwargs);
  console.log(fullTree.command.args);

})();
