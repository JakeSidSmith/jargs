import { FlagNode, FlagOptions, NodeType } from './types';
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
} satisfies ValidOptions;

export function Flag<N extends string>(
  name: N,
  options?: FlagOptions | null,
  ...children: readonly never[]
): FlagNode<N> {
  validateName(name);
  validateEmptyChildren(children);
  serializeOptions(withDefault(options, {}), validOptions);

  return {
    _type: NodeType.FLAG,
    name,
    options: withDefault(options, {}),
  };
}
