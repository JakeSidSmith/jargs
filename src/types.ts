export type EmptyObject = Record<never, never>;

export interface ArgsOrKWArgs {
  [index: string]: string | undefined | ReadonlyArray<string>;
}

export interface Flags {
  [index: string]: true | undefined;
}

export interface Tree {
  name: string;
  command?: Tree;
  kwargs: ArgsOrKWArgs;
  flags: Flags;
  args: ArgsOrKWArgs;
  rest?: ReadonlyArray<string>;
}

export interface HelpOptions {
  description?: string;
  alias?: string;
}

export interface ProgramOptions<
  T extends Tree = Tree,
  P extends Tree | undefined = undefined,
  R = void,
> {
  description?: string;
  usage?: string;
  examples?: ReadonlyArray<string>;
  callback?: (tree: T, parentTree?: P, parentReturned?: R) => void;
}

export interface CommandOptions<
  T extends Tree = Tree,
  P extends Tree | undefined = undefined,
  R = void,
> {
  description?: string;
  alias?: string;
  usage?: string;
  examples?: ReadonlyArray<string>;
  callback?: (tree: T, parentTree?: P, parentReturned?: R) => void;
  multi?: never;
}

export interface KWArgOptions {
  description?: string;
  alias?: string;
  options?: ReadonlyArray<string>;
  type?: string;
  multi?: boolean;
}

export interface FlagOptions {
  description?: string;
  alias?: string;
  type?: never;
  multi?: never;
}

export interface ArgOptions {
  description?: string;
  alias?: never;
  options?: ReadonlyArray<string>;
  type?: string;
  multi?: boolean;
}

export type AnyOptions =
  | HelpOptions
  | ProgramOptions
  | CommandOptions
  | KWArgOptions
  | FlagOptions
  | ArgOptions;

export type HelpArgs =
  | [name: string, options?: HelpOptions | null]
  | [name: string, options: HelpOptions | null, program: ProgramNode];
export type ProgramArgs = [
  name: string,
  options?: ProgramOptions | null,
  ...children: readonly (
    | CommandNode
    | ArgNode
    | FlagNode
    | KWArgNode
    | RequireAllNode
    | RequireAnyNode
    | RequiredNode
  )[],
];
export type CommandArgs = [
  name: string,
  options?: CommandOptions | null,
  ...children: readonly (
    | ArgNode
    | FlagNode
    | KWArgNode
    | RequireAllNode
    | RequireAnyNode
    | RequiredNode
  )[],
];
export type ArgArgs = [name: string, options?: ArgOptions | null];
export type KWArgArgs = [name: string, options?: KWArgOptions | null];
export type FlagArgs = [name: string, options?: FlagOptions | null];

export type CollectArgs = [
  rootNode: HelpNode | ProgramNode,
  argv: readonly string[],
];

export type AnyArgs =
  | HelpArgs
  | ProgramArgs
  | CommandArgs
  | ArgArgs
  | KWArgArgs
  | FlagArgs;

export interface HelpNode {
  _type: 'help';
  name: string;
  options: HelpOptions;
}

export interface GlobalsInjected {
  help?: Omit<HelpNode, '_type'> & {
    _type: 'flag';
  };
}

export interface ProgramNode {
  _type: 'program';
  _globals: GlobalsInjected;
  _requireAll: readonly (ArgNode | FlagNode | KWArgNode | CommandNode)[];
  _requireAny: readonly (readonly (
    | ArgNode
    | FlagNode
    | KWArgNode
    | CommandNode
  )[])[];
  name: string;
  options: ProgramOptions;
  children: readonly (ArgNode | KWArgNode | FlagNode | CommandNode)[];
}

export interface CommandNode {
  _type: 'command';
  _requireAll: readonly (ArgNode | FlagNode | KWArgNode | CommandNode)[];
  _requireAny: readonly (readonly (
    | ArgNode
    | FlagNode
    | KWArgNode
    | CommandNode
  )[])[];
  name: string;
  options: CommandOptions;
  children: readonly (ArgNode | KWArgNode | FlagNode | CommandNode)[];
}

export interface ArgNode {
  _type: 'arg';
  name: string;
  options: ArgOptions;
}

export interface KWArgNode {
  _type: 'kwarg';
  name: string;
  options: KWArgOptions;
}

export interface FlagNode {
  _type: 'flag';
  name: string;
  options: FlagOptions;
}

export interface RequiredNode {
  _type: 'required';
  children: [ArgNode | FlagNode | KWArgNode | CommandNode];
}

export interface RequireAllNode {
  _type: 'require-all';
  children: [
    first: ArgNode | FlagNode | KWArgNode | CommandNode,
    ...rest: readonly (ArgNode | FlagNode | KWArgNode | CommandNode)[],
  ];
}

export interface RequireAnyNode {
  _type: 'require-any';
  children: [
    first: ArgNode | FlagNode | KWArgNode | CommandNode,
    ...rest: readonly (ArgNode | FlagNode | KWArgNode | CommandNode)[],
  ];
}

export type AnyNode =
  | HelpNode
  | ProgramNode
  | CommandNode
  | ArgNode
  | KWArgNode
  | FlagNode
  | RequiredNode
  | RequireAllNode
  | RequireAnyNode;
