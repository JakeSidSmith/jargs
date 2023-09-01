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

export interface AnyArgsOrKWArgs {
  [index: string]: string | undefined | readonly string[];
}

export interface AnyFlags {
  [index: string]: true | undefined;
}

export interface AnyTree {
  name: string;
  command?: AnyTree;
  kwargs: AnyArgsOrKWArgs;
  flags: AnyFlags;
  args: AnyArgsOrKWArgs;
  rest?: readonly string[];
}

export interface HelpOptions {
  description?: string;
  alias?: string;
}

export interface ProgramOptions<
  T extends AnyTree = AnyTree,
  P extends AnyTree | undefined = undefined,
  R = void,
> {
  description?: string;
  usage?: string;
  examples?: ReadonlyArray<string>;
  callback?: (tree: T, parentTree?: P, parentReturned?: R) => void;
}

export interface CommandOptions<
  T extends AnyTree = AnyTree,
  P extends AnyTree | undefined = undefined,
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

export interface ProgramNode<
  N extends string,
  C extends ProgramOrCommandChildren,
> {
  _type: NodeType.PROGRAM;
  _globals: GlobalsInjected;
  _requireAll: InferRequiredChildren<C>;
  _requireAny: InferMaybeRequiredChildren<C>;
  name: N;
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
  | ProgramNode<string, ProgramOrCommandChildren>
  | CommandNode<string, ProgramOrCommandChildren>
  | ArgNode<string>
  | KWArgNode<string>
  | FlagNode<string>
  | RequiredNode<RequiredChildren>
  | RequireAllNode<RequireAllChildren>
  | RequireAnyNode<RequireAnyChildren>;

export type InferKWArgNames<C extends ProgramOrCommandChildren> =
  UnwrapRequiredChildren<C> extends readonly (infer V)[]
    ? V extends KWArgNode<infer N>
      ? N
      : never
    : never;

export type InferFlagNames<C extends ProgramOrCommandChildren> =
  UnwrapRequiredChildren<C> extends readonly (infer V)[]
    ? V extends FlagNode<infer N>
      ? N
      : never
    : never;

export type InferArgNames<C extends ProgramOrCommandChildren> =
  UnwrapRequiredChildren<C> extends readonly (infer V)[]
    ? V extends ArgNode<infer N>
      ? N
      : never
    : never;

export type InferCommands<C extends ProgramOrCommandChildren> =
  UnwrapRequiredChildren<C> extends readonly (infer V)[]
    ? V extends CommandNode<infer CN, infer CC>
      ? CommandNode<CN, CC>
      : never
    : never;

export type InferTree<N extends string, C extends ProgramOrCommandChildren> = {
  name: N;
  kwargs: Partial<Record<InferKWArgNames<C>, string | readonly string[]>>;
  flags: Partial<Record<InferFlagNames<C>, true>>;
  args: Partial<Record<InferArgNames<C>, string | readonly string[]>>;
  rest?: readonly string[];
  command?: InferCommands<C> extends CommandNode<infer CN, infer CC>
    ? {
        [P in CN]: InferTree<P, CC>;
      }[CN]
    : never;
};
