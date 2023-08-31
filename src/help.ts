import {
  argsToArray,
  serializeOptions,
  validateChildren,
  validateName,
} from './utils';

let VALID_CHILD_NODES = ['program'];

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

export function Help() {
  let children = argsToArray(arguments);
  let name = children.shift();
  let options = children.shift() || {};
  serializeOptions(options, validOptions);

  if (!children.length) {
    throw new Error('No child nodes supplied to Help node');
  }

  if (children.length > 1) {
    throw new Error('More than one child node supplied to Help node');
  }

  validateChildren(children, VALID_CHILD_NODES);
  validateName(name);

  children[0]._globals.help = {
    _type: 'flag',
    name: name,
    options: options,
  };

  return children[0];
}
