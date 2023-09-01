import {
  AnyNode,
  ArgNode,
  CommandNode,
  FlagNode,
  GlobalsInjected,
  InferMaybeRequiredChildren,
  InferRequiredChildren,
  KWArgNode,
  NodeType,
  ProgramNode,
  ProgramOrCommandChildren,
  UnwrapRequiredChildren,
} from './types';
import { AnyOptions, TableFormatOptions, ValidOptions } from './types-internal';

const MATCHES_LEADING_AND_TRAILING_SPACES = /(^\s+|\s+$)/;
const MATCHES_TRAILING_SPACES = /\s+$/;
const MATCHES_SPACE = /\s/;
const MATCHES_BAD_NAME_CHARS = /[^a-z0-9-]/i;

const MATCHES_ARG_TYPE = /\b(?:arg)\b/i;
const MATCHES_KWARG_TYPE = /\b(kwarg|flag)\b/i;

const VALID_CHILD_NODES = [
  NodeType.ARG,
  NodeType.FLAG,
  NodeType.KW_ARG,
  NodeType.COMMAND,
  NodeType.REQUIRE_ANY,
  NodeType.REQUIRE_ALL,
  NodeType.REQUIRED,
];

const TABLE_OPTIONS = {
  indentation: '    ',
  margin: '  ',
  width: 80,
};

const several = <T>(
  arr: readonly T[],
  fn: (item: T, index: number) => boolean
) =>
  arr.reduce((count, item, index) => {
    if (fn(item, index)) {
      return count + 1;
    }

    return count;
  }, 0) > 1;

const sum = (arr: readonly number[]) =>
  arr.reduce((count, item) => count + item, 0);

function withDefault<T>(value: T, defaultValue: Exclude<T, null | undefined>) {
  /* istanbul ignore next */
  return (value ?? defaultValue) as Exclude<T, null | undefined>;
}

function validateChildren(
  children: readonly AnyNode[],
  validTypes: readonly NodeType[]
) {
  const argNames: string[] = [];
  const kwargNames: string[] = [];
  const kwargAliases: string[] = [];
  const otherNames: string[] = [];
  const otherAliases: string[] = [];

  children.forEach((node) => {
    if (typeof node !== 'object') {
      throw new Error('Invalid child node of type ' + typeof node);
    }

    if (validTypes.indexOf(node._type) < 0) {
      throw new Error(
        'Invalid child node with type ' +
          node._type +
          '. Child nodes may only be ' +
          validTypes.join(', ')
      );
    }

    if ('name' in node && node.name) {
      if (MATCHES_ARG_TYPE.test(node._type)) {
        if (argNames.indexOf(node.name) >= 0) {
          throw new Error(
            'More than one node with the name "' +
              node.name +
              '" at the same level'
          );
        }

        argNames.push(node.name);
      } else if (MATCHES_KWARG_TYPE.test(node._type)) {
        if (kwargNames.indexOf(node.name) >= 0) {
          throw new Error(
            'More than one node with the name "' +
              node.name +
              '" at the same level'
          );
        }

        kwargNames.push(node.name);
      } else {
        if (otherNames.indexOf(node.name) >= 0) {
          throw new Error(
            'More than one node with the name "' +
              node.name +
              '" at the same level'
          );
        }

        otherNames.push(node.name);
      }
    }

    if (
      'options' in node &&
      node.options &&
      'alias' in node.options &&
      node.options.alias
    ) {
      if (MATCHES_KWARG_TYPE.test(node._type)) {
        if (kwargAliases.indexOf(node.options.alias) >= 0) {
          throw new Error(
            'More than one node with the alias "' +
              node.options.alias +
              '" at the same level'
          );
        }

        kwargAliases.push(node.options.alias);
      } else {
        if (otherAliases.indexOf(node.options.alias) >= 0) {
          throw new Error(
            'More than one node with the alias "' +
              node.options.alias +
              '" at the same level'
          );
        }

        otherAliases.push(node.options.alias);
      }
    }
  });
}

function getNodeChildren<C extends ProgramOrCommandChildren>(children: C) {
  validateChildren(children, VALID_CHILD_NODES);

  let _requireAll: InferRequiredChildren<C> = [];
  let _requireAny: InferMaybeRequiredChildren<C> = [];
  let collectedChildren: UnwrapRequiredChildren<C> = [];

  children.forEach((child) => {
    switch (child._type) {
      case NodeType.REQUIRED:
      case NodeType.REQUIRE_ALL:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _requireAll = _requireAll.concat(child.children as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collectedChildren = collectedChildren.concat(child.children as any);
        break;
      case NodeType.REQUIRE_ANY:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _requireAny = _requireAny.concat([child.children as any]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collectedChildren = collectedChildren.concat(child.children as any);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collectedChildren = collectedChildren.concat(child as any);
        break;
    }
  });

  const moreThanOneCommand = several(_requireAll, function (child) {
    return child._type === NodeType.COMMAND;
  });

  if (moreThanOneCommand) {
    throw new Error(
      'More than one required Command at the same level. Use RequireAny'
    );
  }

  return {
    _requireAll,
    _requireAny,
    children: collectedChildren,
  };
}

function validateEmptyChildren(children: readonly never[]) {
  if (children.length) {
    throw new Error('Only commands can have children');
  }
}

function validateName(name: unknown): asserts name is string {
  if (typeof name !== 'string') {
    throw new Error('Names and aliases must be a string');
  }

  if (!name) {
    throw new Error('Names and aliases cannot be empty');
  }

  if (MATCHES_BAD_NAME_CHARS.test(name)) {
    throw new Error(
      'Names and aliases may only contain letters, numbers, and hyphens'
    );
  }

  if (name.indexOf('-') === 0) {
    throw new Error("Names and aliases cannot begin with '-'");
  }
}

function serializeOptions(options: AnyOptions, validOptions: ValidOptions) {
  if (
    !(typeof options === 'undefined' || typeof options === 'object') ||
    Array.isArray(options)
  ) {
    throw new Error('Options must be an object');
  }

  if ('_type' in options) {
    throw new Error(
      "It looks like you've accidentally passed a node as another node's second argument (options)"
    );
  }

  Object.entries(options).forEach(([key, option]) => {
    if (!(key in validOptions)) {
      throw new Error("Invalid option '" + key + "'");
    }

    if (key === 'alias') {
      validateName(option);
    }

    const valid = validOptions[key];

    if (
      (valid.type === 'string' && typeof option !== 'string') ||
      (valid.type === 'number' && typeof option !== 'number') ||
      (valid.type === 'object' &&
        (typeof option !== 'object' || option === null)) ||
      (valid.type === 'array' && !Array.isArray(option)) ||
      (valid.type === 'boolean' && typeof option !== 'boolean') ||
      (valid.type === 'function' && typeof option !== 'function')
    ) {
      throw new Error('Option ' + key + ' must be of type ' + valid.type);
    }

    if (
      'length' in valid &&
      valid.length &&
      typeof option === 'string' &&
      option.length !== valid.length
    ) {
      throw new Error('Option ' + key + ' must be of length ' + valid.length);
    }
  });

  const optionsCopy = { ...options };

  Object.entries(validOptions).forEach(([validKey, validOption]) => {
    if ('default' in validOption && !(validKey in options)) {
      (optionsCopy as Record<string, unknown>)[validKey] = validOption.default;
    }
  });

  return optionsCopy;
}

/*
    Usage: program <command> [options]

    Commands:
      command  Do a thing

    Options:
      --help, -h     Show help                                             [boolean]
      --version, -v  Return the version number                             [boolean]

    Examples:
      program command --flag                                   (A brief description)

    Unknown argument: unknown
  */

function getMaxTableWidths(table: readonly (readonly string[])[]) {
  const maxWidths: number[] = [];

  table.forEach((row) => {
    row.forEach((cell, index) => {
      const maxWidth = maxWidths[index];
      if (typeof maxWidth === 'undefined' || cell.length > maxWidth) {
        maxWidths[index] = cell.length;
      }
    });
  });

  return maxWidths;
}

function getRemainingSpace(
  maxWidths: readonly number[],
  options: TableFormatOptions
) {
  let remainingSpace = TABLE_OPTIONS.width - TABLE_OPTIONS.indentation.length;

  maxWidths.forEach((value, index) => {
    if (options.wrap.indexOf(index) < 0) {
      remainingSpace -= value;
    }

    if (index < maxWidths.length - 1) {
      remainingSpace -= TABLE_OPTIONS.margin.length;
    }
  });

  return remainingSpace;
}

function createSpaces(length: number) {
  let spaces = '';

  for (let i = 0; i < length; i += 1) {
    spaces += ' ';
  }

  return spaces;
}

function pad(str: string, length: number, right: boolean) {
  if (!right) {
    return (str + createSpaces(length)).substring(0, length);
  }

  return (createSpaces(length) + str).substring(
    str.length,
    str.length + length
  );
}

function wrapText(
  text: string,
  availableSpace: number,
  currentConcat: string,
  nextConcats: string[],
  alignRight: boolean
) {
  const wrappedWords = text.split(MATCHES_SPACE);
  let wrappedLineIndex = 0;

  function indentLine(lineIndex: number) {
    if (typeof nextConcats[lineIndex] === 'undefined') {
      nextConcats[lineIndex] = createSpaces(currentConcat.length);
    } else {
      nextConcats[lineIndex] += TABLE_OPTIONS.margin;
    }
  }

  indentLine(wrappedLineIndex);

  wrappedWords.forEach((word, wordIndex) => {
    if (word.length > availableSpace) {
      let hyphenatedWord = word;

      while (hyphenatedWord.length) {
        const withHyphen =
          availableSpace > 1 &&
          hyphenatedWord.charAt(availableSpace) !== '-' &&
          hyphenatedWord.length > availableSpace;

        nextConcats[wrappedLineIndex] +=
          hyphenatedWord.substring(0, availableSpace - (withHyphen ? 1 : 0)) +
          (withHyphen ? '-' : '');
        hyphenatedWord = hyphenatedWord.substring(
          availableSpace - (withHyphen ? 1 : 0)
        );

        if (hyphenatedWord.length) {
          wrappedLineIndex += 1;
          indentLine(wrappedLineIndex);
        }
      }
    } else if (
      nextConcats[wrappedLineIndex].length -
        currentConcat.length +
        word.length >
      availableSpace
    ) {
      wrappedLineIndex += 1;
      indentLine(wrappedLineIndex);
      nextConcats[wrappedLineIndex] += word;
    } else {
      nextConcats[wrappedLineIndex] += word;
    }

    if (
      nextConcats[wrappedLineIndex].length <
        currentConcat.length + availableSpace &&
      wordIndex < wrappedWords.length - 1
    ) {
      nextConcats[wrappedLineIndex] += ' ';
    }
  });

  nextConcats.forEach((nextConcat, index) => {
    nextConcats[index] =
      nextConcat.substring(0, currentConcat.length) +
      pad(
        nextConcat
          .substring(currentConcat.length)
          .replace(MATCHES_LEADING_AND_TRAILING_SPACES, ''),
        availableSpace,
        alignRight
      );
  });
}

function mapCells(
  table: readonly (readonly string[])[],
  options: TableFormatOptions,
  maxWidths: readonly number[],
  remainingSpace: number,
  row: readonly string[],
  rowIndex: number
) {
  let currentConcat = TABLE_OPTIONS.indentation;
  const nextConcats: string[] = [];

  row.forEach((cell, index) => {
    if (options.wrap.indexOf(index) < 0) {
      currentConcat += pad(
        cell,
        maxWidths[index],
        options.alignRight.indexOf(index) >= 0
      );
    } else {
      const totalWrappedMaxWidth = sum(
        maxWidths.filter(function (_width, maxWidthIndex) {
          return options.wrap.indexOf(maxWidthIndex) >= 0;
        })
      );
      const availableSpace = Math.max(
        1,
        Math.round((maxWidths[index] / totalWrappedMaxWidth) * remainingSpace)
      );
      const alignRight = options.alignRight.indexOf(index) >= 0;

      wrapText(cell, availableSpace, currentConcat, nextConcats, alignRight);

      currentConcat += pad(
        nextConcats[0].substring(
          currentConcat.length,
          currentConcat.length + availableSpace
        ),
        availableSpace,
        alignRight
      );
    }

    if (index < row.length - 1) {
      currentConcat += TABLE_OPTIONS.margin;
    }
  });

  nextConcats.forEach((nextConcat, nextConcatIndex) => {
    if (nextConcatIndex > 0) {
      currentConcat += '\n' + nextConcat;
    }
  });

  if (rowIndex < table.length - 1) {
    currentConcat += '\n';
  }

  return currentConcat;
}

function mapRows(
  table: readonly (readonly string[])[],
  options: TableFormatOptions,
  maxWidths: readonly number[],
  remainingSpace: number
) {
  let concat = '';

  table.forEach((row, rowIndex) => {
    concat += mapCells(
      table,
      options,
      maxWidths,
      remainingSpace,
      row,
      rowIndex
    );
  });

  return concat;
}

function createTable(
  table: readonly (readonly string[])[],
  options: TableFormatOptions,
  maxWidths: readonly number[],
  remainingSpace: number
) {
  return mapRows(table, options, maxWidths, remainingSpace)
    .split('\n')
    .map(function (line) {
      return line.replace(MATCHES_TRAILING_SPACES, '');
    })
    .join('\n');
}

function formatTable(
  table: readonly (readonly string[])[],
  options: TableFormatOptions
) {
  const maxWidths = getMaxTableWidths(table);
  const remainingSpace = getRemainingSpace(maxWidths, options);
  return createTable(table, options, maxWidths, remainingSpace);
}

function createCommandsText(
  commands: readonly CommandNode<string, ProgramOrCommandChildren>[]
) {
  return (
    (commands.length ? '  Commands:\n' : '') +
    formatTable(
      commands.map((command): [string, string] => {
        const alias = command.options.alias ? ', ' + command.options.alias : '';
        return [
          command.name + alias,
          withDefault(command.options.description, ''),
        ];
      }),
      { wrap: [1], alignRight: [2] }
    ) +
    (commands.length ? '\n\n' : '')
  );
}

function createOptionsText(
  options: readonly (FlagNode<string> | KWArgNode<string> | ArgNode<string>)[]
) {
  return (
    (options.length ? '  Options:\n' : '') +
    formatTable(
      options.map((option) => {
        const namePrefix = option._type === NodeType.ARG ? '<' : '--';
        const nameSuffix = option._type === NodeType.ARG ? '>' : '';
        const aliasPrefix = namePrefix.substring(0, 1);
        const alias =
          'alias' in option.options && option.options.alias
            ? ', ' + aliasPrefix + option.options.alias
            : '';
        const type =
          'type' in option.options && option.options.type
            ? '   [' + option.options.type + ']'
            : '';
        return [
          namePrefix + option.name + nameSuffix + alias,
          withDefault(option.options.description, ''),
          type,
        ];
      }),
      { wrap: [1], alignRight: [2] }
    ) +
    (options.length ? '\n\n' : '')
  );
}

function createExamplesText(examples: readonly string[] | undefined) {
  if (!examples?.length) {
    return '';
  }

  return (
    '  Examples:\n' +
    examples
      .map(function (example) {
        return '    ' + example;
      })
      .join('\n') +
    '\n\n'
  );
}

function sortByName(a: { name: string }, b: { name: string }) {
  if (a.name < b.name) {
    return -1;
  }

  if (b.name < a.name) {
    return 1;
  }

  return 0;
}

function createHelp(
  schema:
    | ProgramNode<ProgramOrCommandChildren>
    | CommandNode<string, ProgramOrCommandChildren>,
  globals: GlobalsInjected,
  error?: string
) {
  const commands: CommandNode<string, ProgramOrCommandChildren>[] = [];
  const flags: FlagNode<string>[] = [];
  const kwargs: KWArgNode<string>[] = [];
  const args: ArgNode<string>[] = [];
  const flagAndKwargNames: string[] = [];

  schema.children.forEach((node) => {
    if (node._type === NodeType.COMMAND) {
      commands.push(node);
    } else if (node._type === NodeType.FLAG) {
      flags.push(node);
      flagAndKwargNames.push(node.name);
    } else if (node._type === NodeType.KW_ARG) {
      kwargs.push(node);
      flagAndKwargNames.push(node.name);
    } else {
      args.push(node);
    }
  });

  if (globals.help && flagAndKwargNames.indexOf(globals.help.name) < 0) {
    flags.unshift(globals.help);
  }

  commands.sort(sortByName);
  flags.sort(sortByName);
  kwargs.sort(sortByName);
  args.sort(sortByName);

  const options = [...flags, ...kwargs, ...args];

  return (
    '\n' +
    (schema.options.usage ? '  Usage: ' + schema.options.usage + '\n\n' : '') +
    createCommandsText(commands) +
    createOptionsText(options) +
    createExamplesText(schema.options.examples) +
    (error ? '  ' + error + '\n\n' : '')
  );
}

/* istanbul ignore next */
function exitWithHelp(help: string) {
  process.stderr.write(help);
  process.exit(1);
}

function formatNodeName(node: { name: string; _type: string }) {
  const prefix =
    node._type === NodeType.FLAG || node._type === NodeType.KW_ARG ? '--' : '';
  return prefix + node.name;
}

function formatRequiredList(nodes: readonly { name: string; _type: string }[]) {
  return nodes.map(formatNodeName).join(', ');
}

function extractErrorMessage(error: unknown) {
  if (typeof error === 'string' || typeof error === 'number') {
    return error.toString();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

function pluralize<T extends string>(text: T) {
  return `${text}s` as `${T}s`;
}

export {
  several,
  sum,
  validateChildren,
  validateEmptyChildren,
  getNodeChildren,
  validateName,
  serializeOptions,
  formatTable,
  sortByName,
  createHelp,
  exitWithHelp,
  formatNodeName,
  formatRequiredList,
  extractErrorMessage,
  pluralize,
  withDefault,
};
