# tree-sitter-vbscript

A full-featured [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for **VBScript** and **VBA** (Visual Basic for Applications). Produces concrete syntax trees suitable for syntax highlighting, code navigation, linting, refactoring tools, and static analysis.

## Features

### Language Constructs

- **Procedures** — `Sub`, `Function`, `Property Get/Let/Set` with visibility modifiers (`Private`, `Public`, `Friend`), parameter lists, and return types
- **Control Flow** — `If / ElseIf / Else / End If`, `Select Case` (value lists, ranges, relational tests, `Case Else`), `For / Next`, `For Each / In / Next`, `While / Wend`, `Do / Loop While|Until`, `With / End With`
- **Error Handling** — `On Error Resume Next`, `On Error GoTo <label>`, `Resume`, `Resume Next`, `Resume <label>`, `Error <number>`
- **Declarations** — `Dim`, `ReDim Preserve`, `Const`, `Enum / End Enum`, `Type / End Type`, `Option Explicit`, `Option Compare`, `Option Base`, `Option Private Module`, `Attribute`
- **Classes** — `Class / End Class` with field declarations, methods, and property procedures
- **Expressions** — member access (`.`), function calls, `New`, array element access, keyword arguments (`:=`), string/numeric/boolean literals
- **Operators** — arithmetic (`+`, `-`, `*`, `/`, `\`, `Mod`, `^`), comparison (`=`, `<>`, `<`, `>`, `<=`, `>=`), logical (`And`, `Or`, `Not`, `Xor`, `Eqv`, `Imp`), pattern (`Like`), identity (`Is`), concatenation (`&`)
- **API Declarations** — `Private Declare PtrSafe Function ... Lib ... Alias ...`
- **Case-Insensitive Keywords** — all keywords match regardless of casing (`if`, `If`, `IF`, etc.)
- **Line Continuation** — underscore (`_`) continuation across lines
- **Labels** — `Label:` and `GoTo` targets for error-handling flows

### Bindings

Ready-to-use bindings for multiple platforms:

| Language | Path | Package |
|----------|------|---------|
| C / C++ | `bindings/c/` | header + pkg-config |
| Node.js | `bindings/node/` | `node-gyp-build` |
| Python | `bindings/python/` | `tree-sitter-vbscript` |
| Rust | `bindings/rust/` | `tree-sitter-vbscript` crate |
| Go | `bindings/go/` | Go module |
| Swift | `bindings/swift/` | Swift package |

## Getting Started

### Node.js

```bash
npm install tree-sitter tree-sitter-vbscript
```

```javascript
const Parser = require("tree-sitter");
const VBScript = require("tree-sitter-vbscript");

const parser = new Parser();
parser.setLanguage(VBScript);

const tree = parser.parse(`
Sub Hello()
  MsgBox "Hello, World!"
End Sub
`);

console.log(tree.rootNode.toString());
```

### Python

```bash
pip install tree-sitter tree-sitter-vbscript
```

```python
import tree_sitter_vbscript as tsvbs
from tree_sitter import Language, Parser

VBS_LANGUAGE = Language(tsvbs.language())
parser = Parser(VBS_LANGUAGE)

tree = parser.parse(b"""
Function Add(a, b)
  Add = a + b
End Function
""")

print(tree.root_node.sexp())
```

### Rust

```toml
# Cargo.toml
[dependencies]
tree-sitter = ">=0.22.6"
tree-sitter-vbscript = "0.0.1"
```

### Building from Source

```bash
# Generate the parser from grammar.js
npx tree-sitter generate

# Run the test suite
npx tree-sitter test
```

## Test Suite

The corpus test suite covers all major language features with **31 passing tests** across 10 test files:

| # | File | Coverage |
|---|------|----------|
| 1 | `01_select_case.txt` | `Select Case`, value lists, ranges, `Case Else`, nesting |
| 2 | `02_else_if.txt` | `If / ElseIf / Else / End If` chains and nesting |
| 3 | `03_on_error.txt` | `On Error Resume Next`, `GoTo`, `Resume`, `Error` |
| 4 | `04_property_get_let_set.txt` | Property procedures with parameters and types |
| 5 | `05_case_insensitive_keywords.txt` | Mixed-case keyword parsing |
| 6 | `06_for_each_in.txt` | `For Each ... In ... Next` loops |
| 7 | `07_with_end_with.txt` | `With` blocks and dotted member shorthand |
| 8 | `08_class_end_class.txt` | `Class` with fields, methods, and properties |
| 9 | `09_module_declarations_directives.txt` | `Option`, `Const`, `Enum`, `Type`, `Attribute` |
| 10 | `10_operator_literal_expansion.txt` | Full operator set, string escaping, scientific notation |

Run the tests:

```bash
npx tree-sitter test
```

## Project Structure

```
tree-sitter-vbscript/
├── grammar.js              # Grammar definition (source of truth)
├── src/
│   ├── parser.c            # Generated parser
│   ├── grammar.json         # Generated grammar spec
│   └── node-types.json      # Generated node type info
├── bindings/                # Language bindings (C, Node, Python, Rust, Go, Swift)
├── test/corpus/             # Tree-sitter corpus test files
├── scripts/
│   └── generate-parser.ps1  # Parser generation + test runner (Windows)
├── package.json
├── Cargo.toml
└── pyproject.toml
```

## Contributing

1. Edit `grammar.js`
2. Run `npx tree-sitter generate` to regenerate the parser
3. Add or update corpus tests in `test/corpus/`
4. Run `npx tree-sitter test` to validate — all tests must pass
5. Submit a pull request with grammar changes, regenerated `src/` artifacts, and tests

## License

MIT
