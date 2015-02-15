# Executing JavaScript

    Stability: 3 - Stable

<!--name=vm-->

<!--
You can access this module with:
-->

次のようにすることで、このモジュールにアクセスすることができます:


    var vm = require('vm');

<!--
JavaScript code can be compiled and run immediately or compiled, saved, and run
later.
-->

JavaScript コードは、コンパイルされてすぐに実行されるか、コンパイルおよび保存されて後から実行されます。

## vm.runInThisContext(code[, options])

<!--
`vm.runInThisContext()` compiles `code`, runs it and returns the result. Running
code does not have access to local scope, but does have access to the current
`global` object.
-->

`vm.runInThisContext()` は `code` をコンパイルして実行し、結果を返します。
実行されるコードはローカルスコープにアクセスしませんが、現在の `global`
オブジェクトにアクセスすることはできます。

<!--
Example of using `vm.runInThisContext` and `eval` to run the same code:
-->

`vm.runInThisContext` と `eval` で同じコードを実行する例:

    var localVar = 'initial value';

    var vmResult = vm.runInThisContext('localVar = "vm";');
    console.log('vmResult: ', vmResult);
    console.log('localVar: ', localVar);

    var evalResult = eval('localVar = "eval";');
    console.log('evalResult: ', evalResult);
    console.log('localVar: ', localVar);

    // vmResult: 'vm', localVar: 'initial value'
    // evalResult: 'eval', localVar: 'eval'

<!--
`vm.runInThisContext` does not have access to the local scope, so `localVar` is
unchanged. `eval` does have access to the local scope, so `localVar` is changed.
-->

`vm.runInThisContext()` はローカルスコープにアクセスしないので、
`localVar` は変更されません。
`eval()` はローカルスコープにアクセスするので、`localVar` は変更されます。

<!--
In this way `vm.runInThisContext` is much like an [indirect `eval` call][1],
e.g. `(0,eval)('code')`. However, it also has the following additional options:
-->

この方法では、`vm.runInThisContext()` は [間接的な `eval` 呼び出し][1]
とほぼ同じですが (例: `(0,eval)('code')`)。
しかし、それに加えて以下のオプションがあります。

<!--
- `filename`: allows you to control the filename that shows up in any stack
  traces produced.
- `displayErrors`: whether or not to print any errors to stderr, with the
  line of code that caused them highlighted, before throwing an exception.
  Will capture both syntax errors from compiling `code` and runtime errors
  thrown by executing the compiled code. Defaults to `true`.
- `timeout`: a number of milliseconds to execute `code` before terminating
  execution. If execution is terminated, an `Error` will be thrown.
-->

- `filename`: 生成されるスタックトレースに表示されるファイル名を
  制御することができます。
- `displayErrors`: 例外をスローする前に、エラーの原因となったコードの行を
  ハイライトして標準エラー出力にプリントするか否か。
  `code` をコンパイルした場合の文法エラーと、コンパイルされたコードを
  実行した際のランタイムエラーの両方を捕まえます。
- `timeout`: `code` の実行が終了するまでのミリ秒単位の時間。
  もし実行が終了しなければ、`Error` がスローされます。

[1]: http://es5.github.io/#x10.4.2


## vm.createContext([sandbox])

<!--
If given a `sandbox` object, will "contextify" that sandbox so that it can be
used in calls to `vm.runInContext` or `script.runInContext`. Inside scripts run
as such, `sandbox` will be the global object, retaining all its existing
properties but also having the built-in objects and functions any standard
[global object][2] has. Outside of scripts run by the vm module, `sandbox` will
be unchanged.
-->

もし `sandbox` オブジェクトが与えられると、`vm.runInContext()` や
`script.runInContext()` の呼び出しで利用できるようにサンドボックスを
「コンテキスト化された」します。
実行中のスクリプト内では、`sandbox` はグローバルオブジェクトとなります。
それは存在するプロパティに加えて、標準の [グローバルオブジェクト][2]
が持つ組込のオブジェクトや関数などを保持します。
vm モジュールによって実行されているスクリプトの外側では、`sandbox`
は変更されません。

<!--
If not given a sandbox object, returns a new, empty contextified sandbox object
you can use.
-->

サンドボックスオブジェクトが与えられなかった場合は、
新しくて空のコンテキスト化されたサンドボックスオブジェクトが返されます。

<!--
This function is useful for creating a sandbox that can be used to run multiple
scripts, e.g. if you were emulating a web browser it could be used to create a
single sandbox representing a window's global object, then run all `<script>`
tags together inside that sandbox.
-->

この関数は複数のスクリプトから利用可能なサンドボックスを作るのに便利です。
たとえば、Webブラウザをエミュレートするためにグローバルオブジェクトである
window を表現する単一のサンドボックスを作成し、全ての `<script>` タグを
そのサンドボックス内で一緒に実行します。

[2]: http://es5.github.io/#x15.1


## vm.isContext(sandbox)

<!--
Returns whether or not a sandbox object has been contextified by calling
`vm.createContext` on it.
-->

サンドボックスオブジェクトが `vm.createContext()` によって
コンテキスト化されているかどうかを返します。

## vm.runInContext(code, contextifiedSandbox[, options])

<!--
`vm.runInContext` compiles `code`, then runs it in `contextifiedSandbox` and
returns the result. Running code does not have access to local scope. The
`contextifiedSandbox` object must have been previously contextified via
`vm.createContext`; it will be used as the global object for `code`.
-->

`vm.runInContext()` は、`code` をコンパイルしてそれを `contextifiedSandbox`
の中で実行し、その結果を返します。
実行されるコードはローカルスコープにアクセスしません。
`contextifiedSandbox` オブジェクトは `vm.createContext()` を通じて事前に
コンテキスト化されていなければなりません;
それは `code` のグローバルオブジェクトとして使われます。

<!--
`vm.runInContext` takes the same options as `vm.runInThisContext`.
-->

`vm.runInContext()` は `vm.runInThisContext()` と同じオプションを受け取ります。

<!--
Example: compile and execute different scripts in a single existing context.
-->

例: 異なるスクリプトを単一の既存コンテキスト中でコンパイルして実行します。

    var util = require('util');
    var vm = require('vm');

    var sandbox = { globalVar: 1 };
    vm.createContext(sandbox);

    for (var i = 0; i < 10; ++i) {
        vm.runInContext('globalVar *= 2;', sandbox);
    }
    console.log(util.inspect(sandbox));

    // { globalVar: 1024 }

<!--
Note that running untrusted code is a tricky business requiring great care.
`vm.runInContext` is quite useful, but safely running untrusted code requires a
separate process.
-->

信頼できないコードの実行は、細心の注意が求められることに注意してください。
`vm.runInContext()` は有用ですが、信頼できないコードを安全に実行するには
別のプロセスが必要となります。


## vm.runInNewContext(code[, sandbox][, options])

<!--
`vm.runInNewContext` compiles `code`, contextifies `sandbox` if passed or
creates a new contextified sandbox if it's omitted, and then runs the code with
the sandbox as the global object and returns the result.
-->

`vm.runInNewContext()` は `code` をコンパイルし、`sandbox` が与えられれば
それをコンテキスト化し、または省略された場合は新しいコンテキスト化された
サンドボックスを作成し、サンドボックスをグローバルオブジェクトとしてコードを
実行し、その結果を返します。

<!--
`vm.runInNewContext` takes the same options as `vm.runInThisContext`.
-->

`vm.runInNewContext()` は `vm.runInThisContext()` と同じオプションを
受け取ります。

<!--
Example: compile and execute code that increments a global variable and sets a
new one. These globals are contained in the sandbox.
-->

例: コードをコンパイルして実行し、グローバル変数をインクリメントし、
新しい値を設定します。そのグローバルはサンドボックスに含まれます。

    var util = require('util');
    var vm = require('vm'),

    var sandbox = {
      animal: 'cat',
      count: 2
    };

    vm.runInNewContext('count += 1; name = "kitty"', sandbox);
    console.log(util.inspect(sandbox));

    // { animal: 'cat', count: 3, name: 'kitty' }

<!--
Note that running untrusted code is a tricky business requiring great care.
`vm.runInNewContext` is quite useful, but safely running untrusted code requires
a separate process.
-->

信頼できないコードの実行は、細心の注意が求められることに注意してください。
`vm.runInNewContext()` は有用ですが、信頼できないコードを安全に実行するには
別のプロセスが必要となります。


## vm.runInDebugContext(code)

<!--
`vm.runInDebugContext` compiles and executes `code` inside the V8 debug context.
The primary use case is to get access to the V8 debug object:
-->
`vm.runInDebugContext` は `code`をV8のデバッグコンテキスト内で実行します。
主な使い方はV8のデバッグオブジェクトへのアクセスを得ることです。

    var Debug = vm.runInDebugContext('Debug');
    Debug.scripts().forEach(function(script) { console.log(script.name); });

<!--
Note that the debug context and object are intrinsically tied to V8's debugger
implementation and may change (or even get removed) without prior warning.
-->
デバッグコンテキストとオブジェクトはV8のデバッガーの実装に左右され、
事前の警告なしに変更される(または削除される)可能性があることに注意してください。

<!--
The debug object can also be exposed with the `--expose_debug_as=` switch.
-->

また、デバッグオブジェクトは `--expose_debug_as=` フラグでもアクセス可能にすることができます。

## Class: Script

<!--
A class for holding precompiled scripts, and running them in specific sandboxes.
-->

事前にコンパイルされたスクリプトを保持し、指定されたサンドボックス中で
実行するためのクラスです。


### new vm.Script(code, options)

<!--
Creating a new `Script` compiles `code` but does not run it. Instead, the
created `vm.Script` object represents this compiled code. This script can be run
later many times using methods below. The returned script is not bound to any
global object. It is bound before each run, just for that run.
-->

`code` をコンパイルして新しい `Script` を作成しますが、実行はしません。
作成された `vm.Script` オブジェクトはコンパイルされたコードを表現します。
スクリプトは後述するメソッドを使って後から何度でも実行することができます。
返されたスクリプトオブジェクトは、どのグローバルオブジェクトにも
束縛されていません。それは実行される前に、その実行だけに束縛されます。

<!--
The options when creating a script are:
-->

スクリプトを作成するためのオプションは:

<!--
- `filename`: allows you to control the filename that shows up in any stack
  traces produced from this script.
- `displayErrors`: whether or not to print any errors to stderr, with the
  line of code that caused them highlighted, before throwing an exception.
  Applies only to syntax errors compiling the code; errors while running the
  code are controlled by the options to the script's methods.
-->

- `filename`: 生成されるスタックトレースに表示されるファイル名を
  制御することができます。
- `displayErrors`: 例外をスローする前に、エラーの原因となったコードの行を
  ハイライトして標準エラー出力にプリントするか否か。
  `code` をコンパイルした場合の文法エラーにだけ適用されます;
  コードを実行した際のエラーはスクリプトのメソッドに与えられる
  オプションによって制御されます。

### script.runInThisContext([options])

<!--
Similar to `vm.runInThisContext` but a method of a precompiled `Script` object.
`script.runInThisContext` runs `script`'s compiled code and returns the result.
Running code does not have access to local scope, but does have access to the
current `global` object.
-->

`vm.runInThisContext()` と似ていますが、事前にコンパイルされた `Script`
オブジェクトのメソッドです。`script.runInThisContext()` はコンパイルされた
`script` のコードを実行し、その結果を返します。
実行されるコードはローカルスコープにアクセスしませんが、現在の `global`
オブジェクトにアクセスすることはできます。

<!--
Example of using `script.runInThisContext` to compile code once and run it
multiple times:
-->

`script.runInThisContext()` を使ってコードを一度だけコンパイルし、
複数回実行する例:

    var vm = require('vm');

    global.globalVar = 0;

    var script = new vm.Script('globalVar += 1', { filename: 'myfile.vm' });

    for (var i = 0; i < 1000; ++i) {
      script.runInThisContext();
    }

    console.log(globalVar);

    // 1000

<!--
The options for running a script are:
-->

スクリプトを実行するためのオプションは:

<!--
- `displayErrors`: whether or not to print any runtime errors to stderr, with
  the line of code that caused them highlighted, before throwing an exception.
  Applies only to runtime errors executing the code; it is impossible to create
  a `Script` instance with syntax errors, as the constructor will throw.
- `timeout`: a number of milliseconds to execute the script before terminating
  execution. If execution is terminated, an `Error` will be thrown.
-->

- `displayErrors`: 例外をスローする前に、実行時エラーの原因となったコードの行を
  ハイライトして標準エラー出力にプリントするか否か。
  `code` を実行した場合の実行時エラーにだけ適用されます;
  `Script` のコンストラクタが例外をスローするため、文法エラーのある `Script`
  のインスタンスを生成することは不可能です。
- `timeout`: `code` の実行が終了するまでのミリ秒単位の時間。
  もし実行が終了しなければ、`Error` がスローされます。


### script.runInContext(contextifiedSandbox[, options])

<!--
Similar to `vm.runInContext` but a method of a precompiled `Script` object.
`script.runInContext` runs `script`'s compiled code in `contextifiedSandbox`
and returns the result. Running code does not have access to local scope.
-->

`vm.runInContext()` と似ていますが、事前にコンパイルされた `Script`
オブジェクトのメソッドです。`script.runInContext()` はコンパイルされた
`script` のコードを `contextifiedSandbox` の中で実行し、その結果を返します。
実行されるコードはローカルスコープにアクセスしません。

<!--
`script.runInContext` takes the same options as `script.runInThisContext`.
-->

`script.runInContext()` は `script.runInThisContext()` と同じオプションを
受け取ります。

<!--
Example: compile code that increments a global variable and sets one, then
execute the code multiple times. These globals are contained in the sandbox.
-->

例: コードをコンパイルして実行し、グローバル変数をインクリメントし、
新しい値を設定します。そのグローバルはサンドボックスに含まれます。

    var util = require('util');
    var vm = require('vm');

    var sandbox = {
      animal: 'cat',
      count: 2
    };

    var script = new vm.Script('count += 1; name = "kitty"');

    for (var i = 0; i < 10; ++i) {
      script.runInContext(sandbox);
    }

    console.log(util.inspect(sandbox));

    // { animal: 'cat', count: 12, name: 'kitty' }

<!--
Note that running untrusted code is a tricky business requiring great care.
`script.runInContext` is quite useful, but safely running untrusted code
requires a separate process.
-->

信頼できないコードの実行は、細心の注意が求められることに注意してください。
`script.runInContext()` は有用ですが、信頼できないコードを安全に実行するには
別のプロセスが必要となります。


### script.runInNewContext([sandbox][, options])

S<!--
Similar to `vm.runInNewContext` but a method of a precompiled `Script` object.
`script.runInNewContext` contextifies `sandbox` if passed or creates a new
contextified sandbox if it's omitted, and then runs `script`'s compiled code
with the sandbox as the global object and returns the result. Running code does
not have access to local scope.
-->

`vm.runInNewContext()` と似ていますが、事前にコンパイルされた `Script`
オブジェクトのメソッドです。
`script.runInNewContext()` は、`sandbox` が与えられればそれをコンテキスト化し、
または省略された場合は新しいコンテキスト化されたサンドボックスを作成し、
サンドボックスをグローバルオブジェクトとして `script` のコンパイルされたコードを
実行し、その結果を返します。
実行されるコードはローカルスコープにアクセスしません。

<!--
`script.runInNewContext` takes the same options as `script.runInThisContext`.
-->

`script.runInNewContext()` は `script.runInThisContext()` と同じオプションを
受け取ります。

<!--
Example: compile code that sets a global variable, then execute the code
multiple times in different contexts. These globals are set on and contained in
the sandboxes.
-->

例: グローバル変数を設定するコードをコンパイルし、異なったコンテキストで
複数回実行します。それらのグローバルはそれぞれのサンドボックスに設定されます。

    var util = require('util');
    var vm = require('vm');

    var sandboxes = [{}, {}, {}];

    var script = new vm.Script('globalVar = "set"');

    sandboxes.forEach(function (sandbox) {
      script.runInNewContext(sandbox);
    });

    console.log(util.inspect(sandboxes));

    // [{ globalVar: 'set' }, { globalVar: 'set' }, { globalVar: 'set' }]

<!--
Note that running untrusted code is a tricky business requiring great care.
`script.runInNewContext` is quite useful, but safely running untrusted code
requires a separate process.
-->

信頼できないコードの実行は、細心の注意が求められることに注意してください。
`script.runInNewContext()` は有用ですが、信頼できないコードを安全に実行するには
別のプロセスが必要となります。
