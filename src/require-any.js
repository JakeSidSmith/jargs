import { argsToArray, validateChildren } from './utils';

let VALID_CHILD_NODES = ['arg', 'flag', 'kwarg', 'command'];

export function RequireAny() {
  let children = argsToArray(arguments);

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
