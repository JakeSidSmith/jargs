import { NodeType, RequiredChildren, RequiredNode } from './types';
import { validateChildren } from './utils';

const VALID_CHILD_NODES = [
  NodeType.ARG,
  NodeType.FLAG,
  NodeType.KW_ARG,
  NodeType.COMMAND,
];

export function Required<C extends RequiredChildren>(
  ...children: C
): RequiredNode<C> {
  if (!children.length) {
    throw new Error('No child nodes supplied to Required node');
  }

  if (children.length > 1) {
    throw new Error(
      'More than one child node supplied to Required node. Use RequireAll node'
    );
  }

  validateChildren(children, VALID_CHILD_NODES);

  return {
    _type: NodeType.REQUIRED,
    children,
  };
}
