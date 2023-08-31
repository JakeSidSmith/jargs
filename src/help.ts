import { HelpArgs } from './types';
import { ValidOptions } from './types-internal';
import { serializeOptions, validateChildren, validateName } from './utils';

const VALID_CHILD_NODES = ['program'];

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

export function Help(...args: HelpArgs) {
  const [name, options, ...children] = args;
  serializeOptions(options ?? {}, validOptions);

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
    options: options ?? {},
  };

  return children[0];
}
