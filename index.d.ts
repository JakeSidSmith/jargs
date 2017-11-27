declare module 'jargs' {

  export type HelpOrProgram = Help | Program;

  export function collect (rootNode: HelpOrProgram, argv: string[]): Tree;

  export interface ArgsOrKWArgs {
    [index: string]: string | undefined | Array<string | undefined>;
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
    rest?: Array<string | undefined>;
  }

  export interface HelpProps {
    description?: string;
    alias?: string;
  }

  export interface ProgramProps {
    description?: string;
    usage?: string;
    examples?: string[];
    callback?: (tree: Tree, parentTree?: Tree, returned?: any) => any;
  }

  export interface CommandProps {
    description?: string;
    alias?: string;
    usage?: string;
    examples?: string[];
    callback?: (tree: Tree, parentTree?: Tree, returned?: any) => any;
  }

  export interface KWArgProps {
    description?: string;
    alias?: string;
    options?: string[];
    type?: string;
    multi?: boolean;
  }

  export interface FlagProps {
    description?: string;
    alias?: string;
  }

  export interface ArgProps {
    description?: string;
    options?: string[];
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
    _requireAll: ProgramOrCommandChild[];
    _requireAny: ProgramOrCommandChild[];
    children: ProgramOrCommandChild[];
  }

  export interface Command {
    _type: 'command';
    name: string;
    options: CommandProps;
    _requireAll: ProgramOrCommandChild[];
    _requireAny: ProgramOrCommandChild[];
    children: ProgramOrCommandChild[];
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
    children: RequiredChild[];
  }

  export interface RequireAll {
    _type: 'require-all';
    children: RequiredChild[];
  }

  export interface RequireAny {
    _type: 'require-any';
    children: RequiredChild[];
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
  export function Program (name: string, props?: ProgramProps | null, ...nodes: ProgramOrCommandChild[]): Program;
  export function Command (name: string, props?: CommandProps | null, ...nodes: ProgramOrCommandChild[]): Command;
  export function KWArg (name: string, props?: KWArgProps | null): KWArg;
  export function Flag (name: string, props?: FlagProps | null): Flag;
  export function Arg (name: string, props?: ArgProps | null): Arg;
  export function Required (node: RequiredChild): Required;
  export function RequireAll (...nodes: RequiredChild[]): RequireAll;
  export function RequireAny (...nodes: RequiredChild[]): RequireAny;

}
