import { getNodeProperties, serializeOptions, validateName } from './utils';

let validOptions = {
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
};

export function Arg() {
  let properties = getNodeProperties(arguments);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  properties._type = 'arg';

  return properties;
}
