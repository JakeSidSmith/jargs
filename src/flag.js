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
};

export function Flag() {
  let properties = getNodeProperties(arguments);
  validateName(properties.name);
  serializeOptions(properties.options, validOptions);

  properties._type = 'flag';

  return properties;
}
