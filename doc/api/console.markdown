# console

    Stability: 4 - API Frozen

* {Object}

<!--type=global-->

<!--
For printing to stdout and stderr.  Similar to the console object functions
provided by most web browsers, here the output is sent to stdout or stderr.
-->

標準出力と標準エラーに出力するためのものです。
ほとんどのブラウザで提供されているコンソールオブジェクトと同様ですが、
出力は標準出力か標準エラー出力に送られます。

<!--
The console functions are synchronous when the destination is a terminal or
a file (to avoid lost messages in case of premature exit) and asynchronous
when it's a pipe (to avoid blocking for long periods of time).
-->

コンソール関数は出力先がターミナルまたはファイルの場合は同期
(早すぎる終了によりメッセージが失われるケースを防ぐため)、
パイプの場合は非同期 (長時間ブロックすることを防ぐため) です。

<!--
That is, in the following example, stdout is non-blocking while stderr
is blocking:
-->

つまり、以下の例では標準出力はノンブロッキングですが、
標準エラー出力はブロッキングです:

    $ node script.js 2> error.log | tee info.log

<!--
In daily use, the blocking/non-blocking dichotomy is not something you
should worry about unless you log huge amounts of data.
-->

通常の使用では、膨大な量のデータを記録するのではない限り、
ブロッキング／ノンブロッキングのどちらなのかを心配する必要はありません。

## console.log([data][, ...])

<!--
Prints to stdout with newline. This function can take multiple arguments in a
`printf()`-like way. Example:
-->

改行を伴って標準出力へプリントします。
この関数は `printf()` のように複数の引数を受け付けます。

    var count = 5;
    console.log('count: %d', count);
    // prints 'count: 5'

<!--
If formatting elements are not found in the first string then `util.inspect`
is used on each argument.  See [util.format()][] for more information.
-->

最初の引数文字列からフォーマット要素が見つからなかった場合は、
`util.inspect` が各引数に使われます。
より詳細は [util.format()][] を参照してください。

## console.info([data][, ...])

<!--
Same as `console.log`.
-->

`console.log` と同じです。

## console.error([data][, ...])

<!--
Same as `console.log` but prints to stderr.
-->

`console.log` と同様ですが、標準エラー出力にプリントします。

## console.warn([data][, ...])

<!--
Same as `console.error`.
-->

`console.error()` と同じです。

## console.dir(obj[, options])

<!--
Uses `util.inspect` on `obj` and prints resulting string to stdout. This function
bypasses any custom `inspect()` function on `obj`. An optional *options* object
may be passed that alters certain aspects of the formatted string:
-->

`util.inspect` を使って `obj` を文字列化した結果を標準出力にプリントします。
この関数はあらゆるオブジェクトのカスタム `inspect()` 関数をバイパスします。
表示する文字列のフォーマットを変更するオプショナルな
*オプション* オブジェクトを渡すことができます。

<!--

- `showHidden` - if `true` then the object's non-enumerable and symbol
properties will be shown too. Defaults to `false`.

-->

- `showHidden` - もし `true` ならばオブジェクトの enumerable が false な
プロパティやSymbolのプロパティも表示されます。デフォルトは `false` です。

<!--
- `depth` - tells `inspect` how many times to recurse while formatting the
object. This is useful for inspecting large complicated objects. Defaults to
`2`. To make it recurse indefinitely pass `null`.
-->

- `depth` - `inspect` にフォーマットの間に何回再帰するかを伝えます。
これは、大規模かつ複雑なオブジェクトを検査するのに便利です。
デフォルトは `2` です。無限に再帰するには `null` を渡します。

<!--
- `colors` - if `true`, then the output will be styled with ANSI color codes.
Defaults to `false`. Colors are customizable, see below.
-->

- `colors` - もし `true` ならば出力はANSIカラーコードで色付けされます。
デフォルトは `false` です。
色はカスタマイズ可能です。以下を参照してください。

## console.time(label)

<!--
Used to calculate the duration of a specific operation. To start a timer, call
the `console.time()` method, giving it a name as only parameter. To stop the
timer, and to get the elapsed time in miliseconds, just call the
[`console.timeEnd()`](#console_console_timeend_label) method, again passing the
timer's name as the parameter.
-->

特定の操作の期間を計算するために使用します。
タイマーを開始するには、 `console.time()` メソッドに
唯一のパラメータである名前を与えて呼び出します。
タイマーを停止しミリ秒の経過時間を取得するには、タイマーの名前をパラメータとして
[`console.timeEnd()`](#console_console_timeend_label) を呼び出すだけです。

## console.timeEnd(label)

<!--
Stops a timer that was previously started by calling
[`console.time()`](#console_console_time_label) and print the result to the
console.
-->

以前に [`console.time()`](#console_console_time_label) を呼ぶことで
開始されたタイマーを停止させ、結果をコンソールにプリントします。

<!--
Example:
-->

例:

    console.time('100-elements');
    for (var i = 0; i < 100; i++) {
      ;
    }
    console.timeEnd('100-elements');
    // prints 100-elements: 262ms

## console.trace(message[, ...])

<!--
Print to stderr `'Trace :'`, followed by the formatted message and stack trace
to the current position.
-->

`'Trace :'` に続いてフォーマットされたメッセージと現在のスタックトレースを
標準エラーにプリントします。

## console.assert(value[, message][, ...])

<!--
Similar to [assert.ok()][], but the error message is formatted as
`util.format(message...)`.
-->

[assert.ok()][] に似ていますが、エラーメッセージは `util.format(message...)`
によってフォーマットされます。

[assert.ok()]: assert.html#assert_assert_value_message_assert_ok_value_message
[util.format()]: util.html#util_util_format_format
