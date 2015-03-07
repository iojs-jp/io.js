# TTY

    Stability: 2 - Unstable

<!--
The `tty` module houses the `tty.ReadStream` and `tty.WriteStream` classes. In
most cases, you will not need to use this module directly.
-->

`tty` モジュールは `tty.ReadStream` と `tty.WriteStream` クラスを持ちます。
多くのケースでは、これらを直接使う必要はありません。

<!--
When io.js detects that it is being run inside a TTY context, then `process.stdin`
will be a `tty.ReadStream` instance and `process.stdout` will be
a `tty.WriteStream` instance. The preferred way to check if io.js is being run
in a TTY context is to check `process.stdout.isTTY`:
-->

io.js は TTY コンテキストの中にいるかどうかを検出し、
`process.stdin` は `tty.ReadStream` のインスタンスに、
`process.stdout` は `tty.WriteStream` のインスタンスになります。
もし io.js が TTY のコンテキストで実行されているかどうかをチェックしたければ、
`process.stdout.isTTY` を使うことができます:

    $ iojs -p -e "Boolean(process.stdout.isTTY)"
    true
    $ iojs -p -e "Boolean(process.stdout.isTTY)" | cat
    false


## tty.isatty(fd)

<!--
Returns `true` or `false` depending on if the `fd` is associated with a
terminal.
-->

`fd` が端末に関連づけられているかどうかを `true` または `false` で返します。


## tty.setRawMode(mode)

<!--
Deprecated. Use `tty.ReadStream#setRawMode()`
(i.e. `process.stdin.setRawMode()`) instead.
-->

Deprecated.
代わりに `tty.ReadStream#setRawMode()` (すなわち、`process.stdin.setRawMode()`)
を使用してください。


## Class: ReadStream

<!--
A `net.Socket` subclass that represents the readable portion of a tty. In normal
circumstances, `process.stdin` will be the only `tty.ReadStream` instance in any
io.js program (only when `isatty(0)` is true).
-->

`net.Socket` のサブクラスで、tty の入力側を表現します。
一般的な状況では、どんなプログラムでも (`isatty(0)` が true の場合に限り)
`process.stdin` が唯一の `tty.ReadStream` のインスタンスとなります。

### rs.isRaw

<!--
A `Boolean` that is initialized to `false`. It represents the current "raw" state
of the `tty.ReadStream` instance.
-->

`Boolean` 値で `false` に初期化されます。
`tty.ReadStream` インスタンスの現在の "raw" 状態を表現します。

### rs.setRawMode(mode)

<!--
`mode` should be `true` or `false`. This sets the properties of the
`tty.ReadStream` to act either as a raw device or default. `isRaw` will be set
to the resulting mode.
-->

`mode` は `true` または `false` のどちらかです。
これは `tty.ReadStream` がローデバイスかデフォルトのどちらで振る舞うかを
設定します。
結果のモードは `isRaw` に設定されます。



## Class: WriteStream

<!--
A `net.Socket` subclass that represents the writable portion of a tty. In normal
circumstances, `process.stdout` will be the only `tty.WriteStream` instance
ever created (and only when `isatty(1)` is true).
-->

`net.Socket` のサブクラスで、tty の出力側を表現します。
一般的な状況では、どんなプログラムでも (`isatty(1)` が true の場合に限り)
`process.stdout` が唯一の `tty.WriteStream` のインスタンスとなります。

### ws.columns

<!--
A `Number` that gives the number of columns the TTY currently has. This property
gets updated on "resize" events.
-->

TTY の現在のカラム数を保持する `Number` 値です。
このプロパティは `'resize'` イベントで更新されます。

### ws.rows

<!--
A `Number` that gives the number of rows the TTY currently has. This property
gets updated on "resize" events.
-->

TTY の現在の行数を保持する `Number` 値です。
このプロパティは `'resize'` イベントで更新されます。

### Event: 'resize'

`function () {}`

<!--
Emitted by `refreshSize()` when either of the `columns` or `rows` properties
has changed.
-->

`columns` または `rows` プロパティが変更された場合に
`refreshSize()` によって生成されます。


    process.stdout.on('resize', function() {
      console.log('screen size has changed!');
      console.log(process.stdout.columns + 'x' + process.stdout.rows);
    });
