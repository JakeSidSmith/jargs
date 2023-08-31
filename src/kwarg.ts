import { getNodeProperties, serializeOptions, validateName } from './utils';

let validOptions = {
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
};

export function KWArg() {
  let properties = getNodeProperties(arguments);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  properties._type = 'kwarg';

  return properties;
}
