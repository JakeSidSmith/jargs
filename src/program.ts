import {
  NodeType,
  ProgramNode,
  ProgramOptions,
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

export function Program<C extends ProgramOrCommandChildren>(
  name: string,
  options?: ProgramOptions | null,
  ...children: C
): ProgramNode<C> {
  validateName(name);
  serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.PROGRAM,
    _globals: {},
    name,
    options: withDefault(options, {}),
    ...getNodeChildren(children),
  };
}
