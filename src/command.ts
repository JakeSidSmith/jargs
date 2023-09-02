import {
  CommandNode,
  CommandOptions,
  CommandOptionsWithCallback,
  NodeType,
  ProgramOrCommandChildren,
} from './types';
import { ValidOptions } from './types-internal';
import {
  getNodeChildren,
  serializeOptions,
  validateName,
  withDefault,
} from './utils';

const validOptions = {
  alias: {
    type: 'string',
  },
  description: {
    type: 'string',
    default: '',
  },
  usage: {
    type: 'string',
    default: '',
  },
  callback: {
    type: 'function',
  },
  examples: {
    type: 'array',
    default: [],
  },
} satisfies ValidOptions;

export function Command<N extends string, C extends ProgramOrCommandChildren>(
  name: N,
  options: CommandOptionsWithCallback<N, C>,
  ...children: C
): CommandNode<N, C>;
export function Command<N extends string, C extends ProgramOrCommandChildren>(
  name: N,
  options?: CommandOptions | CommandOptionsWithCallback<N, C> | null,
  ...children: C
): CommandNode<N, C>;
export function Command<N extends string, C extends ProgramOrCommandChildren>(
  name: N,
  options?: CommandOptions | CommandOptionsWithCallback<N, C> | null,
  ...children: C
): CommandNode<N, C> {
  validateName(name);
  const finalOptions = serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.COMMAND,
    name,
    options: finalOptions,
    ...getNodeChildren(children),
  };
}
