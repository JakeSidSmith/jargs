declare module 'jargs' {

  export type HelpOrProgram = Help | Program;

  export function collect <T extends Tree>(rootNode: HelpOrProgram, argv: ReadonlyArray<string>): T;

  export interface ArgsOrKWArgs {
    [index: string]: string | undefined | ReadonlyArray<undefined>;
  }

  export interface Flags {
    [index: string]: true | undefined;
  }

  export interface Tree<C extends Tree | undefined = undefined, K extends ArgsOrKWArgs = {}, F extends Flags = {}, A extends ArgsOrKWArgs = {}> {
    name: string;
    command?: C;
    kwargs: K;
    flags: F;
    args: A;
    rest?: ReadonlyArray<string>;
  }

  export interface HelpProps {
    description?: string;
    alias?: string;
  }

  export interface ProgramProps {
    description?: string;
    usage?: string;
    examples?: ReadonlyArray<string>;
    callback?: <T extends Tree, P extends Tree = Tree, R = void>(tree: T, parentTree?: P, parentReturned?: R) => void;
  }

  export interface CommandProps {
    description?: string;
    alias?: string;
    usage?: string;
    examples?: ReadonlyArray<string>;
    callback?: <T extends Tree, P extends Tree = Tree, R = void>(tree: T, parentTree?: P, parentReturned?: R) => void;
  }

  export interface KWArgProps {
    description?: string;
    alias?: string;
    options?: ReadonlyArray<string>;
    type?: string;
    multi?: boolean;
  }

  export interface FlagProps {
    description?: string;
    alias?: string;
  }

  export interface ArgProps {
    description?: string;
    options?: ReadonlyArray<string>;
    type?: string;
    multi?: boolean;
  }

  export interface Help {
    _type: 'help';
    name: string;
    options: HelpProps;
  }

  export interface Program {
    _type: 'program';
    name: string;
    options: ProgramProps;
    _requireAll: ReadonlyArray<ProgramOrCommandChild>;
    _requireAny: ReadonlyArray<ProgramOrCommandChild>;
    children: ReadonlyArray<ProgramOrCommandChild>;
  }

  export interface Command {
    _type: 'command';
    name: string;
    options: CommandProps;
    _requireAll: ReadonlyArray<ProgramOrCommandChild>;
    _requireAny: ReadonlyArray<ProgramOrCommandChild>;
    children: ReadonlyArray<ProgramOrCommandChild>;
  }

  export interface KWArg {
    _type: 'kwarg';
    name: string;
    options: KWArgProps;
  }

  export interface Flag {
    _type: 'flag';
    name: string;
    options: FlagProps;
  }

  export interface Arg {
    _type: 'arg';
    name: string;
    options: ArgProps;
  }

  export interface Required {
    _type: 'required';
    children: ReadonlyArray<RequiredChild>;
  }

  export interface RequireAll {
    _type: 'require-all';
    children: ReadonlyArray<RequiredChild>;
  }

  export interface RequireAny {
    _type: 'require-any';
    children: ReadonlyArray<RequiredChild>;
  }

  export type RequiredChild =
    Command |
    KWArg |
    Flag |
    Arg;

  export type ProgramOrCommandChild =
    Command |
    KWArg |
    Flag |
    Arg |
    Required |
    RequireAll |
    RequireAny;

  export function Help (name: string, props: HelpProps | null | undefined, program: Program): Help;
  export function Program (name: string, props?: ProgramProps | null, ...nodes: ReadonlyArray<ProgramOrCommandChild>): Program;
  export function Command (name: string, props?: CommandProps | null, ...nodes: ReadonlyArray<ProgramOrCommandChild>): Command;
  export function KWArg (name: string, props?: KWArgProps | null): KWArg;
  export function Flag (name: string, props?: FlagProps | null): Flag;
  export function Arg (name: string, props?: ArgProps | null): Arg;
  export function Required (node: RequiredChild): Required;
  export function RequireAll (...nodes: ReadonlyArray<RequiredChild>): RequireAll;
  export function RequireAny (...nodes: ReadonlyArray<RequiredChild>): RequireAny;

}
