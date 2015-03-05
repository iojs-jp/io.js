# Timers

    Stability: 5 - Locked

<!--
All of the timer functions are globals.  You do not need to `require()`
this module in order to use them.
-->

すべてのtimer関数はグローバル空間上に存在しているため、使用する際に `require()` する必要はありません。

## setTimeout(callback, delay[, arg][, ...])

<!--
To schedule execution of a one-time `callback` after `delay` milliseconds. Returns a
`timeoutObject` for possible use with `clearTimeout()`. Optionally you can
also pass arguments to the callback.
-->

`delay` ミリ秒が経過した後で `callback` が実行されるようにスケジュールします。
`clearTimeout()` で使うことができる `TimeoutObject` を返します。
オプションとして、コールバックへの引数を渡すこともできます

<!--
It is important to note that your callback will probably not be called in exactly
`delay` milliseconds - io.js makes no guarantees about the exact timing of when
the callback will fire, nor of the ordering things will fire in. The callback will
be called as close as possible to the time specified.
-->

重要なこととして、渡されたコールバックは指定した `delay`パラメータのミリ秒の通りに実行されないかもしれないということがあります。
コールバックがいつ実行されるか、またどの順番で実行されるかに関して、io.jsはなにも保証しません。コールバックは指定された時間に出来るだけ近い時間で実行されます。

## clearTimeout(timeoutObject)

<!--
Prevents a timeout from triggering.
-->

`setTimeout()` に渡した関数が呼び出されることを中止します。

## setInterval(callback, delay[, arg][, ...])

<!--
To schedule the repeated execution of `callback` every `delay` milliseconds.
Returns a `intervalObject` for possible use with `clearInterval()`. Optionally
you can also pass arguments to the callback.
-->

`delay` ミリ秒が経過するごとに繰り返し `callback` が実行されるようにスケジュールします。
`clearInterval()` で使うことができる `intervalObject` を返します。
オプションとして、コールバックへの引数を渡すこともできます。

## clearInterval(intervalObject)

<!--
Stops an interval from triggering.
-->

`setInterval()` に渡した関数が呼び出されることを中止します。

## unref()

<!--
The opaque value returned by `setTimeout` and `setInterval` also has the method
`timer.unref()` which will allow you to create a timer that is active but if
it is the only item left in the event loop won't keep the program running.
If the timer is already `unref`d calling `unref` again will have no effect.
-->

`setTimeout` と `setInterval`から返される不透明な値は アクティブであるにもかかわらず、それがイベントループの最後の一つになっても プログラムの実行を継続しないタイマを作ることを可能にする、
`timer.unref()` メソッドを持っています。 既に `unref` されたタイマで再び `unref` が呼び出されても影響はありません。

<!--
In the case of `setTimeout` when you `unref` you create a separate timer that
will wakeup the event loop, creating too many of these may adversely effect
event loop performance -- use wisely.
-->

`setTimeout()` が `unref` された場合、イベントループを起こすために独立したタイマが作成されるため、それらがあまりに多く作成されるとイベントループの パフォーマンスに悪影響を与えます -- 慎重に使って下さい。

## ref()

<!--
If you had previously `unref()`d a timer you can call `ref()` to explicitly
request the timer hold the program open. If the timer is already `ref`d calling
`ref` again will have no effect.
-->

以前に unref されたタイマは、明示的に ref() を呼び出すことで プログラムを実行したままにするよう要求することができます。 既に ref されたタイマで再び ref が呼び出されても影響はありません。

## setImmediate(callback[, arg][, ...])

<!--
To schedule the "immediate" execution of `callback` after I/O events
callbacks and before `setTimeout` and `setInterval` . Returns an
`immediateObject` for possible use with `clearImmediate()`. Optionally you
can also pass arguments to the callback.
-->

callback を「即時」 (I/O イベントのコールバックより後、setTimeout および setInterval よりも前) に実行するようスケジュールします。 clearImmediate() に渡すことのできる immediatedId を返します。 オプションとして、コールバックへの引数を渡すことができます。

<!--
Callbacks for immediates are queued in the order in which they were created.
The entire callback queue is processed every event loop iteration. If you queue
an immediate from inside an executing callback, that immediate won't fire
until the next event loop iteration.
-->

複数の `setImmediate()` が実行されるとき、それらに渡されたコールバックは作成された順番に実行されます。
全てのコールバックキューはイベントループのイテレーションごとに処理されます。もしコールバック内で `setImmediate()` を実行した場合、
それは次のイベントループのイテレーションまで実行されません。

## clearImmediate(immediateObject)

<!--
Stops an immediate from triggering.
-->

`setImmediate()` に渡した関数が呼び出されることを中止します。

