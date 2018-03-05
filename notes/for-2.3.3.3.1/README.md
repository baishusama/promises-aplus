# Note

## 说明

### `1-a-thenable-that-fulfills-but-then-throws.js`

相关解释如图：

![笔记 @GoodNotes](http://ohz4k75du.bkt.clouddn.com/markdown/1520169755407.png)

### `2-an-object-with-a-throwing-then-accessor.js`

本测试由于在获取 `newValue` 的 `then` 方法的时候报错，故测试未通过。

解决方法是（如规范所说）用 `try-catch` 块包裹获取 `then` 方法的代码，来做异常处理。

### `3-a-thenable-that-tries-to-fulfill-twice.js`

本测试由于 `then.call(newValue, resolve, reject)` 中的 thenable 对象的 `then` 方法尝试调用 `onFulfilled` 方法两次，第一个 `onFulfilled` 由于异步尚未结束，被同步的第二个 `onFulfilled` 抢先了，故测试未通过：

```javascript
var yFactory = function () {
    return {
        then: function (onFulfilled) {
            // 第一个（注意内部存在 setTimeout）
            onFulfilled({
                then: function (onFulfilled) {
                    setTimeout(function () {
                        onFulfilled(sentinel);
                    }, 0);
                }
            });
            // 第二个（同步的）
            onFulfilled(other);
        }
    };
};
```

#### 思路一：确保词法作用域顺序 => 无解

我一开始想到的思路是，要确保两个 `onFulfilled` 在词法作用域中顺序（只有第一个完全执行完毕才去有可能去执行下一个）。

但是除了词法作用域之外，没有得知两个 `onFulfilled` 顺序的可能。规范中明确规定不能指定 `onFulfilled` 的 `this`，所以通过 `this` 的方式不用考虑了，何况 `this` 和词法作用域也没有毛线关系。

暂时没有想到解法。

#### 思路二：确保同一个 thenable 的 `onFulfilled/onRejected` 最多被调用一次

根据这个思路，我的做法是在 thenable 上暗搓搓自定义了一个 `isImoPromiseEndState` 的 flag 属性来判断当前 `onFulfilled` 对应的 thenable 是否已经调用过回调函数了，以避免多次调用。（`onFulfilled` 和 thenable 之间的对应关系通过词法作用域确定。）

这个做法是可行的，但在这个做法中，由于 thenable 多了一个 `isImoPromiseEndState` 可能会带来副作用----可能影响 thenable 的其他行为。

暂时没有想到更好的做法。

#### 思路其他

暂时没有想到。
