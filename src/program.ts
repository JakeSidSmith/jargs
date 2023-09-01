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

export function Program<N extends string, C extends ProgramOrCommandChildren>(
  name: N,
  options?: ProgramOptions | null,
  ...children: C
): ProgramNode<N, C> {
  validateName(name);
  const finalOptions = serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.PROGRAM,
    _globals: {},
    name,
    options: finalOptions,
    ...getNodeChildren(children),
  };
}
