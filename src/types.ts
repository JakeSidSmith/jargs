export enum NodeType {
  HELP = 'help',
  PROGRAM = 'program',
  COMMAND = 'command',
  ARG = 'arg',
  KW_ARG = 'kwarg',
  FLAG = 'flag',
  REQUIRED = 'required',
  REQUIRE_ALL = 'require-all',
  REQUIRE_ANY = 'require-any',
}

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
}

export interface ArgOptions {
  description?: string;
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

export type CollectArgs = [
  rootNode: ProgramNode<ProgramOrCommandChildren>,
  argv: readonly string[],
];

export type AnyArgs = [
  name: string,
  options: AnyOptions | null,
  ...children: readonly AnyNode[],
];

export interface HelpNode {
  _type: NodeType.HELP;
  name: string;
  options: HelpOptions;
}

export interface GlobalsInjected {
  help?: Omit<HelpNode, '_type'> & {
    _type: NodeType.FLAG;
  };
}

export type AnyRequiredChild =
  | ArgNode<string>
  | FlagNode<string>
  | KWArgNode<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | CommandNode<string, readonly any[]>;

export type RequiredChildren = readonly [AnyRequiredChild];

export type RequireAllChildren = readonly [
  AnyRequiredChild,
  ...(readonly AnyRequiredChild[]),
];

export type RequireAnyChildren = readonly [
  AnyRequiredChild,
  ...(readonly AnyRequiredChild[]),
];

export type AnyRequiredChildren =
  | RequiredChildren
  | RequireAllChildren
  | RequireAnyChildren;

export type ProgramOrCommandChildren = readonly (
  | ArgNode<string>
  | FlagNode<string>
  | KWArgNode<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | CommandNode<string, readonly any[]>
  | RequireAllNode<RequireAllChildren>
  | RequireAnyNode<RequireAnyChildren>
  | RequiredNode<RequiredChildren>
)[];

export interface ProgramNode<C extends ProgramOrCommandChildren> {
  _type: NodeType.PROGRAM;
  _globals: GlobalsInjected;
  _requireAll: InferRequiredChildren<C>;
  _requireAny: InferMaybeRequiredChildren<C>;
  name: string;
  options: ProgramOptions;
  children: UnwrapRequiredChildren<C>;
}

export type InferRequiredChildren<C extends ProgramOrCommandChildren> =
  readonly (C extends readonly (infer V)[]
    ? V extends RequiredNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : V extends RequireAllNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : never
    : never)[];

export type InferMaybeRequiredChildren<C extends ProgramOrCommandChildren> =
  readonly (readonly (C extends readonly (infer V)[]
    ? V extends RequireAnyNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : never
    : never)[])[];

export type UnwrapRequiredChildren<C extends ProgramOrCommandChildren> =
  readonly (C extends readonly (infer V)[]
    ? V extends RequiredNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : V extends RequireAllNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : V extends RequireAnyNode<infer R>
      ? R extends readonly (infer I)[]
        ? I
        : never
      : V
    : never)[];

export interface CommandNode<
  N extends string,
  C extends ProgramOrCommandChildren,
> {
  _type: NodeType.COMMAND;
  _requireAll: InferRequiredChildren<C>;
  _requireAny: InferMaybeRequiredChildren<C>;
  name: N;
  options: CommandOptions;
  children: UnwrapRequiredChildren<C>;
}

export interface ArgNode<N extends string> {
  _type: NodeType.ARG;
  name: N;
  options: ArgOptions;
}

export interface KWArgNode<N extends string> {
  _type: NodeType.KW_ARG;
  name: N;
  options: KWArgOptions;
}

export interface FlagNode<N extends string> {
  _type: NodeType.FLAG;
  name: N;
  options: FlagOptions;
}

export interface RequiredNode<
  C extends readonly [
    | ArgNode<string>
    | FlagNode<string>
    | KWArgNode<string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | CommandNode<string, readonly any[]>,
  ],
> {
  _type: NodeType.REQUIRED;
  children: C;
}

export interface RequireAllNode<
  C extends readonly (
    | ArgNode<string>
    | FlagNode<string>
    | KWArgNode<string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | CommandNode<string, readonly any[]>
  )[],
> {
  _type: NodeType.REQUIRE_ALL;
  children: C;
}

export interface RequireAnyNode<
  C extends readonly (
    | ArgNode<string>
    | FlagNode<string>
    | KWArgNode<string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | CommandNode<string, readonly any[]>
  )[],
> {
  _type: NodeType.REQUIRE_ANY;
  children: C;
}

export type AnyNode =
  | HelpNode
  | ProgramNode<ProgramOrCommandChildren>
  | CommandNode<string, ProgramOrCommandChildren>
  | ArgNode<string>
  | KWArgNode<string>
  | FlagNode<string>
  | RequiredNode<RequiredChildren>
  | RequireAllNode<RequireAllChildren>
  | RequireAnyNode<RequireAnyChildren>;
