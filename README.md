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
