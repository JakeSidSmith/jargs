#! /usr/bin/env node

'use strict';

(function () {

  var jargs = require('../src/index');
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
      usage: 'command first',
      examples: [
        'command first'
      ]
    }
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
          description: 'A required key word argument'
        }
      ),
      KWArg(
        'kwarg1',
        {
          alias: '1',
          type: 'string',
          description: 'Another required key word argument'
        }
      )
    ),
    Required(
      Arg(
        'arg'
      )
    )
  );

  jargs.collect(
    Program(
      'command',
      {
        description: 'An example command line interface',
        examples: [
          'command first arg',
          'command second --flag --kwarg1=foo --kwarg2=bar arg'
        ]
      },
      RequireAny(
        firstCommand,
        secondCommand
      )
    )
  );

})();
