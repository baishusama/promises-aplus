# Note

## 说明

在 `Promise` 的 `then` 方法内部有一个 `var that = new Promise(()=>{ // 尝试引用 that });` 。

根据 `console.log` 输出的信息，我们知道 `that` 的值为 `undefined` 。

原因其实很简单，`that` 在被初始化之前被打印了，所以没有值。

更具体地讲，因为 `new Promise` 内部会调用参数函数来初始化实例（内部会打印 `that`），此时 `new Promise` 还未返回值， `that` 也就还未初始化，即打印的是一个 `undefined` 。

## 执行和查看结果

该测试脚本，可以通过 `node promises-with-test.js` 来在命令行调用，也可以复制粘贴到浏览器的控制台调用。