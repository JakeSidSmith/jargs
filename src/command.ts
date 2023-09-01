import {
  CommandNode,
  CommandOptions,
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
  options?: CommandOptions | null,
  ...children: C
): CommandNode<N, C> {
  validateName(name);
  serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.COMMAND,
    name,
    options: withDefault(options, {}),
    ...getNodeChildren(children),
  };
}
