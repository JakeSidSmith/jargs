# jargs
**Simple node arg parser with explicit tree structure schema**

## About

Unlike other arg parsers, jargs allows you to define your commands, arguments, etc in a tree structure.
This way you can have, for example, nested sub-commands, or arguments that are attached to a specific command.

## Installation

```shell
npm install jargs --save
```

## Usage

### Require jargs

```javascript
import { collect, Command, KWArg, Flag, Arg } from 'jargs';
```

### Create a schema

All nodes, such as those imported above take the following arguments (more about nodes below).

```javascript
Node(name, options, ...children);
```

Here's a cutdown example of how to create a schema for NPM.

```javascript
const root = collect(
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
      save: {
        value: true,
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      }
    },
    args: {
      lib: {
        value: 'jargs',
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      }
    }
  },
  kwargs: {},
  flags: {},
  args: {}
}
```

### Nodes

#### Command

Takes the following options.

```javascript
Command(
  'command-name'
  {
    alias: 'command-alias',
    description: 'A command'
  },
  ...childNodes
)
```

#### KWArg

Takes the following options.

```javascript
KWArg(
  'kwarg-name'
  {
    alias: 'kwarg-alias',
    description: 'A key word argument',
    options: ['option1', 'option2']
  },
  ...childNodes
)
```

#### Flag

Takes the following options.

```javascript
Flag(
  'flag-name'
  {
    alias: 'flag-alias',
    description: 'A flag',
    options: ['option1', 'option2']
  },
  ...childNodes
)
```

#### Arg

Takes the following options.

```javascript
Arg(
  'arg-name'
  {
    alias: 'arg-alias',
    description: 'An arg'
  },
  ...childNodes
)
```
