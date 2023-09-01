import { KWArgNode, KWArgOptions, NodeType } from './types';
import { ValidOptions } from './types-internal';
import {
  serializeOptions,
  validateEmptyChildren,
  validateName,
  withDefault,
} from './utils';

const validOptions = {
  alias: {
    type: 'string',
    length: 1,
  },
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

export function KWArg<N extends string>(
  name: N,
  options?: KWArgOptions | null,
  ...children: readonly never[]
): KWArgNode<N> {
  validateName(name);
  validateEmptyChildren(children);
  serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.KW_ARG,
    name,
    options: withDefault(options, {}),
  };
}
