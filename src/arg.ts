import { ArgArgs, ArgNode } from './types';
import { ValidOptions } from './types-internal';
import {
  getNodeProperties,
  serializeOptions,
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

export function Arg(...args: ArgArgs) {
  const properties = getNodeProperties(args);
  validateName(properties.name);
  serializeOptions(withDefault(properties.options, {}), validOptions);

  return {
    ...properties,
    _type: 'arg',
  } as ArgNode;
}
