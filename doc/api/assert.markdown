# Assert

    Stability: 5 - Locked

<!--
This module is used for writing unit tests for your applications, you can
access it with `require('assert')`.
-->

このモジュールはアプリケーションの単体テストを記述するために使用され、
`require('assert')` でアクセスできます。

## assert.fail(actual, expected, message, operator)

<!--
Throws an exception that displays the values for `actual` and `expected` separated by the provided operator.
-->

`actual` と `expected` を `operator` で区切ったメッセージを持つ例外を
スローします。

## assert(value[, message]), assert.ok(value[, message])

<!--
Tests if value is truthy, it is equivalent to `assert.equal(true, !!value, message);`
-->

`value` が truthy かテストします、
これは `assert.equal(true, !!value, message);` と等価です。

## assert.equal(actual, expected[, message])

<!--
Tests shallow, coercive equality with the equal comparison operator ( `==` ).
-->

`==` 演算子を強制して浅い同値性をテストします。

## assert.notEqual(actual, expected[, message])

<!--
Tests shallow, coercive non-equality with the not equal comparison operator ( `!=` ).
-->

`!=` 演算子を強制して浅い非同値性をテストします。

## assert.deepEqual(actual, expected[, message])

<!--
Tests for deep equality.
-->

深い同値性をテストします。

## assert.notDeepEqual(actual, expected[, message])

<!--
Tests for any deep inequality.
-->

深い非同値性をテストします。

## assert.strictEqual(actual, expected[, message])

<!--
Tests strict equality, as determined by the strict equality operator ( `===` )
-->

`===` 演算子で厳密な同値性をテストします。

## assert.notStrictEqual(actual, expected[, message])

<!--
Tests strict non-equality, as determined by the strict not equal operator ( `!==` )
-->

`!==` 演算子で厳密な非同値性をテストします。

## assert.deepStrictEqual(actual, expected[, message])

<!--
Tests for deep equality. Primitive values are compared with the strict equality
operator ( `===` ).
-->

深い同値性をテストします。プリミティブな値は厳密等価演算子 (`===`) で評価されます。

## assert.notDeepStrictEqual(actual, expected[, message])

<!--
Tests for deep inequality. Opposite of `assert.deepStrictEqual`.
-->

深い非同値性をテストします。`assert.deepStrictEqual`の反対です。

## assert.throws(block[, error][, message])

<!--
Expects `block` to throw an error. `error` can be constructor, `RegExp` or 
validation function.
-->

`block` がエラーをスローすることを期待します。
`error` はコンストラクタ、正規表現、または検証関数にすることができます。

<!--
Validate instanceof using constructor:
-->

コンストラクタを使って instanceof で検証:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      Error
    );

<!--
Validate error message using RegExp:
-->

正規表現を使ってエラーメッセージを検証:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      /value/
    );

<!--
Custom error validation:
-->

独自のエラー検証:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      function(err) {
        if ( (err instanceof Error) && /value/.test(err) ) {
          return true;
        }
      },
      "unexpected error"
    );

## assert.doesNotThrow(block, [message])

<!--
Expects `block` not to throw an error, see assert.throws for details.
-->

`block` がエラーをスローしないことを期待します。
詳細は assert.throws を参照してください。

## assert.ifError(value)

<!--
Tests if value is not a false value, throws if it is a true value. Useful when
testing the first argument, `error` in callbacks.
-->

`value` が false でないことをテストし、true だったらそれをスローします。
コールバックの第 1 引数である `error` をテストするのに便利です。

