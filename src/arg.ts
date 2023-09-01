import { ArgNode, ArgOptions, NodeType } from './types';
import { ValidOptions } from './types-internal';
import {
  serializeOptions,
  validateEmptyChildren,
  validateName,
  withDefault,
} from './utils';

const validOptions = {
  description: {
    type: 'string',
    default: '',
  },
  options: {
    type: 'array',
  },
  type: {
    type: 'string',
  },
  multi: {
    type: 'boolean',
    default: false,
  },
} satisfies ValidOptions;

export function Arg<N extends string>(
  name: N,
  options?: ArgOptions | null,
  ...children: readonly never[]
): ArgNode<N> {
  validateName(name);
  validateEmptyChildren(children);
  serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.ARG,
    name,
    options: withDefault(options, {}),
  };
}
