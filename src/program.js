import { getNodeProperties, serializeOptions, validateName } from './utils';

let validOptions = {
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

export function Program() {
  let properties = getNodeProperties(arguments, true);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  properties._type = 'program';
  properties._globals = {};

  return properties;
}
