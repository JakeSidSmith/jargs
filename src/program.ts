import { ProgramArgs } from './types';
import { ValidOptions } from './types-internal';
import { getNodeProperties, serializeOptions, validateName } from './utils';

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

export function Program(...args: ProgramArgs) {
  const properties = getNodeProperties(args, true);
  validateName(properties.name);
  serializeOptions(properties.options ?? {}, validOptions);

  return {
    ...properties,
    _type: 'program',
    _globals: {},
  };
}
