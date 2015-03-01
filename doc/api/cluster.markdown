# Cluster

    Stability: 2 - Unstable

<!--
A single instance of io.js runs in a single thread. To take advantage of
multi-core systems the user will sometimes want to launch a cluster of io.js
processes to handle the load.
-->

一つの io.js インスタンスは一つのスレッドで実行されます。
マルチコアシステムのメリットを生かすために、
ユーザは時々 io.js プロセスのクラスを起動して負荷を分散したくなります。

<!--
The cluster module allows you to easily create child processes that
all share server ports.
-->

クラスタモジュールは、サーバポートを共有する複数の子プロセスを簡単に
構築することを可能にします。

    var cluster = require('cluster');
    var http = require('http');
    var numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
      });
    } else {
      // Workers can share any TCP connection
      // In this case its a HTTP server
      http.createServer(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
      }).listen(8000);
    }

<!--
Running io.js will now share port 8000 between the workers:
-->

io.js は 8000 番ポートをワーカ間で共有します。

    % NODE_DEBUG=cluster iojs server.js
    23521,Master Worker 23524 online
    23521,Master Worker 23526 online
    23521,Master Worker 23523 online
    23521,Master Worker 23528 online

<!--
This feature was introduced recently, and may change in future versions.
Please try it out and provide feedback.
-->

この機能は最近導入されたばかりであり、
将来のバージョンで変更される可能性があります。
これを試して、フィードバックを行ってください。

<!--
Also note that, on Windows, it is not yet possible to set up a named pipe
server in a worker.
-->

Windows では、ワーカが名前付きパイプによるサーバをセットアップすることは
まだできないことにも注意してください。

## How It Works

<!--type=misc-->

<!--
The worker processes are spawned using the `child_process.fork` method,
so that they can communicate with the parent via IPC and pass server
handles back and forth.
-->

ワーカプロセスは `child_process.fork` メソッドを使って起動されるため、
親プロセスと IPC で通信したり、サーバハンドルをやり取りしたりすることが
できます。

<!--
The cluster module supports two methods of distributing incoming
connections.
-->

クラスタモジュールは到着する接続を分散する方法を二種類提供します。

<!--
The first one (and the default one on all platforms except Windows),
is the round-robin approach, where the master process listens on a
port, accepts new connections and distributes them across the workers
in a round-robin fashion, with some built-in smarts to avoid
overloading a worker process.
-->

一つ目 (Windows 以外の全てのプラットフォームでデフォルト)
はラウンドロビン方式で、マスタプロセスがポートをリッスンし、
新しい接続を受け付けるとラウンドロビン方式でワーカに分散します
(ワーカの過負荷を避ける工夫が組み込まれています)。

<!--
The second approach is where the master process creates the listen
socket and sends it to interested workers. The workers then accept
incoming connections directly.
-->

二つ目の方法は、マスタプロセスがリスニングソケットを作成し、
ワーカに送信します。ワーカは到着する接続を直接受け付けます。

<!--
The second approach should, in theory, give the best performance.
In practice however, distribution tends to be very unbalanced due
to operating system scheduler vagaries. Loads have been observed
where over 70% of all connections ended up in just two processes,
out of a total of eight.
-->

二つ目の方法は、原則的には、ベストなパフォーマンスであるべきです。
しかし実際には、OS の予測不可能なスケジューラにより、
非常に不均衡に分散される傾向があります。
全 8 プロセス中の 2 プロセスに 70% 以上の接続が割り当てられたことも
観測されました。

<!--
Because `server.listen()` hands off most of the work to the master
process, there are three cases where the behavior between a normal
io.js process and a cluster worker differs:
-->

`server.listen()` は仕事の大部分をマスタプロセスに渡すため、
通常の io.js プロセスとクラスタのワーカプロセスの間には
振る舞いが異なるケースが 3 つあります。

<!--
1. `server.listen({fd: 7})` Because the message is passed to the master,
   file descriptor 7 **in the parent** will be listened on, and the
   handle passed to the worker, rather than listening to the worker's
   idea of what the number 7 file descriptor references.
2. `server.listen(handle)` Listening on handles explicitly will cause
   the worker to use the supplied handle, rather than talk to the master
   process.  If the worker already has the handle, then it's presumed
   that you know what you are doing.
3. `server.listen(0)` Normally, this will cause servers to listen on a
   random port.  However, in a cluster, each worker will receive the
   same "random" port each time they do `listen(0)`.  In essence, the
   port is random the first time, but predictable thereafter.  If you
   want to listen on a unique port, generate a port number based on the
   cluster worker ID.
-->

1. `server.listen({fd: 7})` メッセージはマスタに渡されてるため、
   ワーカのファイル記述子 7 が参照するものではなく、
   **親プロセスの** ファイル記述子 7 がリスニングされてそのハンドルがワーカに
   渡されます。
2. `server.listen(handle)` 明示的なハンドルをリスニングするとマスタプロセスは
   関与することなく、ワーカは与えられたハンドルを使うことになります。
   ワーカがすでにハンドルを持っているなら、何をしようとしているか
   あなたは分かっているでしょう。
3. `'server.listen(0)` 通常、これはサーバがランダムなポートをリッスンすることを
   意味します。しかしながらクラスタでは、各ワーカは `listen(0)` によって
   同じ "ランダムな" ポートを受信します。
   すなわち、初回はポートはランダムになりますが、その後はそうではありません。
   もしユニークなポートをリッスンしたければ、クラスタのワーカ ID に基づいて
   ポート番号を生成してください。

<!--
There is no routing logic in io.js, or in your program, and no shared
state between the workers.  Therefore, it is important to design your
program such that it does not rely too heavily on in-memory data objects
for things like sessions and login.
-->

io.js にもあなたのプログラムにも、ルーティングのためのロジックや
ワーカ間で共有される状態はありません。
したがって、あなたのプログラムがセッションやログインのためにメモリ内の
データオブジェクトに過度に頼らないように設計することが重要です。

<!--
Because workers are all separate processes, they can be killed or
re-spawned depending on your program's needs, without affecting other
workers.  As long as there are some workers still alive, the server will
continue to accept connections.  io.js does not automatically manage the
number of workers for you, however.  It is your responsibility to manage
the worker pool for your application's needs.
-->

全てのワーカは独立したプロセスなので、他のワーカに影響を与えることなく
プログラムのニーズに応じてそれらを殺したり再起動したりすることができます。
いくつかのワーカが生きている限り、サーバは接続を受け付け続けます。
しかしながら、io.js はワーカの数を自動的に管理することはありません。
アプリケーションのニーズに応じてワーカのプールを管理することは、
あなたの責務です。

## cluster.schedulingPolicy

<!--
The scheduling policy, either `cluster.SCHED_RR` for round-robin or
`cluster.SCHED_NONE` to leave it to the operating system. This is a
global setting and effectively frozen once you spawn the first worker
or call `cluster.setupMaster()`, whatever comes first.
-->

スケジューリングポリシーは、ラウンドロビンの `cluster.SCHED_RR` または、
OS に任せる `cluster.SCHED_NONE` のどちらかです。
これはグローバルな設定で、その効果は最初のワーカを起動する時か、
`cluster.setupMaster()` を呼び出した時、どちらかが最初に行われた時点で
凍結されます。

<!--
`SCHED_RR` is the default on all operating systems except Windows.
Windows will change to `SCHED_RR` once libuv is able to effectively
distribute IOCP handles without incurring a large performance hit.
-->

`SCHED_RR` は Windows 以外の全ての OS でデフォルトです。
Windows では、libuv が大きなパフォーマンス低下を招くことなく
IOCP ハンドルを分散することが可能であれば、`SCHED_RR` に切り替わります。

<!--
`cluster.schedulingPolicy` can also be set through the
`NODE_CLUSTER_SCHED_POLICY` environment variable. Valid
values are `"rr"` and `"none"`.
-->

`cluster.schedulingPolicy` は、`NODE_CLUSTER_SCHED_POLICY` 環境変数を
通じて設定することもできます。適切な値は `"rr"` または `"none"` です。

## cluster.settings

<!--
* {Object}
  * `execArgv` {Array} list of string arguments passed to the io.js executable.
    (Default=`process.execArgv`)
  * `exec` {String} file path to worker file.  (Default=`process.argv[1]`)
  * `args` {Array} string arguments passed to worker.
    (Default=`process.argv.slice(2)`)
  * `silent` {Boolean} whether or not to send output to parent's stdio.
    (Default=`false`)
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
-->

* {Object}
  * `execArgv` {Array} node 実行ファイルに渡される引数を表す、文字列の配列
    (デフォルトは `process.execArgv`)。
  * `exec` {String} ワーカで実行するファイルへのパス
    (デフォルトは `process.argv[1]`)。
  * `args` {Array} ワーカに渡される引数となる文字列
    (デフォルトは `process.argv.slice(2)`)。
  * `silent` {Boolean} 出力を親プロセスに送るかどうか
    (デフォルトは `false`)。
  * `uid` {Number} このプロセスのユーザ識別子を設定します
     (setuid(2) を参照)。
  * `gid` {Number} このプロセスのグループ識別子を設定します
    (setgid(2) を参照)。

<!--
After calling `.setupMaster()` (or `.fork()`) this settings object will contain
the settings, including the default values.
-->

`.setupMaster()` (または `.fork()`) が呼び出された後、この `settings`
オブジェクトはデフォルト値を含む設定オブジェクトを持ちます。

<!--
It is effectively frozen after being set, because `.setupMaster()` can
only be called once.
-->

`.setupMaster()` は一度しか呼び出せないため、それは設定された後で事実上
凍結されます。

<!--
This object is not supposed to be changed or set manually, by you.
-->

このオブジェクトはあなたによって変更されることを想定していません。

## cluster.isMaster

* {Boolean}

<!--
True if the process is a master. This is determined
by the `process.env.NODE_UNIQUE_ID`. If `process.env.NODE_UNIQUE_ID` is
undefined, then `isMaster` is `true`.
-->

現在のプロセスがマスタの場合は `true` です。
これは `process.env.NODE_UNIQUE_ID` から決定されます。
`process.env.NODE_UNIQUE_ID` が未定義だと `isMaster` は `true` になります。

## cluster.isWorker

* {Boolean}

<!--
True if the process is not a master (it is the negation of `cluster.isMaster`).
-->

このプロセスがマスタでなければ `true` (これは `cluster.isMaster` の否定です)。

## Event: 'fork'

* `worker` {Worker object}

<!--
When a new worker is forked the cluster module will emit a 'fork' event.
This can be used to log worker activity, and create your own timeout.
-->

新しいワーカがフォークされると、クラスタモジュールは `'fork'` イベントを
生成します。
これはワーカの活動をロギングしたり、タイムアウトのために使うことができます。

    var timeouts = [];
    function errorMsg() {
      console.error("Something must be wrong with the connection ...");
    }

    cluster.on('fork', function(worker) {
      timeouts[worker.id] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', function(worker, address) {
      clearTimeout(timeouts[worker.id]);
    });
    cluster.on('exit', function(worker, code, signal) {
      clearTimeout(timeouts[worker.id]);
      errorMsg();
    });

## Event: 'online'

* `worker` {Worker object}

<!--
After forking a new worker, the worker should respond with an online message.
When the master receives an online message it will emit this event.
The difference between 'fork' and 'online' is that fork is emitted when the
master forks a worker, and 'online' is emitted when the worker is running.
-->

新しいワーカをフォークした後、ワーカはオンラインメッセージを応答します。
マスタがオンラインメッセージを受信すると、このイベントが生成されます。
`'fork'` と `'online'` の違いは、`'fork'` はマスタがワーカをフォークした時点で
生成されるのに対し、`'online'` はワーカが実行されてから生成される点です。

    cluster.on('online', function(worker) {
      console.log("Yay, the worker responded after it was forked");
    });

## Event: 'listening'

* `worker` {Worker object}
* `address` {Object}

<!--
After calling `listen()` from a worker, when the 'listening' event is emitted on
the server, a listening event will also be emitted on `cluster` in the master.
-->

ワーカが `net.Server.listen()` を呼び出した後、(net や http などの) サーバでは
`'listening'` イベントが生成され、マスタの `cluster` でも `'listening'`
イベントが生成されます。

<!--
The event handler is executed with two arguments, the `worker` contains the worker
object and the `address` object contains the following connection properties:
`address`, `port` and `addressType`. This is very useful if the worker is listening
on more than one address.
-->

イベントハンドラは二つの引数を伴って実行されます。
`worker` はワーカオブジェクトを、`address` オブジェクトは
以下の接続プロパティを含みます:
`address`、`prot`、そして `addressType` です。
これはワーカが複数のアドレスをリッスンしている場合にとても便利です。

    cluster.on('listening', function(worker, address) {
      console.log("A worker is now connected to " + address.address + ":" + address.port);
    });

<!--
The `addressType` is one of:
-->

`addressType` は以下のいずれかです:

<!--
* `4` (TCPv4)
* `6` (TCPv6)
* `-1` (unix domain socket)
* `"udp4"` or `"udp6"` (UDP v4 or v6)
-->

* `4` (TCPv4)
* `6` (TCPv6)
* `-1` (unix ドメインソケット)
* `"udp4"` または `"udp6"` (UDP v4 または v6)

## Event: 'disconnect'

* `worker` {Worker object}

<!--
Emitted after the worker IPC channel has disconnected. This can occur when a
worker exits gracefully, is killed, or is disconnected manually (such as with
worker.disconnect()).
-->

ワーカとの IPC チャネルが切断された後で生成されます。
それはワーカが自然に終了したり、殺されたり、あるいは (`worker.disconnect()`
により) 手動で切断された場合に発生します。

<!--
There may be a delay between the `disconnect` and `exit` events.  These events
can be used to detect if the process is stuck in a cleanup or if there are
long-living connections.
-->

`'disconnect'` と `'exit'` の間には遅延があるかもしれません。
このイベントはプロセスがクリーンナップで行き詰まったり、長時間生きている接続が
ないかを検出することに使用できます。

    cluster.on('disconnect', function(worker) {
      console.log('The worker #' + worker.id + ' has disconnected');
    });

## Event: 'exit'

<!--
* `worker` {Worker object}
* `code` {Number} the exit code, if it exited normally.
* `signal` {String} the name of the signal (eg. `'SIGHUP'`) that caused
  the process to be killed.
-->

* `worker` {Worker object}
* `code` {Number} 正常に終了した場合は終了コード。
* `signal` {String} プロセスが殺される原因となったシグナルの名前
  (例: `'SIGHUP'`)。

<!--
When any of the workers die the cluster module will emit the 'exit' event.
-->

どのワーカが死んだ場合でも、クラスタモジュールは `'exit'` イベントを
生成します。

<!--
This can be used to restart the worker by calling `.fork()` again.
-->

これは `.fork()` を呼び出してワーカを再開する場合に使用することができます。

    cluster.on('exit', function(worker, code, signal) {
      console.log('worker %d died (%s). restarting...',
        worker.process.pid, signal || code);
      cluster.fork();
    });

See [child_process event: 'exit'](child_process.html#child_process_event_exit).

## Event: 'setup'

* `settings` {Object}

<!--
Emitted every time `.setupMaster()` is called.
-->

`setupMaster()` は呼ばれた時に毎回生成されます。

<!--
The `settings` object is the `cluster.settings` object at the time
`.setupMaster()` was called and is advisory only, since multiple calls to
`.setupMaster()` can be made in a single tick.
-->

`settings` オブジェクトは同時に `cluster.settings` オブジェクトでもあります
`.setupMaster()` は呼び出されると報告するだけで、複数回の呼び出し以降
`.setupMaster()` は単一のイベントループで実行することが出来ます。

<!--
If accuracy is important, use `cluster.settings`.
-->

精度が重要な場合は、`cluster.settings`を使用します。

## cluster.setupMaster([settings])

<!--
* `settings` {Object}
  * `exec` {String} file path to worker file.  (Default=`process.argv[1]`)
  * `args` {Array} string arguments passed to worker.
    (Default=`process.argv.slice(2)`)
  * `silent` {Boolean} whether or not to send output to parent's stdio.
    (Default=`false`)
-->

* `settings` {Object}
  * `exec` {String} ワーカで実行するファイルへのパス.
    (デフォルトは `process.argv[1]`)
  * `args` {Array} ワーカに渡される引数となる文字列。
    (デフォルトは `process.argv.slice(2)`)
  * `silent` {Boolean} 出力を親プロセスに送るかどうか。
    (デフォルトは `false`)

<!--
`setupMaster` is used to change the default 'fork' behavior. Once called,
the settings will be present in `cluster.settings`.
-->

`setupMaster()` は 'fork' のデフォルト動作を変更するために使われます。
一度呼び出されると、その設定は `cluster.settings` に反映されます。

<!--
Note that:
-->

注意事項:

<!--
* any settings changes only affect future calls to `.fork()` and have no
  effect on workers that are already running
* The *only* attribute of a worker that cannot be set via `.setupMaster()` is
  the `env` passed to `.fork()`
* the defaults above apply to the first call only, the defaults for later
  calls is the current value at the time of `cluster.setupMaster()` is called
-->

* すべての設定変更は将来の `.fork()` の呼び出し時にのみ影響を与え、すでに
実行されているワーカには影響を与えません
* ワーカの属性は `.setupMaster()` 経由で設定できず、`.fork()`に渡すことのできる
`env` *だけ* で設定できます。
* 上記のデフォルトは最初の呼び出しだけ適用され、以降の呼び出しのデフォルト
は `cluster.setupMaster()` が呼ばれた時の値です

<!--
Example:
-->

例:

    var cluster = require('cluster');
    cluster.setupMaster({
      exec: 'worker.js',
      args: ['--use', 'https'],
      silent: true
    });
    cluster.fork(); // https worker
    cluster.setupMaster({
      args: ['--use', 'http']
    });
    cluster.fork(); // http worker

<!--
This can only be called from the master process.
-->

これはマスタプロセスからのみ、呼び出すことができます。

## cluster.fork([env])

<!--
* `env` {Object} Key/value pairs to add to worker process environment.
* return {Worker object}
-->

* `env` {Object} ワーカプロセスの環境に加えられるキーと値のペア。
* return {Worker object}

<!--
Spawn a new worker process.
-->

新しいワーカプロセスを起動します。

<!--
This can only be called from the master process.
-->

これはマスタプロセスからのみ呼び出すことができます。

## cluster.disconnect([callback])

<!--
* `callback` {Function} called when all workers are disconnected and handles are
  closed
-->

* `callback` {Function} 全てのワーカが切断し、ハンドルがクローズされると
  呼び出されます。

<!--
Calls `.disconnect()` on each worker in `cluster.workers`.
-->

`cluster.workers` 内の各ワーカに対して `.disconnect()` を呼び出します。

<!--
When they are disconnected all internal handles will be closed, allowing the
master process to die gracefully if no other event is waiting.
-->

ワーカとの接続が切断して内部的なハンドルが全てクローズされると、
他に待機しているイベントがなければ、マスタプロセスは自然に終了します。

<!--
The method takes an optional callback argument which will be called when finished.
-->

このメソッドはオプションの引数としてコールバックを受け取ります。

<!--
This can only be called from the master process.
-->

これはマスタプロセスからのみ呼び出すことができます。

## cluster.worker

* {Object}

<!--
A reference to the current worker object. Not available in the master process.
-->

現在のワーカオブジェクトへの参照です。
マスタプロセスでは利用できません。

    var cluster = require('cluster');

    if (cluster.isMaster) {
      console.log('I am master');
      cluster.fork();
      cluster.fork();
    } else if (cluster.isWorker) {
      console.log('I am worker #' + cluster.worker.id);
    }

## cluster.workers

* {Object}

<!--
A hash that stores the active worker objects, keyed by `id` field. Makes it
easy to loop through all the workers. It is only available in the master
process.
-->

`id` をキーとしてアクティブなワーカオブジェクトを保存しているハッシュです。
これは全てのワーカに対して繰り返しを行うことを容易にします。
マスタプロセスでのみ利用可能です。

<!--
A worker is removed from cluster.workers after the worker has disconnected _and_
exited. The order between these two events cannot be determined in advance.
However, it is guaranteed that the removal from the cluster.workers list happens
before last `'disconnect'` or `'exit'` event is emitted.
-->

ワーカは disconnect し exit した後で `cluster.workers` から削除されます。
これら二つのイベントの順序は、事前に決定することができません。
けれども、それは最後の `'disconnect'` か `'exit'` イベントが生成される前に
`cluster.workers` のリストから削除されることを保証します

    // Go through all workers
    function eachWorker(callback) {
      for (var id in cluster.workers) {
        callback(cluster.workers[id]);
      }
    }
    eachWorker(function(worker) {
      worker.send('big announcement to all workers');
    });

<!--
Should you wish to reference a worker over a communication channel, using
the worker's unique id is the easiest way to find the worker.
-->

通信チャネルを越えてワーカの参照を渡す場合は、
ワーカのユニークな ID を使ってワーカを探すのが簡単です。

    socket.on('data', function(id) {
      var worker = cluster.workers[id];
    });

## Class: Worker

<!--
A Worker object contains all public information and method about a worker.
In the master it can be obtained using `cluster.workers`. In a worker
it can be obtained using `cluster.worker`.
-->

ワーカに関する全ての公開された情報やメソッドを持つオブジェクトです。
マスタでは `cluster.wrokers` から取得することができます。
ワーカでは `cluster.worker` から取得することができます。

### worker.id

* {String}

<!--
Each new worker is given its own unique id, this id is stored in the
`id`.

While a worker is alive, this is the key that indexes it in
cluster.workers
-->

新しいワーカはいずれもユニークな ID を与えられます。
この ID は `id` に保存されます。

ワーカが生きている間、これは `cluseter.workers` のキーとなります。

### worker.process

* {ChildProcess object}

<!--
All workers are created using `child_process.fork()`, the returned object
from this function is stored as `.process`. In a worker, the global `process`
is stored.

-->

全てのワーカは `child_process.fork()` によって作成されます。
その戻り値は `.process` に設定されます。
ワーカでは、グローバルの `process` に設定されます。

<!--
See: [Child Process module](
child_process.html#child_process_child_process_fork_modulepath_args_options)

-->

参照: [Child Process module](
child_process.html#child_process_child_process_fork_modulepath_args_options)

<!--
Note that workers will call `process.exit(0)` if the `'disconnect'` event occurs
on `process` and `.suicide` is not `true`. This protects against accidental
disconnection.
-->

`process` で `'disconnect'` イベントが生成されるとワーカが `process.exit(0)`
を呼び出し、`.suicide` が `true` にならないことに注意してください。
これは偶発的な切断を防ぎます。

### worker.suicide

* {Boolean}

<!--
Set by calling `.kill()` or `.disconnect()`, until then it is `undefined`.

-->

`.kill()` または `.disconnect()` によって設定されます。
それまでは `undefined` です。

<!--
The boolean `worker.suicide` lets you distinguish between voluntary and accidental
exit, the master may choose not to respawn a worker based on this value.
-->

真偽値の `worker.suicide` は、ワーカが自発的に終了したのか偶発的に終了したのかを
区別します。
マスタはこの値に基づいて、ワーカを再起動しないことを選ぶことができます。

    cluster.on('exit', function(worker, code, signal) {
      if (worker.suicide === true) {
        console.log('Oh, it was just suicide\' – no need to worry').
      }
    });

    // kill worker
    worker.kill();

### worker.send(message[, sendHandle])

* `message` {Object}
* `sendHandle` {Handle object}

<!--
This function is equal to the send methods provided by
`child_process.fork()`.  In the master you should use this function to
send a message to a specific worker.
-->

この関数は `child_process.fork()` が返すオブジェクトの `send()`
メソッドと同じです。
マスタは特定のワーカにメッセージを送信するためにこの関数を
使用することができます。

<!--
In a worker you can also use `process.send(message)`, it is the same function.
-->

ワーカでは `process.send(message)` を使うこともできます。
それは同じ関数です。

<!--
This example will echo back all messages from the master:
-->

この例はマスタからのメッセージをエコーバックします。

    if (cluster.isMaster) {
      var worker = cluster.fork();
      worker.send('hi there');

    } else if (cluster.isWorker) {
      process.on('message', function(msg) {
        process.send(msg);
      });
    }

### worker.kill([signal='SIGTERM'])

<!--
* `signal` {String} Name of the kill signal to send to the worker
  process.
-->

* `signal` {String} ワーカプロセスに送られるシグナルの名前です。

<!--
This function will kill the worker. In the master, it does this by disconnecting
the `worker.process`, and once disconnected, killing with `signal`. In the
worker, it does it by disconnecting the channel, and then exiting with code `0`.
-->

この関数はワーカを終了します。
マスタでは、これは `worker.process` と切断することによって行われます。
そして切断されると、`signal` によってワーカを殺します。
ワーカでは、これはチャネルの切断によって行われ、コード `0` で終了します。

<!--
Causes `.suicide` to be set.
-->

`.suicide` が設定される原因となります。

<!--
This method is aliased as `worker.destroy()` for backwards compatibility.
-->

後方互換性のため、このメソッドには `worker.destroy()` という別名があります。

<!--
Note that in a worker, `process.kill()` exists, but it is not this function,
it is [kill](process.html#process_process_kill_pid_signal).
-->

ワーカでは、`process.kill()` は存在するものの、それは関数ではないことに
注意してください。
[kill](process.html#process_process_kill_pid_signal) を参照してください。

### worker.disconnect()

<!--
In a worker, this function will close all servers, wait for the 'close' event on
those servers, and then disconnect the IPC channel.
-->

ワーカでは、この関数は全てのサーバをクローズし、それらのサーバの `'close'`
イベントを待機し、そして IPC チャネルを切断します。

<!--
In the master, an internal message is sent to the worker causing it to call
`.disconnect()` on itself.
-->

マスタでは、ワーカが自分の `.disconnect()` を呼び出すことになる内部メッセージを
ワーカに送ります。

<!--
Causes `.suicide` to be set.
-->

`.suicide` が設定される原因となります。

<!--
Note that after a server is closed, it will no longer accept new connections,
but connections may be accepted by any other listening worker. Existing
connections will be allowed to close as usual. When no more connections exist,
see [server.close()](net.html#net_event_close), the IPC channel to the worker
will close allowing it to die gracefully.
-->

サーバがクローズした後、それはもう新たな接続を受け付けなくなりますが、
他のワーカによって接続は受け付けられることに注意してください。
既存のコネクションは通常通りクローズすることができます。
コネクションが無くなると ([server.close()](net.html#net_event_close) 参照)、
ワーカが自然に終了できるように IPC チャネルはクローズされます。

<!--
The above applies *only* to server connections, client connections are not
automatically closed by workers, and disconnect does not wait for them to close
before exiting.
-->

上記はサーバ側のコネクションにのみ適用されます。
クライアント側のコネクションはワーカによって自動的にクローズされることはなく、
終了する前にそれらがクローズすることを待つこともありません。

<!--
Note that in a worker, `process.disconnect` exists, but it is not this function,
it is [disconnect](child_process.html#child_process_child_disconnect).
-->

ワーカでは、`process.disconnect` は存在しますが、それはここで説明した関数では
ありません。それは
[disconnect](child_process.html#child_process_child_disconnect) です。

<!--
Because long living server connections may block workers from disconnecting, it
may be useful to send a message, so application specific actions may be taken to
close them. It also may be useful to implement a timeout, killing a worker if
the `disconnect` event has not been emitted after some time.
-->

長時間生きているサーバ側のコネクションはワーカが切断することを妨げるため、
それらをクローズするためにアプリケーション固有のメッセージを送ることは有用です。
加えて、一定の時間が経過しても `'disconnect'` イベントが発生しなかった場合に
ワーカを強制終了する実装も有用です。

    if (cluster.isMaster) {
      var worker = cluster.fork();
      var timeout;

      worker.on('listening', function(address) {
        worker.send('shutdown');
        worker.disconnect();
        timeout = setTimeout(function() {
          worker.kill();
        }, 2000);
      });

      worker.on('disconnect', function() {
        clearTimeout(timeout);
      });

    } else if (cluster.isWorker) {
      var net = require('net');
      var server = net.createServer(function(socket) {
        // connections never end
      });

      server.listen(8000);

      process.on('message', function(msg) {
        if(msg === 'shutdown') {
          // initiate graceful close of any connections to server
        }
      });
    }

### worker.isDead()

<!--
This function returns `true` if the worker's process has terminated (either
because of exiting or being signaled). Otherwise, it returns `false`.
-->

ワーカプロセスが終了している場合、この関数は `true` をを返します (終了して
いるか通知されているかいずれかにより)。それ以外の場合は `false` を返します。

### worker.isConnected()

<!--
This function returns `true` if the worker is connected to its master via its IPC
channel, `false` otherwise. A worker is connected to its master after it's been
created. It is disconnected after the `disconnect` event is emitted.
-->

ワーカが IPC チャネルを経由してマスターに接続している場合、この関数は
`true` を返す。それ以外の場合は `false` を返します。
ワーカは作成された後マスターに接続されます。それは `disconnect` イベント
が生成された後切断されます。

### Event: 'message'

* `message` {Object}

<!--
This event is the same as the one provided by `child_process.fork()`.
-->

このイベントは `child_process.fork()` が提供するものと同じです。

<!--
In a worker you can also use `process.on('message')`.
-->

ワーカでは、`process.on('message')` を使うこともできます。

<!--
As an example, here is a cluster that keeps count of the number of requests
in the master process using the message system:
-->

メッセージシステムを使用してクラスタ全体のリクエスト数を
マスタプロセスで保持する例です:

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {

      // Keep track of http requests
      var numReqs = 0;
      setInterval(function() {
        console.log("numReqs =", numReqs);
      }, 1000);

      // Count requestes
      function messageHandler(msg) {
        if (msg.cmd && msg.cmd == 'notifyRequest') {
          numReqs += 1;
        }
      }

      // Start workers and listen for messages containing notifyRequest
      var numCPUs = require('os').cpus().length;
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].on('message', messageHandler);
      });

    } else {

      // Worker processes have a http server.
      http.Server(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");

        // notify master about the request
        process.send({ cmd: 'notifyRequest' });
      }).listen(8000);
    }

### Event: 'online'

<!--
Similar to the `cluster.on('online')` event, but specific to this worker.
-->

`cluster.on('online')` と同様ですが、このワーカに特化しています。

    cluster.fork().on('online', function() {
      // Worker is online
    });

<!--
It is not emitted in the worker.
-->

このイベントはワーカでは生成されません。

### Event: 'listening'

* `address` {Object}

<!--
Similar to the `cluster.on('listening')` event, but specific to this worker.
-->

`cluster.on('listening')` と同様ですが、このワーカに特化しています。

    cluster.fork().on('listening', function(address) {
      // Worker is listening
    });

<!--
It is not emitted in the worker.
-->

このイベントはワーカでは生成されません。

### Event: 'disconnect'

<!--
Similar to the `cluster.on('disconnect')` event, but specfic to this worker.
-->

`cluster.on('disconnect')` と同様ですが、このワーカに特化しています。

    cluster.fork().on('disconnect', function() {
      // Worker has disconnected
    });

### Event: 'exit'

<!--
* `code` {Number} the exit code, if it exited normally.
* `signal` {String} the name of the signal (eg. `'SIGHUP'`) that caused
  the process to be killed.
-->

* `code` {Number} 正常に終了した場合は終了コード。
* `signal` {String} プロセスが殺される原因となったシグナルの名前
  (例: `'SIGHUP'`)。

<!--
Similar to the `cluster.on('exit')` event, but specific to this worker.

-->

`cluster.on('exit')` と同様ですが、このワーカに特化しています。

    var worker = cluster.fork();
    worker.on('exit', function(code, signal) {
      if( signal ) {
        console.log("worker was killed by signal: "+signal);
      } else if( code !== 0 ) {
        console.log("worker exited with error code: "+code);
      } else {
        console.log("worker success!");
      }
    });

### Event: 'error'

<!--
This event is the same as the one provided by `child_process.fork()`.
-->

このイベントは `child_process.fork()` が提供するものと同じです。

<!--
In a worker you can also use `process.on('error')`.
-->

ワーカでは `process.on('error')` を使うこともできます。
