import { NodeType, RequireAnyChildren, RequireAnyNode } from './types';
import { validateChildren } from './utils';

const VALID_CHILD_NODES = [
  NodeType.ARG,
  NodeType.FLAG,
  NodeType.KW_ARG,
  NodeType.COMMAND,
];

export function RequireAny<C extends RequireAnyChildren>(
  ...children: C
): RequireAnyNode<C> {
  if (!children.length) {
    throw new Error('No child nodes supplied to RequireAny node');
  }

  if (children.length < 2) {
    throw new Error(
      'Only one child node supplied to RequireAny node. Use Require node'
    );
  }

  validateChildren(children, VALID_CHILD_NODES);

  return {
    _type: NodeType.REQUIRE_ANY,
    children,
  };
}
