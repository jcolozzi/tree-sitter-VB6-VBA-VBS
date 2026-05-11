function keyword(value) {
  const escaped = value
    .split('')
    .map(char => {
      if (/[A-Za-z]/.test(char)) {
        return `[${char.toLowerCase()}${char.toUpperCase()}]`;
      }

      return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');

  return new RegExp(escaped);
}

module.exports = grammar({
  name: 'vbscript',

  extras: $ => [
    $._horizontal_whitespace,
    seq('_', /[\n\r]*/),
    $.comment
  ],

  precedences: $ => [
    [
      "new",
      "call",
      "member",
      "multiplicative",
      "additive",
      "boolean",
      $.unary_expression,
      $.binary_expression,
      $._expression
    ],
    [
      "assign",
      "branch",
      "invocation",
      $._expression
    ],
    [
      $.array_element,
      $.argument,
      $.identifier
    ],
    [
      $.array_identifier,
      $.new_identifier
    ],
    [
        $._variable_declaration_assignment,
        $.variable_list
    ]
  ],

  conflicts: $ => [
    [$.member_expression, $.with_member_expression]
  ],

  rules: {
    source_file: $ => seq(
      repeat(seq($._statement, $._whitespace)),
      optional($._statement)
    ),

    _statement: $ => choice(
      $.option_directive,
      $.attribute_statement,
      $.const_declaration,
      $.enum_declaration,
      $.type_declaration,
      $.class_declaration,
      $.subroutine,
      $.function,
      $.property_get_procedure,
      $.property_let_procedure,
      $.property_set_procedure,
      $.ptrsafe_function_declaration,
      $._inline_statement
    ),

    _inline_statement: $ => choice(
      $.variable_assignment,
      $.if_statement,
      $.select_case_statement,
      $.for_each_statement,
      $.for_statement,
      $.with_statement,
      $.while_statement,
      $.do_statement,
      $.exit_statement,
      $.on_error_statement,
      $.resume_statement,
      $.error_statement,
      $.label_statement,
      $.variable_declaration,
      $.redim,
      $.invocation_statement,
    ),

    variable_assignment: $ => prec.left('assign',seq(
      choice(
        $.array_element,
        $.identifier,
        $.with_member_expression
      ),
      $._equal,
      $._expression
    )),

    _inline_statement_block: $ => choice(
      repeat1(
        seq($._inline_statement, $._whitespace)
      ),
      $._whitespace
    ),

    invocation_statement: $ => prec.left('invocation',seq(
      $._expression,
      optional($.argument_list)
    )),

    comment: $ => token(seq("'", /.*/)),

    exit_statement: $ => seq(
      keyword('Exit'),
      choice(
        keyword('For'),
        keyword('Function'),
        keyword('Sub'),
        keyword('Do'),
        keyword('While')
      )
    ),

    on_error_statement: $ => seq(
      keyword('On'),
      keyword('Error'),
      choice(
        seq(keyword('Resume'), keyword('Next')),
        seq(keyword('GoTo'), $.label_reference)
      )
    ),

    resume_statement: $ => seq(
      keyword('Resume'),
      optional(choice(
        keyword('Next'),
        $.label_reference
      ))
    ),

    error_statement: $ => seq(
      keyword('Error'),
      $.number
    ),

    label_statement: $ => seq(
      $.label_reference,
      ':'
    ),

    label_reference: $ => choice(
      $.identifier,
      $.number
    ),

    if_statement: $ => prec('branch',seq(
      keyword('If'),
      $._expression,
      keyword('Then'),
      $._whitespace,
      $._inline_statement_block,
      repeat($.elseif_clause),
      optional($.else_clause),
      keyword('End If')
    )),

    elseif_clause: $ => seq(
      keyword('ElseIf'),
      $._expression,
      keyword('Then'),
      $._whitespace,
      $._inline_statement_block
    ),

    else_clause: $ => seq(
      keyword('Else'),
      $._whitespace,
      $._inline_statement_block
    ),

    select_case_statement: $ => seq(
      keyword('Select'),
      keyword('Case'),
      $._expression,
      $._whitespace,
      repeat($.case_clause),
      optional($.case_else_clause),
      keyword('End Select')
    ),

    case_clause: $ => seq(
      keyword('Case'),
      $.case_value_list,
      $._whitespace,
      $._inline_statement_block
    ),

    case_else_clause: $ => prec(1, seq(
      keyword('Case'),
      keyword('Else'),
      $._whitespace,
      $._inline_statement_block
    )),

    case_value_list: $ => seq(
      $.case_value,
      repeat(seq(
        ',',
        $.case_value
      ))
    ),

    case_value: $ => choice(
      $.case_range,
      $.case_relational,
      $._expression
    ),

    case_range: $ => seq(
      $._expression,
      keyword('To'),
      $._expression
    ),

    case_relational: $ => seq(
      optional(keyword('Is')),
      choice('=', '<>', '<', '>', '<=', '>='),
      $._expression
    ),

    for_each_statement: $ => prec('branch',seq(
      keyword('For'),
      keyword('Each'),
      $.identifier,
      keyword('In'),
      $._expression,
      $._whitespace,
      $._inline_statement_block,
      keyword('Next'),
      optional($.identifier)
    )),

    for_statement: $ => prec('branch',seq(
      keyword('For'),
      $.identifier,
      $._equal,
      $._expression,
      keyword('To'),
      $._expression,
      optional(seq(
        keyword('Step'),
        $._expression
      )),
      $._whitespace,
      $._inline_statement_block,
      keyword('Next'),
      $.identifier
    )),

    with_statement: $ => prec('branch', seq(
      keyword('With'),
      $._expression,
      $._whitespace,
      $._inline_statement_block,
      keyword('End With')
    )),

    while_statement: $ => prec('branch',seq(
      keyword('While'),
      $._expression,
      $._whitespace,
      $._inline_statement_block,
      keyword('Wend')
    )),

    do_statement: $ => prec('branch',seq(
      keyword('Do'),
      $._whitespace,
      $._inline_statement_block,
      keyword('Loop'),
      choice(
        keyword('While'),
        keyword('Until')
      ),
      $._expression
    )),

    option_directive: $ => seq(
      keyword('Option'),
      choice(
        keyword('Explicit'),
        seq(
          keyword('Compare'),
          choice(
            keyword('Binary'),
            keyword('Text'),
            keyword('Database')
          )
        ),
        seq(keyword('Base'), $.number),
        seq(keyword('Private'), keyword('Module'))
      )
    ),

    attribute_statement: $ => seq(
      keyword('Attribute'),
      $.identifier,
      $._equal,
      $.attribute_value
    ),

    attribute_value: $ => choice(
      $.string_literal,
      $.number,
      $.boolean,
      $.identifier
    ),

    const_declaration: $ => seq(
      keyword('Const'),
      $.const_item,
      repeat(seq(
        ',',
        $.const_item
      ))
    ),

    const_item: $ => seq(
      $.new_identifier,
      optional($.type_definition),
      $._equal,
      $._expression
    ),

    enum_declaration: $ => seq(
      optional($.visibility_modifier),
      keyword('Enum'),
      $.new_identifier,
      $._whitespace,
      repeat1(seq($.enum_member, $._whitespace)),
      keyword('End Enum')
    ),

    enum_member: $ => seq(
      $.new_identifier,
      optional(seq(
        $._equal,
        $._expression
      ))
    ),

    type_declaration: $ => seq(
      optional($.visibility_modifier),
      keyword('Type'),
      $.new_identifier,
      $._whitespace,
      repeat1(seq($.type_member_declaration, $._whitespace)),
      keyword('End Type')
    ),

    type_member_declaration: $ => seq(
      choice(
        $.array_identifier,
        $.new_identifier
      ),
      optional($.type_definition)
    ),

    class_declaration: $ => seq(
      keyword('Class'),
      $.new_identifier,
      $._whitespace,
      repeat(seq($.class_member, $._whitespace)),
      keyword('End Class')
    ),

    class_member: $ => choice(
      $.class_field_declaration,
      $.subroutine,
      $.function,
      $.property_get_procedure,
      $.property_let_procedure,
      $.property_set_procedure
    ),

    class_field_declaration: $ => choice(
      seq(
        keyword('Dim'),
        choice(
          $._variable_declaration_assignment,
          $.variable_list
        )
      ),
      seq(
        $.visibility_modifier,
        choice(
          $._variable_declaration_assignment,
          $.variable_list
        )
      )
    ),

    subroutine: $ => seq(
      optional($.visibility_modifier),
      keyword('Sub'),
      $.new_identifier,
      '(',
      optional($.parameter_list),
      ')',
      $._whitespace,
      $._inline_statement_block,
      keyword('End Sub')
    ),

    function: $ => seq(
      optional($.visibility_modifier),
      keyword('Function'),
      $.new_identifier,
      '(',
      optional($.parameter_list),
      ')',
      optional($.type_definition),
      $._whitespace,
      $._inline_statement_block,
      keyword('End Function')
    ),

    property_get_procedure: $ => seq(
      optional($.visibility_modifier),
      keyword('Property'),
      keyword('Get'),
      $.new_identifier,
      '(',
      optional($.parameter_list),
      ')',
      $.type_definition,
      $._whitespace,
      $._inline_statement_block,
      keyword('End Property')
    ),

    property_let_procedure: $ => seq(
      optional($.visibility_modifier),
      keyword('Property'),
      keyword('Let'),
      $.new_identifier,
      '(',
      optional($.parameter_list),
      ')',
      $._whitespace,
      $._inline_statement_block,
      keyword('End Property')
    ),

    property_set_procedure: $ => seq(
      optional($.visibility_modifier),
      keyword('Property'),
      keyword('Set'),
      $.new_identifier,
      '(',
      optional($.parameter_list),
      ')',
      $._whitespace,
      $._inline_statement_block,
      keyword('End Property')
    ),

    variable_declaration: $ => seq(
      keyword('Dim'),
      choice(
        $._variable_declaration_assignment,
        $.variable_list
      )
    ),

    redim: $ => seq(
      keyword('ReDim'),
      optional(keyword('Preserve')),
      $._expression
    ),

    _variable_declaration_assignment: $ => seq(
      $.variable_declaration_identifier,
      optional($.type_definition),
      $._equal,
      $._expression
    ),

    variable_declaration_identifier: $ => choice(
      $.array_identifier,
      $.new_identifier
    ),

    array_identifier: $ => seq(
      $.new_identifier,
      '(',
      optional(seq(
        $.number,
        keyword('To'),
        $.number
      )),
      ')'
    ),

    type_definition: $=> seq(
      keyword('As'),
      $.type
    ),

    variable_list: $ => seq(
      $.variable_declaration_identifier,
      repeat(seq(
        ',',
        $.variable_declaration_identifier
      )),
      optional($.type_definition)
    ),

    ptrsafe_function_declaration: $ => seq(
      keyword('Private'),
      keyword('Declare'),
      keyword('PtrSafe'),
      keyword('Function'),
      $.new_identifier,
      keyword('Lib'),
      $.string_literal,
      optional(seq(keyword('Alias'), $.string_literal)),
      '(',
      optional($.parameter_list),
      ')',
      $.type_definition
    ),

    parameter_list: $ => seq(
      $.parameter,
      repeat(seq(
        ',',
        $.parameter
      ))
    ),

    parameter: $ => seq(
      optional($.modifier),
      $.new_identifier,
      optional($.type_definition)
    ),

    modifier: $ => choice(
      keyword('ByVal'),
      keyword('ByRef'),
      keyword('Optional'),
      keyword('ParamArray')
    ),

    visibility_modifier: $ => choice(
      keyword('Private'),
      keyword('Public'),
      keyword('Friend')
    ),

    type: $ => choice(
      $.type_terminal,
      $.array_type
    ),

    type_terminal: $ => choice(
      keyword('Any'),
      keyword('Boolean'),
      keyword('Byte'),
      keyword('Collection'),
      keyword('Currency'),
      keyword('Date'),
      keyword('Decimal'),
      keyword('Dictionary'),
      keyword('Double'),
      keyword('Integer'),
      keyword('Long'),
      keyword('LongLong'),
      keyword('LongPtr'),
      keyword('Object'),
      keyword('Single'),
      keyword('String'),
      keyword('Variant'),
      $.type_member_expression,
    ),

    array_type: $ => seq(
      $.type,
      '()'
    ),

    _expression: $ => choice(
      $.member_expression,
      $.with_member_expression,
      $.function_call,
      seq('(',$._expression, ')'),
      $.new_expression,
      $.literal,
      $.binary_expression,
      $.unary_expression,
      $.identifier
    ),

    new_expression: $ => prec('new', seq(
      keyword('New'),
      choice(
        $.identifier,
        $.type_member_expression
      )
    )),

    type_member_expression: $ => prec('member',seq(
      choice(
        $.identifier,
        $.member_expression
      ),
      '.',
      choice($.identifier)
    )),

    member_expression: $ => prec('member',seq(
      $._expression,
      '.',
      choice(
        $.function_call,
        $.identifier
      )
    )),

    with_member_expression: $ => prec('member', seq(
      '.',
      choice(
        $.function_call,
        $.identifier
      )
    )),

    binary_expression: $ => prec.left(choice(
      prec.right(12,seq($._expression, '^', $._expression)),
      prec.left(11,seq($._expression, '*', $._expression)),
      prec.left(11,seq($._expression, '/', $._expression)),
      prec.left(11,seq($._expression, '\\', $._expression)),
      prec.left(11,seq($._expression, keyword('Mod'), $._expression)),
      prec.left(10,seq($._expression, '+', $._expression)),
      prec.left(10,seq($._expression, '-', $._expression)),
      prec.left(9,seq($._expression, '&', $._expression)),
      prec.left(8,seq($._expression, $._equal, $._expression)),
      prec.left(8,seq($._expression, '<>', $._expression)),
      prec.left(8,seq($._expression, '<', $._expression)),
      prec.left(8,seq($._expression, '>', $._expression)),
      prec.left(8,seq($._expression, '<=', $._expression)),
      prec.left(8,seq($._expression, '>=', $._expression)),
      prec.left(8,seq($._expression, keyword('Like'), $._expression)),
      prec.left(8,seq($._expression, keyword('Is'), $._expression)),
      prec.left(7,seq($._expression, keyword('And'), $._expression)),
      prec.left(6,seq($._expression, keyword('Or'), $._expression)),
      prec.left(5,seq($._expression, keyword('Xor'), $._expression)),
      prec.left(4,seq($._expression, keyword('Eqv'), $._expression)),
      prec.left(3,seq($._expression, keyword('Imp'), $._expression))
    )),

    unary_expression: $ => prec.right(choice(
      seq('-', $._expression),
      seq(keyword('Not'), $._expression)
    )),

    function_call: $ => prec('call',seq(
      optional(keyword('Call')),
      $.identifier,
      '(',
      optional($.argument_list),
      ')'
    )),

    argument_list: $ => seq(
      $.argument,
      repeat(seq(
        ',',
        $.argument
      ))
    ),

    argument: $ => choice(
        $._expression,
        $.keyword_argument
    ),

    keyword_argument: $ => seq(
      $.identifier,
      ':=',
      $._expression
    ),

    array_element: $ => seq(
      $.identifier,
      '(',
      $._expression,
      ')'
    ),

    literal: $ => choice(
      $.number,
      $.string_literal,
      $.boolean
    ),

    number: $ => /(\d+\.\d*|\d+)([eE][+-]?\d+)?/,

    string_literal: $ => token(/"([^"\r\n]|"")*"/),

    boolean: $ => choice(keyword('True'), keyword('False')),

    new_identifier: $ => $.identifier,

    identifier: $ => /[a-zA-Z_]\w*/,

    _equal: $ => '=',

    _whitespace: $ => repeat1(/[\n\r]/),

    _horizontal_whitespace: $=> /[ \t]+/
  }
});

