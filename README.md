# jargs [![CircleCI](https://circleci.com/gh/JakeSidSmith/jargs.svg?style=svg)](https://circleci.com/gh/JakeSidSmith/jargs)
**Simple node arg parser with explicit tree structure schema**

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
import { collect, Program, Command, KWArg, Flag, Arg } from 'jargs';
```

### Create a schema

Here's a cutdown example of how to create a schema for NPM.

Note: you can nest nodes as many times as necessary.

```javascript
const root = collect(
  Program(
    'npm',
    null,
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
);
```

This collects the arguments that match the schema you've defined.

Calling the command `npm` returns the following.

```javascript
{
  command: null,
  kwargs: {},
  flags: {},
  args: {}
}
```

Calling the command `npm install jargs --save` returns the following.

```javascript
{
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

### Querying the tree

Each node always contains the keys `command`, `kwargs`, `flags`, and `args` so that you can easily query them.

#### Querying Commands

```javascript
if (root.command) {
  switch (root.command.name) {
    case 'install':
      // Install stuff
      break;
    default:
      // This should never be hit since we check for the command existence first
  }
}
```

#### Querying Flags, KWArgs, and Args

##### Flags

```javascript
if (root.flags.verbose) {
  doSomethingWithThisFlag(root.flags.verbose);
}
```

##### KWArgs

```javascript
if ('lib' in root.kwargs) {
  doSomethingWithThisKWArg(root.kwargs.lib);
}
```

##### Args

```javascript
if ('lib' in root.args) {
  doSomethingWithThisArg(root.args.lib);
}
```

### Nodes

All nodes take the following arguments, though `Command` and `Program` take additional arguments (more info about individual nodes below).

```javascript
Node(name, options);
```

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
    callback: function () {}
  },
  ...childNodes
)
```

#### Command

A sub-command of your command line interface.
Program is the main command / name of your program.

Takes the following options.

```javascript
Command(
  'command-name'
  {
    alias: 'command-alias', // default: undefined
    description: 'A command', // default: empty string
    usage: 'program-name sub-command --flag', // default: empty string
    examples: ['program command-name --flag'], // default: empty array
    required: true, // default: false
    callback: function () {}
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
    required: true, // default: false
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
    required: true, // default: false
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
    required: true, // default: false
  }
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
const root = collect(
  Program(
    'naval_fate',
    null,
    Command(
      'ship', null,
      Arg(
        'shipName'
      ),
      Command(
        'new', null,
        Arg(
          'newShipName', {required: true}
        )
      ),
      Command(
        'shoot', null,
        Arg(
          'shootX', {required: true}
        ),
        Arg(
          'shootY', {required: true}
        )
      ),
      Command(
        'move', null,
        Arg(
          'moveX', {required: true}
        ),
        Arg(
          'moveY', {required: true}
        ),
        KWArg(
          'speed'
        )
      )
    )
  )
);
```
