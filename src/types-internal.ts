import {
  ArgOptions,
  CommandOptions,
  FlagOptions,
  HelpOptions,
  KWArgOptions,
  ProgramOptions,
  ProgramOrCommandChildren,
} from './types';

export type AnyOptions =
  | HelpOptions
  | ProgramOptions<string, ProgramOrCommandChildren>
  | CommandOptions<string, ProgramOrCommandChildren>
  | KWArgOptions
  | FlagOptions
  | ArgOptions;

export interface ValidOptionString {
  type: 'string';
  length?: number;
  default?: string;
}

export interface ValidOptionFunction {
  type: 'function';
}

export interface ValidOptionArray {
  type: 'array';
  default?: readonly never[];
}

export interface ValidOptionBoolean {
  type: 'boolean';
  default?: boolean;
}

export interface ValidOptionObject {
  type: 'object';
}

export interface ValidOptionNumber {
  type: 'number';
}

export type ValidOption =
  | ValidOptionString
  | ValidOptionFunction
  | ValidOptionArray
  | ValidOptionBoolean
  | ValidOptionObject
  | ValidOptionNumber;

export type ValidOptions = Record<string, ValidOption>;

export interface TableFormatOptions {
  wrap: readonly number[];
  alignRight: readonly number[];
}
