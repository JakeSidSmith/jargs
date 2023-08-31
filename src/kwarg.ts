import { KWArgArgs } from './types';
import { ValidOptions } from './types-internal';
import { getNodeProperties, serializeOptions, validateName } from './utils';

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

export function KWArg(...args: KWArgArgs) {
  const properties = getNodeProperties(args);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  return {
    ...properties,
    _type: 'kwarg',
  };
}
