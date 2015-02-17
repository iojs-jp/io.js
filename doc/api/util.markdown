# util

    Stability: 4 - API Frozen

<!--
These functions are in the module `'util'`. Use `require('util')` to
access them.
-->

これらの関数はモジュール `'util'` 内にあります。
`require('util')` を使うことでこれらにアクセスします。

<!--
The `util` module is primarily designed to support the needs of io.js's
internal APIs.  Many of these utilities are useful for your own
programs.  If you find that these functions are lacking for your
purposes, however, you are encouraged to write your own utilities.  We
are not interested in any future additions to the `util` module that
are unnecessary for io.js's internal functionality.
 -->

 `util` モジュールは、主に io.js 自身の内部 API によるニーズを満たすために
設計されています。
これらのユーティリティの多くはあなたのプログラムでも役に立つでしょう。
しかしながら、もしこれらの機能にあなたの目的とするものが欠けているとしたら、
その時はあなた自身のユーティリティを作成する時です。
私たちは io.js 内部の機能のために不必要などんな特性も
`util` モジュールに加えることに関心がありません。

## util.debuglog(section)

<!--
* `section` {String} The section of the program to be debugged
* Returns: {Function} The logging function
-->

* `section` {String} デバッグするプログラムのセクション
* Returns: {Function} ロギング関数

<!--
This is used to create a function which conditionally writes to stderr
based on the existence of a `NODE_DEBUG` environment variable.  If the
`section` name appears in that environment variable, then the returned
function will be similar to `console.error()`.  If not, then the
returned function is a no-op.
-->

これは、`NDOE_DEBUG` 環境変数の有無に基づいて標準エラー出力に
条件付きで出力する関数を作成して返します。
もし `section` 名が環境変数に出現するなら、返される関数は
`console.error()` と同じです。そうでなければ、何もしない関数が返されます。

For example:

```javascript
var debuglog = util.debuglog('foo');

var bar = 123;
debuglog('hello from foo [%d]', bar);
```

<!--
If this program is run with `NODE_DEBUG=foo` in the environment, then
it will output something like:
-->

もしプログラムが環境 `NODE_DEBUG=foo` で実行されると、
これは次のように出力します。

    FOO 3245: hello from foo [123]

<!--
where `3245` is the process id.  If it is not run with that
environment variable set, then it will not print anything.
-->

`3245` はプロセス ID です。
環境を設定することなく実行すると、これは出力されません。

<!--
You may separate multiple `NODE_DEBUG` environment variables with a
comma.  For example, `NODE_DEBUG=fs,net,tls`.
-->

`NODE_DEBUG` 環境変数はカンマ区切りで複数の値を設定することができます。
たとえば、`NODE_DEBUG=fs,net,tls` 。

## util.format(format[, ...])

<!--
Returns a formatted string using the first argument as a `printf`-like format.
-->

最初の引数を `printf` のようなフォーマットとして使用して、フォーマット化された
文字列を返します。

<!--
The first argument is a string that contains zero or more *placeholders*.
Each placeholder is replaced with the converted value from its corresponding
argument. Supported placeholders are:
-->

第一引数は文字列で、0 個以上の *プレースホルダ* を含みます。
それぞれのプレースホルダは対応する引数を変換した値で置換されます。
サポートするプレースホルダは:

<!--
* `%s` - String.
* `%d` - Number (both integer and float).
* `%j` - JSON.  Replaced with the string `'[Circular]'` if the argument
         contains circular references.
* `%%` - single percent sign (`'%'`). This does not consume an argument.
-->

* `%s` - 文字列。
* `%d` - 数値 (整数と浮動小数点数の両方)。
* `%j` - JSON。もし引数が循環した参照を含む場合、それは`'[Circular]'`
  に置換されます。
* `%%%%` - 一つのパーセント記号 (`'%'`)。これは引数を消費しません。

<!--
If the placeholder does not have a corresponding argument, the placeholder is
not replaced.
-->

プレースホルダに対応する引数が無い場合、そのプレースホルダは置換されません。

    util.format('%s:%s', 'foo'); // 'foo:%s'

<!--
If there are more arguments than placeholders, the extra arguments are
converted to strings with `util.inspect()` and these strings are concatenated,
delimited by a space.
-->

プレースホルダより多くの引数がある場合、余った引数は `util.inspect()` によって
文字列化され、それらはスペース区切りで連結されます。

    util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'

<!--
If the first argument is not a format string then `util.format()` returns
a string that is the concatenation of all its arguments separated by spaces.
Each argument is converted to a string with `util.inspect()`.
-->

    util.format(1, 2, 3); // '1 2 3'


## util.log(string)

<!--
Output with timestamp on `stdout`.
-->

タイムスタンプとともに `stdout` へ出力します。

    require('util').log('Timestamped message.');

## util.inspect(object[, options])

<!--
Return a string representation of `object`, which is useful for debugging.
-->

デバッグで有用な、`object` の文字列表現を返します。

<!--
An optional *options* object may be passed that alters certain aspects of the
formatted string:
-->

オプションの *options* オブジェクトは、フォーマット化された文字列の
特定の側面を変更するために渡すことができます。

<!--
 - `showHidden` - if `true` then the object's non-enumerable and symbol
   properties will be shown too. Defaults to `false`.
 -->

 - `showHidden` - `true` の場合、
   オブジェクトの Enumerable でないプロパティとシンボルも表示されます。
   デフォルトは `false` です。


<!--
 - `depth` - tells `inspect` how many times to recurse while formatting the
   object. This is useful for inspecting large complicated objects. Defaults to
   `2`. To make it recurse indefinitely pass `null`.
-->

 - `depth` - オブジェクトをフォーマットするために何回再帰するかを
   `inspect` に伝えます。
   これは巨大で複雑なオブジェクトを調査する場合に便利です。
   デフォルトは `2` です。
   無限に再帰するには、`null` を渡します。

<!--
 - `colors` - if `true`, then the output will be styled with ANSI color codes.
   Defaults to `false`. Colors are customizable, see below.
-->

 - `colors` - `true` の場合、出力は ANSI カラーコードで色づけされます。
デフォルトは `false` です。
後述するように、色はカスタマイズ可能です。

<!--
 - `customInspect` - if `false`, then custom `inspect(depth, opts)` functions
   defined on the objects being inspected won't be called. Defaults to `true`.
 -->

  - `customInspect` - `false` の場合、オブジェクト独自の `inspect(depth, opts)`
   関数は呼び出されません。デフォルトは `true` です。

<!--
Example of inspecting all properties of the `util` object:
-->

`util` オブジェクトの全てのプロパティを調査する例:

    var util = require('util');

    console.log(util.inspect(util, { showHidden: true, depth: null }));

<!--
Values may supply their own custom `inspect(depth, opts)` functions, when
called they receive the current depth in the recursive inspection, as well as
the options object passed to `util.inspect()`.
-->

値はそれ自身のカスタム `inspect(depth, opts)` 関数を提供するかもしれません。
それは呼び出される時、現在の再帰的な深さおよび `util.inspect()` に渡された
`options` オブジェクトを受け取ります。

### Customizing `util.inspect` colors

<!-- type=misc -->

<!--
Color output (if enabled) of `util.inspect` is customizable globally
via `util.inspect.styles` and `util.inspect.colors` objects.
-->

`util.inspect` が出力する色は、(有効であれば) `util.inspect.styles` および
`util.inspect.colors` オブジェクトを通じてグローバルにカスタマイズすることが
可能です。


<!--
`util.inspect.styles` is a map assigning each style a color
from `util.inspect.colors`.
Highlighted styles and their default values are:
-->

`util.inspect.styles` は各スタイルと `util.inspect.colors` に
定義された色を割り当てたマッピングです。
強調されるスタイルとそれらのデフォルト値は:

<!--
 * `number` (yellow)
 * `boolean` (yellow)
 * `string` (green)
 * `date` (magenta)
 * `regexp` (red)
 * `null` (bold)
 * `undefined` (grey)
 * `special` - only function at this time (cyan)
 * `name` (intentionally no styling)
-->

 * `number` (黄)
 * `boolean` (黄)
 * `string` (緑)
 * `date` (紫)
 * `regexp` (赤)
 * `null` (太字)
 * `undefined` (灰)
 * `special` - only function at this time (水色)
 * `name` (意図的にスタイル無し)

<!--
Predefined color codes are: `white`, `grey`, `black`, `blue`, `cyan`,
`green`, `magenta`, `red` and `yellow`.
There are also `bold`, `italic`, `underline` and `inverse` codes.
-->

事前に定義された色は: `white`、`grey`、`black`、`blue`、`cyan`、
`green`、`magenta`、`red`、および `yellow` です。
`bold`、`italic`、`underline`、および `inverse` コードを使うこともできます。


### Custom `inspect()` function on Objects

<!-- type=misc -->

<!--
Objects also may define their own `inspect(depth)` function which `util.inspect()`
will invoke and use the result of when inspecting the object:
-->

オブジェクトは `util.inspect()` から呼び出される自前の `inspect(depth)`
関数を持つことができ、その結果はオブジェクトを調査するために使われます。

    var util = require('util');

    var obj = { name: 'nate' };
    obj.inspect = function(depth) {
      return '{' + this.name + '}';
    };

    util.inspect(obj);
      // "{nate}"

<!--
You may also return another Object entirely, and the returned String will be
formatted according to the returned Object. This is similar to how
`JSON.stringify()` works:
-->

全く別のオブジェクトを返すこともできます。
戻り値の文字列は、そのオブジェクトに従ってフォーマットされます。
これは `JSON.stringify()` の動作とよく似ています。

    var obj = { foo: 'this will not show up in the inspect() output' };
    obj.inspect = function(depth) {
      return { bar: 'baz' };
    };

    util.inspect(obj);
      // "{ bar: 'baz' }"


## util.isArray(object)

<!--
Internal alias for Array.isArray.
-->

Array.isArray の内部エイリアスになっています。

<!--
Returns `true` if the given "object" is an `Array`. `false` otherwise.
-->

`object` が配列なら `true` を、それ以外は `false` を返します。

    var util = require('util');

    util.isArray([])
      // true
    util.isArray(new Array)
      // true
    util.isArray({})
      // false


## util.isRegExp(object)

<!--
Returns `true` if the given "object" is a `RegExp`. `false` otherwise.
-->

`object` が `RegExp` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isRegExp(/some regexp/)
      // true
    util.isRegExp(new RegExp('another regexp'))
      // true
    util.isRegExp({})
      // false


## util.isDate(object)

<!--
Returns `true` if the given "object" is a `Date`. `false` otherwise.
-->

`object` が `Date` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isDate(new Date())
      // true
    util.isDate(Date())
      // false (without 'new' returns a String)
    util.isDate({})
      // false


## util.isError(object)

<!--
Returns `true` if the given "object" is an `Error`. `false` otherwise.
-->

`object` が `Error` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isError(new Error())
      // true
    util.isError(new TypeError())
      // true
    util.isError({ name: 'Error', message: 'an error occurred' })
      // false


## util.isBoolean(object)

<!--
Returns `true` if the given "object" is a `Boolean`. `false` otherwise.
-->

`object` が `Boolean` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isBoolean(1)
      // false
    util.isBoolean(0)
      // false
    util.isBoolean(false)
      // true


## util.isNull(object)

<!--
Returns `true` if the given "object" is strictly `null`. `false` otherwise.
-->

`object` が厳密に `null` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isNull(0)
      // false
    util.isNull(undefined)
      // false
    util.isNull(null)
      // true


## util.isNullOrUndefined(object)

<!--
Returns `true` if the given "object" is `null` or `undefined`. `false` otherwise.
-->

`object` が `null` か `undefined` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isNullOrUndefined(0)
      // false
    util.isNullOrUndefined(undefined)
      // true
    util.isNullOrUndefined(null)
      // true


## util.isNumber(object)

<!--
Returns `true` if the given "object" is a `Number`. `false` otherwise.
-->

`object` が `Number` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isNumber(false)
      // false
    util.isNumber(Infinity)
      // true
    util.isNumber(0)
      // true
    util.isNumber(NaN)
      // true


## util.isString(object)

<!--
Returns `true` if the given "object" is a `String`. `false` otherwise.
-->

`object` が `String` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isString('')
      // true
    util.isString('foo')
      // true
    util.isString(String('foo'))
      // true
    util.isString(5)
      // false


## util.isSymbol(object)

<!--
Returns `true` if the given "object" is a `Symbol`. `false` otherwise.
-->

`object` が `Symbol` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isSymbol(5)
      // false
    util.isSymbol('foo')
      // false
    util.isSymbol(Symbol('foo'))
      // true


## util.isUndefined(object)

<!--
Returns `true` if the given "object" is `undefined`. `false` otherwise.
-->

`object` が `undefined` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    var foo;
    util.isUndefined(5)
      // false
    util.isUndefined(foo)
      // true
    util.isUndefined(null)
      // false


## util.isObject(object)

<!--
Returns `true` if the given "object" is strictly an `Object`. `false` otherwise.
-->

`object` が厳密に `Object` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isObject(5)
      // false
    util.isObject(null)
      // false
    util.isObject({})
      // true


## util.isFunction(object)

<!--
Returns `true` if the given "object" is a `Function`. `false` otherwise.
-->

`object` が `Function` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    function Foo() {}
    var Bar = function() {};

    util.isFunction({})
      // false
    util.isFunction(Foo)
      // true
    util.isFunction(Bar)
      // true


## util.isPrimitive(object)

<!--
Returns `true` if the given "object" is a primitive type. `false` otherwise.
-->

primitive`object` がプリミティブ型なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isPrimitive(5)
      // true
    util.isPrimitive('foo')
      // true
    util.isPrimitive(false)
      // true
    util.isPrimitive(null)
      // true
    util.isPrimitive(undefined)
      // true
    util.isPrimitive({})
      // false
    util.isPrimitive(function() {})
      // false
    util.isPrimitive(/^$/)
      // false
    util.isPrimitive(new Date())
      // false


## util.isBuffer(object)

<!--
Returns `true` if the given "object" is a `Buffer`. `false` otherwise.
-->

`object` が `Buffer` なら `true` を、それ以外なら `false` を返します。

    var util = require('util');

    util.isBuffer({ length: 0 })
      // false
    util.isBuffer([])
      // false
    util.isBuffer(new Buffer('hello world'))
      // true


## util.inherits(constructor, superConstructor)

<!--
Inherit the prototype methods from one
[constructor](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/constructor)
into another.  The prototype of `constructor` will be set to a new
object created from `superConstructor`.
-->

ある
[コンストラクタ](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/constructor)
からプロトタイプメソッドを継承します。
`constructor` のプロトタイプは `superConstructor` から作られたオブジェクトに設定されます。

<!--
As an additional convenience, `superConstructor` will be accessible
through the `constructor.super_` property.
-->

さらなる利便性のために、`superConstructor` は `constructor.super_`
プロパティを通じてアクセスすることができるようになります。

    var util = require("util");
    var events = require("events");

    function MyStream() {
        events.EventEmitter.call(this);
    }

    util.inherits(MyStream, events.EventEmitter);

    MyStream.prototype.write = function(data) {
        this.emit("data", data);
    }

    var stream = new MyStream();

    console.log(stream instanceof events.EventEmitter); // true
    console.log(MyStream.super_ === events.EventEmitter); // true

    stream.on("data", function(data) {
        console.log('Received data: "' + data + '"');
    })
    stream.write("It works!"); // Received data: "It works!"


## util.deprecate(function, string)

Marks that a method should not be used any more.

    exports.puts = exports.deprecate(function() {
      for (var i = 0, len = arguments.length; i < len; ++i) {
        process.stdout.write(arguments[i] + '\n');
      }
    }, 'util.puts: Use console.log instead')

It returns a modified function which warns once by default.

If `--no-deprecation` is set then this function is a NO-OP.  Configurable
at run-time through the `process.noDeprecation` boolean (only effective
when set before a module is loaded.)

If `--trace-deprecation` is set, a warning and a stack trace are logged
to the console the first time the deprecated API is used.  Configurable
at run-time through the `process.traceDeprecation` boolean.

If `--throw-deprecation` is set then the application throws an exception
when the deprecated API is used.  Configurable at run-time through the
`process.throwDeprecation` boolean.

`process.throwDeprecation` takes precedence over `process.traceDeprecation`.

## util.debug(string)

    Stability: 0 - Deprecated: use console.error() instead.

<!--
Deprecated predecessor of `console.error`.
-->

`console.error()` に置き換えられて廃止予定です。

## util.error([...])

    Stability: 0 - Deprecated: Use console.error() instead.

<!--
Deprecated predecessor of `console.error`.
-->

`console.error()` に置き換えられて廃止予定です。

## util.puts([...])

    Stability: 0 - Deprecated: Use console.log() instead.

<!--
Deprecated predecessor of `console.log`.
-->

`console.log()` に置き換えられて廃止予定です。

## util.print([...])

    Stability: 0 - Deprecated: Use `console.log` instead.

<!--
Deprecated predecessor of `console.log`.
-->

`console.log()` に置き換えられて廃止予定です。



## util.pump(readableStream, writableStream[, callback])

    Stability: 0 - Deprecated: Use readableStream.pipe(writableStream)

<!--
Deprecated predecessor of `stream.pipe()`.
-->

`stream.pipe()` に置き換えられて廃止予定です。
