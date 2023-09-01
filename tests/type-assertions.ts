import {
  Arg,
  ArgNode,
  collect,
  Command,
  CommandNode,
  Flag,
  FlagNode,
  Help,
  KWArg,
  KWArgNode,
  Program,
  ProgramNode,
  ProgramOrCommandChildren,
  RequireAll,
  RequireAllNode,
  RequireAny,
  RequireAnyNode,
  Required,
  RequiredNode,
} from '../src';

describe('type assertions', () => {
  it('does nothing', () => {
    expect(true).toBe(true);
  });
});

Arg('arg') satisfies ArgNode<'arg'>;

KWArg('kwarg', {
  alias: 'k',
  options: ['a', 'b', 'c'],
}) satisfies KWArgNode<'kwarg'>;

Flag('flag', { alias: 'f' }) satisfies FlagNode<'flag'>;

Help('help', { alias: 'h' }, Program('program')) satisfies ProgramNode<
  'program',
  ProgramOrCommandChildren
>;

Program(
  'program',
  {
    description: 'A program',
  },
  Command('command'),
  Arg('arg')
) satisfies ProgramNode<
  'program',
  readonly (CommandNode<'command', ProgramOrCommandChildren> | ArgNode<'arg'>)[]
>;

Required(Arg('arg')) satisfies RequiredNode<readonly [ArgNode<'arg'>]>;

RequireAll(Arg('arg'), Flag('flag')) satisfies RequireAllNode<
  readonly (ArgNode<'arg'> | FlagNode<'flag'>)[]
>;

RequireAny(Arg('arg'), Flag('flag')) satisfies RequireAnyNode<
  readonly (ArgNode<'arg'> | FlagNode<'flag'>)[]
>;

const commandTree = Command(
  'command',
  { alias: 'c' },
  Arg('arg'),
  RequireAny(Arg('any-arg'), KWArg('any-kwarg')),
  RequireAny(Arg('any-arg2'), KWArg('any-kwarg2')),
  Required(Arg('required-arg')),
  RequireAll(Arg('all-arg'), KWArg('all-kwarg'))
) satisfies CommandNode<
  'command',
  readonly (
    | ArgNode<'arg'>
    | RequireAnyNode<
        readonly [ArgNode<'any-arg'>, ...(readonly KWArgNode<'any-kwarg'>[])]
      >
    | RequireAnyNode<
        readonly [ArgNode<'any-arg2'>, ...(readonly KWArgNode<'any-kwarg2'>[])]
      >
    | RequiredNode<readonly [ArgNode<'required-arg'>]>
    | RequireAllNode<
        readonly [ArgNode<'all-arg'>, ...(readonly KWArgNode<'all-kwarg'>[])]
      >
  )[]
>;

commandTree._requireAll satisfies readonly (
  | ArgNode<'required-arg'>
  | ArgNode<'all-arg'>
  | KWArgNode<'all-kwarg'>
)[];

commandTree._requireAny satisfies readonly (readonly (
  | ArgNode<'any-arg'>
  | KWArgNode<'any-kwarg'>
  | ArgNode<'any-arg2'>
  | KWArgNode<'any-kwarg2'>
)[])[];

commandTree.children satisfies readonly (
  | ArgNode<'arg'>
  | ArgNode<'any-arg'>
  | KWArgNode<'any-kwarg'>
  | ArgNode<'any-arg2'>
  | KWArgNode<'any-kwarg2'>
  | ArgNode<'required-arg'>
  | ArgNode<'all-arg'>
  | KWArgNode<'all-kwarg'>
)[];

const tree = collect(
  Help(
    'help',
    { alias: 'h' },
    Program(
      'program',
      null,
      commandTree,
      Command('basic-command'),
      Flag('program-flag'),
      Arg('program-arg')
    )
  ),
  ['node', 'nope']
) satisfies {
  name: 'program';
  kwargs: Partial<Record<never, string | readonly string[]>>;
  flags: Partial<Record<'program-flag', true>>;
  args: Partial<Record<'program-arg', string | readonly string[]>>;
  command?:
    | {
        name: 'command';
        kwargs: Partial<
          Record<
            'any-kwarg' | 'any-kwarg2' | 'all-kwarg',
            string | readonly string[]
          >
        >;
        flags: Partial<Record<never, true>>;
        args: Partial<
          Record<
            'arg' | 'any-arg' | 'any-arg2' | 'required-arg' | 'all-arg',
            string | readonly string[]
          >
        >;
      }
    | {
        name: 'basic-command';
        kwargs: Partial<Record<never, string | readonly string[]>>;
        flags: Partial<Record<never, true>>;
        args: Partial<Record<never, string | readonly string[]>>;
      };
};

tree.flags['program-flag'] satisfies true | undefined;
tree.args['program-arg'] satisfies string | readonly string[] | undefined;

tree.command satisfies
  | undefined
  | {
      name: 'command';
      kwargs: Partial<
        Record<
          'any-kwarg' | 'any-kwarg2' | 'all-kwarg',
          string | readonly string[]
        >
      >;
      flags: Partial<Record<never, true>>;
      args: Partial<
        Record<
          'arg' | 'any-arg' | 'any-arg2' | 'required-arg' | 'all-arg',
          string | readonly string[]
        >
      >;
    }
  | {
      name: 'basic-command';
      kwargs: Partial<Record<never, string | readonly string[]>>;
      flags: Partial<Record<never, true>>;
      args: Partial<Record<never, string | readonly string[]>>;
    };

if (tree.command?.name === 'basic-command') {
  tree.command.kwargs satisfies Partial<
    Record<never, string | readonly string[]>
  >;
  tree.command.flags satisfies Partial<Record<never, true>>;
  tree.command.args satisfies Partial<
    Record<never, string | readonly string[]>
  >;
} else if (tree.command?.name === 'command') {
  tree.command.kwargs satisfies Partial<
    Record<'any-kwarg' | 'any-kwarg2' | 'all-kwarg', string | readonly string[]>
  >;
  tree.command.flags satisfies Partial<Record<never, true>>;
  tree.command.args satisfies Partial<
    Record<
      'arg' | 'any-arg' | 'any-arg2' | 'required-arg' | 'all-arg',
      string | readonly string[]
    >
  >;

  tree.command.kwargs['all-kwarg'] satisfies
    | string
    | readonly string[]
    | undefined;
  tree.command.args['all-arg'] satisfies string | readonly string[] | undefined;
}
