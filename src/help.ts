import {
  HelpOptions,
  NodeType,
  ProgramNode,
  ProgramOrCommandChildren,
} from './types';
import { ValidOptions } from './types-internal';
import {
  serializeOptions,
  validateChildren,
  validateName,
  withDefault,
} from './utils';

const VALID_CHILD_NODES = [NodeType.PROGRAM];

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

export function Help<C extends ProgramOrCommandChildren>(
  name: string,
  options: HelpOptions | null,
  ...children: [ProgramNode<C>]
): ProgramNode<C> {
  const finalOptions = serializeOptions(withDefault(options, {}), validOptions);

  if (!children.length) {
    throw new Error('No child nodes supplied to Help node');
  }

  if (children.length > 1) {
    throw new Error('More than one child node supplied to Help node');
  }

  validateChildren(children, VALID_CHILD_NODES);
  validateName(name);

  children[0]._globals.help = {
    _type: NodeType.FLAG,
    name,
    options: finalOptions,
  };

  return children[0];
}
