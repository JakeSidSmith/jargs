import { getNodeProperties, serializeOptions, validateName } from './utils';

let validOptions = {
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
};

export function Command() {
  let properties = getNodeProperties(arguments, true);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  properties._type = 'command';

  return properties;
}
