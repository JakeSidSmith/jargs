import {
  Arg,
  ArgNode,
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

Arg('arg') satisfies ArgNode<'arg'>;

KWArg('kwarg', {
  alias: 'k',
  options: ['a', 'b', 'c'],
}) satisfies KWArgNode<'kwarg'>;

Flag('flag', { alias: 'f' }) satisfies FlagNode<'flag'>;

Help(
  'help',
  { alias: 'h' },
  Program('program')
) satisfies ProgramNode<ProgramOrCommandChildren>;

Program(
  'program',
  {
    description: 'A program',
  },
  Command('command'),
  Arg('arg')
) satisfies ProgramNode<
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