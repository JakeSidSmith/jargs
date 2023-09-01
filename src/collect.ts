/*

  my-program sub-command --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces (exclusive) and commas (inclusive)

           command       flag      kwarg \w value kwarg       value  arg
  argv: [ 'sub-command' '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

import {
  AnyTree,
  CommandNode,
  FlagNode,
  GlobalsInjected,
  InferTree,
  KWArgNode,
  NodeType,
  ProgramNode,
  ProgramOrCommandChildren,
} from './types';
import {
  createHelp,
  exitWithHelp,
  extractErrorMessage,
  formatNodeName,
  formatRequiredList,
  pluralize,
} from './utils';

const MATCHES_LEADING_HYPHENS = /^-+/;
const MATCHES_EQUALS_VALUE = /=.*/;
const MATCHES_NAME_EQUALS = /.*?=/;
const MATCHES_SINGLE_HYPHEN = /^-[^-]/;

function findFlagOrKWarg(
  schema:
    | ProgramNode<string, ProgramOrCommandChildren>
    | CommandNode<string, ProgramOrCommandChildren>,
  globals: GlobalsInjected,
  tree: AnyTree,
  isAlias: boolean,
  kwargName: string
): FlagNode<string> | KWArgNode<string> {
  const matchingFlagOrKWArg = schema.children.find((node) => {
    return (
      (node._type === NodeType.FLAG || node._type === NodeType.KW_ARG) &&
      (isAlias ? node.options.alias === kwargName : node.name === kwargName)
    );
  }) as FlagNode<string> | KWArgNode<string> | undefined;

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
    matchingFlagOrKWArg.name in tree[pluralize(matchingFlagOrKWArg._type)] &&
    (!('multi' in matchingFlagOrKWArg.options) ||
      !matchingFlagOrKWArg.options.multi)
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

function checkRequiredArgs(
  schema:
    | ProgramNode<string, ProgramOrCommandChildren>
    | CommandNode<string, ProgramOrCommandChildren>,
  globals: GlobalsInjected,
  tree: AnyTree
) {
  if (schema._requireAll && schema._requireAll.length) {
    schema._requireAll.forEach((node) => {
      if (node._type === NodeType.COMMAND) {
        if (!tree.command || node.name !== tree.command.name) {
          throw new Error(
            createHelp(
              schema,
              globals,
              'Required argument ' + formatNodeName(node) + ' was not supplied'
            )
          );
        }
      } else if (!(node.name in tree[pluralize(node._type)])) {
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
    schema._requireAny.forEach((anyRequired) => {
      const anyMatch = anyRequired.some((node) => {
        if (node._type === NodeType.COMMAND) {
          return tree.command && node.name === tree.command.name;
        }

        return node.name in tree[pluralize(node._type)];
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

function createTree<N extends string, C extends ProgramOrCommandChildren>(
  argv: string[],
  schema: ProgramNode<N, C> | CommandNode<N, C>,
  globals: GlobalsInjected,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commands: ((parentReturnValue: any) => void)[],
  parentTree?: AnyTree
) {
  const tree: AnyTree = {
    name: schema.name,
    kwargs: {},
    flags: {},
    args: {},
  };

  if (parentTree) {
    parentTree.command = tree;
  }

  if (typeof schema.options.callback === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commands.push(schema.options.callback.bind(null, tree, parentTree as any));
  }

  while (argv.length) {
    const arg = argv.shift();

    /* istanbul ignore next */
    if (typeof arg === 'undefined') {
      continue;
    }

    const isPositional = arg.indexOf('-') !== 0; // command or arg

    if (isPositional) {
      const matchingCommand = schema.children.find((node) => {
        return (
          node._type === NodeType.COMMAND &&
          (node.name === arg || node.options.alias === arg)
        );
      }) as CommandNode<string, ProgramOrCommandChildren> | undefined;

      // Valid command
      if (matchingCommand) {
        createTree(argv, matchingCommand, globals, commands, tree);
      } else {
        const matchingArg = schema.children.find((node) => {
          return (
            node._type === NodeType.ARG &&
            (node.options.multi || !(node.name in tree.args))
          );
        });

        // Unknown command
        if (!matchingArg) {
          throw new Error(
            createHelp(schema, globals, 'Unknown argument: ' + arg)
          );
          // Known command
        } else if (
          'multi' in matchingArg.options &&
          matchingArg.options.multi
        ) {
          tree.args[matchingArg.name] = (
            tree.args[matchingArg.name] || []
          ).concat(arg);
        } else {
          tree.args[matchingArg.name] = arg;
        }
      }
    } else {
      const containsEquals = arg.indexOf('=') >= 0;
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
        const flagNames = kwargName.split('');
        const firstName = flagNames.shift();

        /* istanbul ignore next */
        if (!firstName) {
          throw new Error(
            createHelp(
              schema,
              globals,
              'Could not get aliased name for flag ' + kwargName
            )
          );
        }

        matchingFlagOrKWArg = findFlagOrKWarg(
          schema,
          globals,
          tree,
          isAlias,
          firstName
        );

        // Valid multiple flag alias --abc
        if (matchingFlagOrKWArg._type === NodeType.FLAG) {
          tree[pluralize(matchingFlagOrKWArg._type)][matchingFlagOrKWArg.name] =
            true;

          flagNames.forEach((flagName) => {
            matchingFlagOrKWArg = findFlagOrKWarg(
              schema,
              globals,
              tree,
              isAlias,
              flagName
            );

            // Unknown flag alias -x
            if (matchingFlagOrKWArg._type !== NodeType.FLAG) {
              throw new Error(
                createHelp(schema, globals, 'Invalid argument: -' + kwargName)
              );
              // Known flag alias -a
            } else {
              tree[pluralize(matchingFlagOrKWArg._type)][
                matchingFlagOrKWArg.name
              ] = true;
            }
          });
          // Valid flag --flag
        } else {
          tree[pluralize(matchingFlagOrKWArg._type)][matchingFlagOrKWArg.name] =
            kwargName.substring(1);
        }
      } else {
        matchingFlagOrKWArg = findFlagOrKWarg(
          schema,
          globals,
          tree,
          isAlias,
          kwargName
        );

        // Flag --flag
        if (matchingFlagOrKWArg._type === NodeType.FLAG) {
          tree[pluralize(matchingFlagOrKWArg._type)][matchingFlagOrKWArg.name] =
            true;
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
            const kwargVal = argv.shift();

            /* istanbul ignore next */
            if (!kwargVal) {
              throw new Error(
                createHelp(schema, globals, 'No value for kwarg --' + kwargName)
              );
            }

            tree[pluralize(matchingFlagOrKWArg._type)][
              matchingFlagOrKWArg.name
            ] = (
              tree[pluralize(matchingFlagOrKWArg._type)][
                matchingFlagOrKWArg.name
              ] || []
            ).concat(kwargVal);
          } else {
            tree[pluralize(matchingFlagOrKWArg._type)][
              matchingFlagOrKWArg.name
            ] = argv.shift();
          }
          // Valid kwarg --kwarg=value
        } else if (matchingFlagOrKWArg.options.multi) {
          tree[pluralize(matchingFlagOrKWArg._type)][matchingFlagOrKWArg.name] =
            (
              tree[pluralize(matchingFlagOrKWArg._type)][
                matchingFlagOrKWArg.name
              ] || []
            ).concat(kwargValue);
        } else {
          tree[pluralize(matchingFlagOrKWArg._type)][matchingFlagOrKWArg.name] =
            kwargValue;
        }
      }
    }
  }

  checkRequiredArgs(schema, globals, tree);

  let returned;

  while (commands.length) {
    returned = commands.shift()?.(returned);
  }

  return tree as InferTree<N, C>;
}

export function collect<N extends string, C extends ProgramOrCommandChildren>(
  rootNode: ProgramNode<N, C>,
  argv: readonly string[],
  ...args: readonly never[]
) {
  if (args.length) {
    throw new Error(
      'Too many arguments: collect takes only a single root node and argv'
    );
  }

  if (!rootNode) {
    throw new Error('No program defined');
  }

  if (rootNode._type !== NodeType.PROGRAM) {
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
  const [, , ...rest] = argv;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commands: ((parentReturnValue: any) => void)[] = [];

  try {
    return createTree(rest, rootNode, rootNode._globals, commands);
  } catch (error) {
    return exitWithHelp(extractErrorMessage(error)) as unknown as InferTree<
      N,
      C
    >;
  }
}
