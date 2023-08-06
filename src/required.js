import { argsToArray, validateChildren } from './utils';

let VALID_CHILD_NODES = ['arg', 'flag', 'kwarg', 'command'];

export function Required() {
  let children = argsToArray(arguments);

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
    _type: 'required',
    children: children,
  };
}
