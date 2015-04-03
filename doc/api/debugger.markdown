# Debugger

    Stability: 3 - Stable

<!-- type=misc -->

<!--
V8 comes with an extensive debugger which is accessible out-of-process via a
simple [TCP protocol](http://code.google.com/p/v8/wiki/DebuggerProtocol).
io.js has a built-in client for this debugger. To use this, start io.js with the
`debug` argument; a prompt will appear:
-->

V8は外部プロセスから [TCP プロトコル](http://code.google.com/p/v8/wiki/DebuggerProtocol)経由で接続可能なデバッガを備えています。
io.js にはこのデバッガへのクライアントが組み込まれています。
これを使うには、 `debug` 引数を指定して io.js を起動します。
次のようになります:

    % iojs debug myscript.js
    < debugger listening on port 5858
    connecting... ok
    break in /home/indutny/Code/git/indutny/myscript.js:1
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
    debug>

<!--
io.js's debugger client doesn't support the full range of commands, but
simple step and inspection is possible. By putting the statement `debugger;`
into the source code of your script, you will enable a breakpoint.
-->

io.js のデバッガクライアントはあらゆるコマンドを完全にサポートしているわけではありませんが、
単純なステップ実行やインスペクションが可能です。
スクリプトのソースコードに `debugger;` 文を挿入すると、
ブレークポイントが有効になります。

<!--
For example, suppose `myscript.js` looked like this:
-->

例えば、`myscript.js` が次のようだとします:

    // myscript.js
    x = 5;
    setTimeout(function () {
      debugger;
      console.log("world");
    }, 1000);
    console.log("hello");

<!--
Then once the debugger is run, it will break on line 4.
-->

ひとたびデバッガを実行すると、4行目で中断します。

    % iojs debug myscript.js
    < debugger listening on port 5858
    connecting... ok
    break in /home/indutny/Code/git/indutny/myscript.js:1
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
    debug> cont
    < hello
    break in /home/indutny/Code/git/indutny/myscript.js:3
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
      4   console.log("world");
      5 }, 1000);
    debug> next
    break in /home/indutny/Code/git/indutny/myscript.js:4
      2 setTimeout(function () {
      3   debugger;
      4   console.log("world");
      5 }, 1000);
      6 console.log("hello");
    debug> repl
    Press Ctrl + C to leave debug repl
    > x
    5
    > 2+2
    4
    debug> next
    < world
    break in /home/indutny/Code/git/indutny/myscript.js:5
      3   debugger;
      4   console.log("world");
      5 }, 1000);
      6 console.log("hello");
      7
    debug> quit
    %


<!--
The `repl` command allows you to evaluate code remotely. The `next` command
steps over to the next line. There are a few other commands available and more
to come. Type `help` to see others.
-->

`repl` コマンドはコードをリモートで評価します。
`next` コマンドは次の行にステップオーバーします。
他にもいくつかのコマンドを利用することができます。
その他については `help` をタイプしてください。

## Watchers

<!--
You can watch expression and variable values while debugging your code.
On every breakpoint each expression from the watchers list will be evaluated
in the current context and displayed just before the breakpoint's source code
listing.
-->

デバッグ中に式や変数の値をウォッチすることができます。
全てのブレークポイントにおいて、ウォッチリストのそれぞれの式は
現在のコンテキストで評価され、ブレークポイントのソースコードの前に
表示されます。

<!--
To start watching an expression, type `watch("my_expression")`. `watchers`
prints the active watchers. To remove a watcher, type
`unwatch("my_expression")`.
-->

式のウォッチを開始するには、`watch("my_expression")` をタイプします。
`watchers` はアクティブなウォッチの一覧を表示します。
ウォッチを解除するには、`unwatch("my_expression")` とタイプします。

## Commands reference

### Stepping

<!--
* `cont`, `c` - Continue execution
* `next`, `n` - Step next
* `step`, `s` - Step in
* `out`, `o` - Step out
* `pause` - Pause running code (like pause button in Developer Tools)
-->

* `cont`, `c` - 実行を継続します。
* `next`, `n` - 次の行へステップオーバーします。
* `step`, `s` - ステップインします。
* `out`, `o` - ステップアウトします。
* `pause` - コードの実行を中断します (Developer Tools の pause
  ボタンと同じです。

### Breakpoints

<!--
* `setBreakpoint()`, `sb()` - Set breakpoint on current line
* `setBreakpoint(line)`, `sb(line)` - Set breakpoint on specific line
* `setBreakpoint('fn()')`, `sb(...)` - Set breakpoint on a first statement in
functions body
* `setBreakpoint('script.js', 1)`, `sb(...)` - Set breakpoint on first line of
script.js
* `clearBreakpoint('script.js', 1)`, `cb(...)` - Clear breakpoint in script.js
on line 1
-->

* `setBreakpoint()`, `sb()` - 現在行にブレークポイントを設定します。
* `setBreakpoint(line)`, `sb(line)` - 指定した行にブレークポイントを設定します。
* `setBreakpoint('fn()')`, `sb(...)` - 指定した関数の先頭行にブレークポイントを設定します
* `setBreakpoint('script.js', 1)`, `sb(...)` - 指定したスクリプトファイルの指定した行にブレークポイントを設定します。
* `clearBreakpoint('script.js', 1)`, `cb(...)` - script.js の1行目のブレークポイントを削除します。

<!--
It is also possible to set a breakpoint in a file (module) that
isn't loaded yet:
-->

まだロードされていないファイル (モジュール) にブレークポイントを
設定することもできます。

    % ./iojs debug test/fixtures/break-in-module/main.js
    < debugger listening on port 5858
    connecting to port 5858... ok
    break in test/fixtures/break-in-module/main.js:1
      1 var mod = require('./mod.js');
      2 mod.hello();
      3 mod.hello();
    debug> setBreakpoint('mod.js', 23)
    Warning: script 'mod.js' was not loaded yet.
      1 var mod = require('./mod.js');
      2 mod.hello();
      3 mod.hello();
    debug> c
    break in test/fixtures/break-in-module/mod.js:23
     21
     22 exports.hello = function() {
     23   return 'hello from module';
     24 };
     25
    debug>

### Info

<!--
* `backtrace`, `bt` - Print backtrace of current execution frame
* `list(5)` - List scripts source code with 5 line context (5 lines before and
after)
* `watch(expr)` - Add expression to watch list
* `unwatch(expr)` - Remove expression from watch list
* `watchers` - List all watchers and their values (automatically listed on each
breakpoint)
* `repl` - Open debugger's repl for evaluation in debugging script's context
-->

* `backtrace`, `bt` - 現在の実行フレームのバックトレースを表示します。
* `list(5)` - 現在の行の前後のソースコードを表示します (例では前後とも 5 行が表示されます)。
* `watch(expr)` - 式をウォッチリストに追加します。
* `unwatch(expr)` - 式をウォッチリストから削除します。
* `watchers` - ウォッチしている全ての式とその値を表示します (各ブレークポイントで自動的に表示されます)。
* `repl` - デバッグしているスクリプトをコンテキストとする REPL を開きます。

### Execution control

<!--
* `run` - Run script (automatically runs on debugger's start)
* `restart` - Restart script
* `kill` - Kill script
-->

* `run` - スクリプトを実行します (デバッガを開始すると自動的に実行します)。
* `restart` - スクリプトを再実行します。
* `kill` - スクリプトを終了します。

### Various

<!--
* `scripts` - List all loaded scripts
* `version` - Display v8's version
-->

* `scripts` - ロードされている全スクリプトの一覧を表示します。
* `version` - v8 のバージョンを表示します。

## Advanced Usage

<!--
The V8 debugger can be enabled and accessed either by starting io.js with
the `--debug` command-line flag or by signaling an existing io.js process
with `SIGUSR1`.
-->

V8 デバッガは io.js をコマンドラインの `--debug` フラグで起動したり、起動済みの io.js プロセスに `SIGUSR1` シグナルを送ることでも有効にできます。

<!--
Once a process has been set in debug mode with this it can be connected to
with the io.js debugger. Either connect to the `pid` or the URI to the debugger.
The syntax is:
-->

これによって一度デバッグモードに設定されたプロセスは、
`pid` または URI のどちらでも io.js デバッガに接続することができます。
形式は:

<!--
* `iojs debug -p <pid>` - Connects to the process via the `pid`
* `iojs debug <URI>` - Connects to the process via the URI such as localhost:5858
-->

* `iojs debug -p <pid>` - `pid` を通じてプロセスに接続
* `iojs debug <URI>` - `localhost:585` のような URI を通じてプロセスに接続
