import { NodeType, RequireAllChildren, RequireAllNode } from './types';
import { validateChildren } from './utils';

const VALID_CHILD_NODES = [
  NodeType.ARG,
  NodeType.FLAG,
  NodeType.KW_ARG,
  NodeType.COMMAND,
];

export function RequireAll<C extends RequireAllChildren>(
  ...children: C
): RequireAllNode<C> {
  if (!children.length) {
    throw new Error('No child nodes supplied to RequireAll node');
  }

  if (children.length < 2) {
    throw new Error(
      'Only one child node supplied to RequireAll node. Use Require node'
    );
  }

  validateChildren(children, VALID_CHILD_NODES);

  return {
    _type: NodeType.REQUIRE_ALL,
    children,
  };
}
