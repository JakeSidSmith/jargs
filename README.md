# jargs

**Simple node arg parser with explicit tree structure schema**

[![CircleCI](https://circleci.com/gh/JakeSidSmith/jargs/tree/master.svg?style=svg)](https://circleci.com/gh/JakeSidSmith/jargs/tree/master)

## About

Jargs is a node argv parser that takes inspiration from [docopt](http://docopt.org/).
Unlike other arg parsers, jargs allows you to define your commands, arguments, etc in a tree structure.
This way you can have, for example, nested sub-commands, or arguments that are attached to a specific command.

## Installation

```shell
npm install jargs --save
```

## Usage

### Require jargs

```javascript
import {
  collect,
  Program,
  Command,
  KWArg,
  Flag,
  Arg,
  Required,
  RequireAll,
  RequireAny
} from 'jargs';
```

### Create a schema

Here's a cutdown example of how to create a schema for NPM.

Note: you can nest nodes as many times as necessary.

```javascript
const tree = collect(
  Help(
    'help',
    null,
    Program(
      'npm',
      null,
      RequireAny(
        Command(
          'init'
        ),
        Command(
          'install', {alias: 'i'},
          Arg(
            'lib'
          ),
          Flag(
            'save', {alias: 'S'}
          ),
          Flag(
            'save-dev', {alias: 'D'}
          ),
          Flag(
            'save-exact', {alias: 'E'}
          ),
          Flag(
            'save-optional', {alias: 'O'}
          )
        ),
        Command(
          'run', {alias: 'run-scripts'},
          Arg(
            'command'
          )
        )
      )
    )
  ),
  process.argv
);
```

This collects the arguments that match the schema you've defined.

Calling the command `npm` returns the following.

```javascript
{
  name: 'npm',
  kwargs: {},
  flags: {},
  args: {}
}
```

Calling the command `npm install jargs --save` returns the following.

```javascript
{
  name: 'npm',
  command: {
    name: 'install',
    kwargs: {},
    flags: {
      save: true
    },
    args: {
      lib: 'jargs'
    }
  },
  kwargs: {},
  flags: {},
  args: {}
}
```

If we set the `lib` `Arg` to `multi: true`, then we can supply multiple args and they will be added to an array.

```javascript
Arg(
  'lib',
  {
    multi: true
  }
)
```

Calling the command `npm install jargs another-lib --save` with `mutli` returns the following.

```javascript
{
  name: 'npm',
  command: {
    name: 'install',
    kwargs: {},
    flags: {
      save: true
    },
    args: {
      lib: ['jargs', 'another-lib']
    }
  },
  kwargs: {},
  flags: {},
  args: {}
}
```

### Collecting arguments

The `collect` function is provided with your program and `argv` (from process). Collect returns a tree that represents the matched arguments, and handles calling the callbacks of any commands that were matched with the relevant part of the tree.

```javascript
collect(Program('my-command'), process.argv);
```

### Querying the tree

Each node always contains the keys `command`, `kwargs`, `flags`, `args` and `rest` so that you can easily query them.

#### Querying Commands

```javascript
if (tree.command) {
  switch (tree.command.name) {
    case 'install':
      // Install stuff
      break;
    default:
      // This should never be hit since we check for the command existence first
  }
}
```

#### Rest

Rest is a key that is populated with all remaining arguments when the user provides `--` in their command. This is often used to pass all remaining arguments to a sub-process.

Running `npm test -- --coverage` would return something like

```javascript
{
  name: 'npm',
  command: {
    {
      name: 'test',
      kwargs: {},
      flags: {},
      args: {},
      rest: ['--coverage']
    }
  },
  kwargs: {},
  flags: {},
  args: {}
}
```

#### Querying Flags, KWArgs, and Args

##### Flags

```javascript
if (tree.flags.verbose) {
  doSomethingWithThisFlag(tree.flags.verbose);
}
```

##### KWArgs

```javascript
if ('lib' in tree.kwargs) {
  doSomethingWithThisKWArg(tree.kwargs.lib);
}
```

##### Args

```javascript
if ('lib' in tree.args) {
  doSomethingWithThisArg(tree.args.lib);
}
```

### Nodes

All nodes (excluding require nodes, see blow for more info) take the following arguments, though `Command` and `Program` take additional arguments (more info about individual nodes below).

```javascript
Node(name, options);
```

Note: the available options vary per node.

`Command` and `Program` can take an infinite number or arguments. Any arguments after `name` & `options` become that node's child nodes e.g.

```javascript
Command(name, options, KWArg(), Flag(), Arg());
```

Both `options` and `childNodes` are optional.
All keys in `options` are optional and have defaults (more info below).
`childNodes` are any arguments following the name & options (only valid for `Command` and `Program`).

You can nest `Commands` as many times as necessary.

#### Program

Program is the main command / name of your program. This should always be the root node in your schema.

Takes the following options.

```javascript
Program(
  'program-name'
  {
    description: 'A command', // default: empty string
    usage: 'program-name sub-command --flag', // default: empty string
    examples: ['program command-name --flag'], // default: empty array
    callback: function (tree) {}
  },
  ...childNodes
)
```

#### Command

A sub-command of your command line interface.
Program is the main command / name of your program.
Commands form a fork in the tree - only one command at each level can be satisfied.

Takes the following options.

```javascript
Command(
  'command-name'
  {
    alias: 'command-alias', // default: undefined
    description: 'A command', // default: empty string
    usage: 'program-name sub-command --flag', // default: empty string
    examples: ['program command-name --flag'], // default: empty array
    callback: function (tree) {}
  },
  ...childNodes
)
```

#### KWArg

A key word argument such as `--outfile` that takes a custom value.
These can be defined in 2 different ways: `--outfile filename.js` and `--outfile=filename.js`.
You don't need to add the `--` to the name, these are dealt with internally.
If an alias is defined e.g. `{alias: 'o'}` this KWArg will also get the value of `-o=filename.js` (note the single `-`).

Takes the following options.

```javascript
KWArg(
  'kwarg-name'
  {
    alias: 'k', // default: undefined
    description: 'A key word argument', // default: empty string
    type: 'string',
    multi: false // default: false
  }
)
```

#### Flag

Like a KWArg, but do not take a custom value. These are used like booleans.
`--verbose` is an example of a flag.
You don't need to add the `--` to the name, these are dealt with internally.
If an alias is defined e.g. `{alias: 'v'}` this Flag will also be true if `-v` is present (note the single `-`).

Takes the following options.

```javascript
Flag(
  'flag-name'
  {
    alias: 'f', // default: undefined
    description: 'A flag', // default: empty string
  }
)
```

#### Arg

Positional argument that takes a custom value.
In the command `npm install jargs`, `jargs` is an Arg.

Takes the following options.

```javascript
Arg(
  'arg-name'
  {
    description: 'An arg', // default: empty string
    type: 'string',
    multi: false // default: false
  }
)
```

### Help

By wrapping your Program node in the Help node users can get nicely formatted help & usage output about any part of your schema by passing the `--help` flag (you can change the help node name & alias).

Note: if you provide another flag / kwarg node with the same name or alias as the help node, no help will be output.
This allows you to override the help output, and output some custom usage info.

```javascript
Help(
  'help',
  {
    alias: 'h', // default: undefined
    description: 'Display help & usage' // default: empty string
  }
)
```

### Require Nodes

There are 3 different types of require nodes that you can wrap your argument / command nodes in to ensure that they are supplied.

Note: you cannot require more than one Command at the same level unless you use RequireAny, as Commands form a fork in the tree and only one at each level can be satisfied.

#### Required

Takes a single node as an argument and ensures it is supplied.

```javascript
Required(
  Arg('arg-name')
)
```

#### RequireAll

Takes any number of nodes as arguments and ensures they are all supplied.

```javascript
RequireAll(
  KWArg('kwarg-name'),
  Arg('arg-name')
)
```

#### RequireAny

Takes any number of nodes as arguments, and ensures that one of them is supplied.

```javascript
RequireAny(
  Command('command1'),
  Command('command2')
)
```

### Callbacks

The Program and Command nodes can take a callback. If satisfied, these callbacks will be called with the `tree` at that level, the `parentTree`, and anything returned from the previous callback.

```shell
program --kwarg=value command
```

```javascript
Program(
  'program',
  {
    callback: function (tree) {
      /*

      tree = {
        name: 'program',
        command: {name: 'command', ...etc},
        args: {},
        flags: {},
        kwargs: {
          kwarg: 'value'
        }
      };

      */

      return 'Hello, World!';
    }
  },
  KWArg(
    'kwarg'
  ),
  Command(
    'command',
    {
      callback: function (tree, parentTree, data) {
        /*

      tree = {
        name: 'command',
        args: {},
        flags: {},
        kwargs: {}
      };

      parentTree = {
        name: 'program',
        command: {name: 'command', ...etc},
        args: {},
        flags: {},
        kwargs: {
          kwarg: 'value'
        }
      };

      data = 'Hello, World!';

      */
      }
    }
  )
)
```

## Command examples

```shell
npm install jargs --save
```

In the above command `install` is a `Command`, `jargs` is an `Arg`, and `--save` is a `Flag`.

```shell
browserify --transform babelify --outfile=build/indexjs src/index.js
```

In the above command `--transform` is a `KWArg` and its value is `babelify`,
`--outfile` is also a `KWArg` (note the alternative kwarg syntax) with the value `build/index.js`,
and `src/index.js` is an `Arg`

## Complex schema examples

This example shows how to create the following commands (taken from [docopt](http://docopt.org/)).

### Commands

```shell
naval_fate ship new <name>...
naval_fate ship <name> move <x> <y> [--speed=<kn>]
naval_fate ship shoot <x> <y>
```

### Schema

```javascript
const tree = collect(
  Program(
    'naval_fate',
    null,
    Command(
      'ship', null,
      RequireAny(
        Arg(
          'shipName'
        ),
        Command(
          'new', null,
          Required(
            Arg(
              'shipName'
            )
          )
        ),
        Command(
          'shoot', null,
          RequireAll(
            Arg(
              'shootX'
            ),
            Arg(
              'shootY'
            )
          )
        )
      ),
      Command(
        'move', null,
        RequireAll(
          Arg(
            'moveX'
          ),
          Arg(
            'moveY'
          )
        ),
        KWArg(
          'speed'
        )
      )
    )
  ),
  process.argv
);
```
