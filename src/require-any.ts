import { ArgNode, CommandNode, FlagNode, KWArgNode } from './types';
import { validateChildren } from './utils';

const VALID_CHILD_NODES = ['arg', 'flag', 'kwarg', 'command'];

export function RequireAny(
  ...children: [
    first: ArgNode | FlagNode | KWArgNode | CommandNode,
    ...rest: readonly (ArgNode | FlagNode | KWArgNode | CommandNode)[],
  ]
) {
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
    _type: 'require-any',
    children: children,
  };
}
