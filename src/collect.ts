/*

  my-program sub-command --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces (exclusive) and commas (inclusive)

           command       flag      kwarg \w value kwarg       value  arg
  argv: [ 'sub-command' '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

import {
  any,
  argsToArray,
  createHelp,
  each,
  exitWithHelp,
  find,
  formatNodeName,
  formatRequiredList,
} from './utils';

let MATCHES_LEADING_HYPHENS = /^-+/;
let MATCHES_EQUALS_VALUE = /=.*/;
let MATCHES_NAME_EQUALS = /.*?=/;
let MATCHES_SINGLE_HYPHEN = /^-[^-]/;

function findArgOrKWarg(schema, globals, tree, isAlias, kwargName) {
  let matchingFlagOrKWArg = find(schema.children, function (node) {
    return (
      (node._type === 'flag' || node._type === 'kwarg') &&
      (isAlias ? node.options.alias === kwargName : node.name === kwargName)
    );
  });

  if (!matchingFlagOrKWArg) {
    if (
      (globals.help &&
        isAlias &&
        'alias' in globals.help.options &&
        kwargName === globals.help.options.alias) ||
      (globals.help && !isAlias && kwargName === globals.help.name)
    ) {
      throw new Error(createHelp(schema, globals));
    } else {
      throw new Error(
        createHelp(
          schema,
          globals,
          'Unknown argument: ' + (isAlias ? '-' : '--') + kwargName
        )
      );
    }
  } else if (
    matchingFlagOrKWArg.name in tree[matchingFlagOrKWArg._type + 's'] &&
    !matchingFlagOrKWArg.options.multi
  ) {
    throw new Error(
      createHelp(
        schema,
        globals,
        'Duplicate argument: ' + (isAlias ? '-' : '--') + kwargName
      )
    );
  }

  return matchingFlagOrKWArg;
}

function checkRequiredArgs(schema, globals, tree) {
  if (schema._requireAll && schema._requireAll.length) {
    each(schema._requireAll, function (node) {
      if (node._type === 'command') {
        if (!tree.command || node.name !== tree.command.name) {
          throw new Error(
            createHelp(
              schema,
              globals,
              'Required argument ' + formatNodeName(node) + ' was not supplied'
            )
          );
        }
      } else if (!(node.name in tree[node._type + 's'])) {
        throw new Error(
          createHelp(
            schema,
            globals,
            'Required argument ' + formatNodeName(node) + ' was not supplied'
          )
        );
      }
    });
  }

  if (schema._requireAny && schema._requireAny.length) {
    each(schema._requireAny, function (anyRequired) {
      let anyMatch = any(anyRequired, function (node) {
        if (node._type === 'command') {
          return tree.command && node.name === tree.command.name;
        }

        return node.name in tree[node._type + 's'];
      });

      if (!anyMatch) {
        throw new Error(
          createHelp(
            schema,
            globals,
            'Required one of: ' + formatRequiredList(anyRequired)
          )
        );
      }
    });
  }
}

function createTree(argv, schema, globals, commands, parentTree) {
  let tree = {
    name: schema.name,
    kwargs: {},
    flags: {},
    args: {},
  };

  if (parentTree) {
    parentTree.command = tree;
  }

  if (typeof schema.options.callback === 'function') {
    commands.push(schema.options.callback.bind(null, tree, parentTree));
  }

  while (argv.length) {
    const arg = argv.shift();
    let isPositional = arg.indexOf('-') !== 0; // command or arg

    if (isPositional) {
      let matchingCommand = find(schema.children, function (node) {
        return (
          node._type === 'command' &&
          (node.name === arg || node.options.alias === arg)
        );
      });

      // Valid command
      if (matchingCommand) {
        createTree(argv, matchingCommand, globals, commands, tree);
      } else {
        let matchingArg = find(schema.children, function (node) {
          return (
            node._type === 'arg' &&
            (node.options.multi || !(node.name in tree.args))
          );
        });

        // Unknown command
        if (!matchingArg) {
          throw new Error(
            createHelp(schema, globals, 'Unknown argument: ' + arg)
          );
          // Known command
        } else if (matchingArg.options.multi) {
          tree.args[matchingArg.name] = (
            tree.args[matchingArg.name] || []
          ).concat(arg);
        } else {
          tree.args[matchingArg.name] = arg;
        }
      }
    } else {
      let containsEquals = arg.indexOf('=') >= 0;
      const isAlias = MATCHES_SINGLE_HYPHEN.test(arg);
      const kwargName = arg
        .replace(MATCHES_LEADING_HYPHENS, '')
        .replace(MATCHES_EQUALS_VALUE, '');
      const kwargValue = arg.replace(MATCHES_NAME_EQUALS, '');

      let matchingFlagOrKWArg;

      // Rest --
      if (!kwargName.length) {
        tree.rest = argv.splice(0);
        // Invalid alias -a=
      } else if (isAlias && containsEquals) {
        throw new Error(
          createHelp(
            schema,
            globals,
            'Invalid argument syntax: -' + kwargName + '='
          )
        );
        // Valid multiple alias -abc or flag --flag
      } else if (isAlias && kwargName.length > 1) {
        let flagNames = kwargName.split('');
        let firstName = flagNames.shift();

        matchingFlagOrKWArg = findArgOrKWarg(
          schema,
          globals,
          tree,
          isAlias,
          firstName
        );

        // Valid multiple flag alias --abc
        if (matchingFlagOrKWArg._type === 'flag') {
          tree[matchingFlagOrKWArg._type + 's'][
            matchingFlagOrKWArg.name
          ] = true;

          each(flagNames, function (flagName) {
            matchingFlagOrKWArg = findArgOrKWarg(
              schema,
              globals,
              tree,
              isAlias,
              flagName
            );

            // Unknown flag alias -x
            if (matchingFlagOrKWArg._type !== 'flag') {
              throw new Error(
                createHelp(schema, globals, 'Invalid argument: -' + kwargName)
              );
              // Known flag alias -a
            } else {
              tree[matchingFlagOrKWArg._type + 's'][
                matchingFlagOrKWArg.name
              ] = true;
            }
          });
          // Valid flag --flag
        } else {
          tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
            kwargName.substring(1);
        }
      } else {
        matchingFlagOrKWArg = findArgOrKWarg(
          schema,
          globals,
          tree,
          isAlias,
          kwargName
        );

        // Flag --flag
        if (matchingFlagOrKWArg._type === 'flag') {
          tree[matchingFlagOrKWArg._type + 's'][
            matchingFlagOrKWArg.name
          ] = true;
          // Invalid kwarg --kwarg=
        } else if (containsEquals && !kwargValue) {
          throw new Error(
            createHelp(schema, globals, 'No value for argument: --' + kwargName)
          );
          // Valid kwarg --kwarg value
        } else if (!containsEquals) {
          // No value --kwarg
          if (!argv.length) {
            throw new Error(
              createHelp(
                schema,
                globals,
                'No value for argument: --' + kwargName
              )
            );
          }

          // Valid kwarg --kwarg value
          if (matchingFlagOrKWArg.options.multi) {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = (
              tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] ||
              []
            ).concat(argv.shift());
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
              argv.shift();
          }
          // Valid kwarg --kwarg=value
        } else if (matchingFlagOrKWArg.options.multi) {
          tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = (
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] ||
            []
          ).concat(kwargValue);
        } else {
          tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
            kwargValue;
        }
      }
    }
  }

  checkRequiredArgs(schema, globals, tree);

  let returned;

  while (commands.length) {
    returned = commands.shift()(returned);
  }

  return tree;
}

export function collect(rootNode, argv) {
  let allArgs = argsToArray(arguments);

  if (allArgs.length > 2) {
    throw new Error(
      'Too many arguments: collect takes only a single root node and argv'
    );
  }

  if (!rootNode) {
    throw new Error('No program defined');
  }

  if (rootNode._type !== 'program') {
    throw new Error('Root node must be a Program');
  }

  if (!argv) {
    throw new Error('No argv supplied');
  }

  if (!Array.isArray(argv)) {
    throw new Error('argv must be an array of strings, but got ' + typeof argv);
  }

  if (argv.length < 2) {
    throw new Error('argv has been tampered with');
  }

  // Remove program & command info & copy argv
  let args = argv.slice(2);
  let commands = [];

  try {
    return createTree(args, rootNode, rootNode._globals, commands);
  } catch (error) {
    exitWithHelp(error.message);
  }
}
