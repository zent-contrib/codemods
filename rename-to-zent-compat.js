const os = require("os");

module.exports = function(fileInfo, api, options) {
  const { j } = api;
  const ast = j(fileInfo.source);
  const zentImports = findImportsByPackageName(ast, j, "zent");
  const zentCompatImports = findImportsByPackageName(ast, j, "@zent/compat");
  const { component, quote } = options;

  if (zentImports.size() === 0) {
    return fileInfo.source;
  }

  // Save the comments attached to the first node
  const firstNode = getFirstNode(ast, j);
  const { comments } = firstNode;

  const insertNew = zentCompatImports.size() === 0;
  const zentCompat = insertNew
    ? createZentCompatImport(j)
    : zentCompatImports.paths()[0].node;

  // remove import specifiers
  ast
    .find(j.ImportSpecifier, node => {
      const { imported } = node;
      return j.Identifier.check(imported) && imported.name === component;
    })
    .forEach(specifier => {
      const { imported, local } = specifier.node;
      zentCompat.specifiers.push(
        createImportSpecifier(j, imported.name, local.name)
      );
    })
    .remove();

  let shouldTrimBlankLines = false;
  if (insertNew && zentCompat.specifiers.length > 0) {
    const last = zentImports.at(-1);

    shouldTrimBlankLines = last.some(path => {
      const willRemove = path.node.specifiers.length === 0;
      if (willRemove) {
        return false;
      }

      const endLoc = path.node.loc.end;
      const start = nthIndexOf(fileInfo.source, os.EOL, endLoc.line) + 1;
      const end = nthIndexOf(fileInfo.source, os.EOL, endLoc.line + 1);
      const hasTrailingBlankLines = /^\s*$/.test(
        fileInfo.source.substring(start, end)
      );
      return hasTrailingBlankLines;
    });

    last.insertAfter(zentCompat);
  }

  // remove `import 'zent'`
  ast
    .find(j.ImportDeclaration, node => {
      const isWantedImport = isPackageImport(node, j, "zent");
      return isWantedImport && node.specifiers.length === 0;
    })
    .remove();

  // If the first node has been modified or deleted, reattach the comments
  const firstNode2 = getFirstNode(ast, j);
  if (firstNode2 !== firstNode) {
    firstNode2.comments = comments;
  }

  const out = ast.toSource({ quote });

  // Remove extra blank lines before the new import statement
  // https://github.com/facebook/jscodeshift/issues/249
  return shouldTrimBlankLines ? trimBlankLines(out, api) : out;
};

function trimBlankLines(source, api) {
  const { j } = api;
  const ast = j(source);

  findImportsByPackageName(ast, j, "zent")
    .at(-1)
    .forEach(path => {
      const endLoc = path.node.loc.end;
      const start = nthIndexOf(source, os.EOL, endLoc.line) + 1;
      if (start === 0) {
        return;
      }

      while (true) {
        const end = nthIndexOf(source, os.EOL, endLoc.line + 1);
        if (end === -1) {
          break;
        }
        const isBlankLine = /^\s*$/.test(source.substring(start, end));
        if (!isBlankLine) {
          break;
        }
        // remove this blank line, including the newline
        source = removeSubString(source, start, end);
      }
    });

  return source;
}

function nthIndexOf(str, pat, n) {
  let startPos = 0;
  for (let i = n; i > 0; i--) {
    const idx = str.indexOf(pat, startPos);
    if (idx === -1) {
      return -1;
    }

    startPos = idx + 1;
  }

  return startPos - 1;
}

function removeSubString(str, start, end /* end is removed */) {
  return str.substring(0, start) + str.substring(end + 1);
}

function getFirstNode(ast, j) {
  return ast.find(j.Program).get("body", 0).node;
}

function isPackageImport(node, j, package) {
  return j.StringLiteral.check(node.source) && node.source.value === package;
}

function findImportsByPackageName(ast, j, package) {
  return ast.find(j.ImportDeclaration, node =>
    isPackageImport(node, j, package)
  );
}

function createZentCompatImport(j) {
  return j.importDeclaration([], j.literal("@zent/compat"));
}

function createImportSpecifier(j, imported, local) {
  return j.importSpecifier(j.identifier(imported), j.identifier(local));
}
