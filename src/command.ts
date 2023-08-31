import { CommandArgs } from './types';
import { ValidOptions } from './types-internal';
import { getNodeProperties, serializeOptions, validateName } from './utils';

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

export function Command(...args: CommandArgs) {
  const properties = getNodeProperties(args, true);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  return {
    ...properties,
    _type: 'command',
  };
}
