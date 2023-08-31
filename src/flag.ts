import { FlagArgs } from './types';
import { ValidOptions } from './types-internal';
import {
  getNodeProperties,
  serializeOptions,
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

export function Flag(...args: FlagArgs) {
  const properties = getNodeProperties(args);
  validateName(properties.name);
  serializeOptions(withDefault(properties.options, {}), validOptions);

  return {
    ...properties,
    _type: 'flag',
  };
}
