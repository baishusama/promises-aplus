/* Promise Class */
function Promise(fn) {
    var state = 'pending';
    var value;
    var deferreds = [];

    // 暴露接口供 adapters 封装
    this.resolve = resolve;
    this.reject = reject;

    this.then = function (onFulfilled, onRejected) {
        var notPromiseVariable = '测试词法作用域：成功！';
        /*var anotherIrrelevantPromiseVariable = new Promise(function(resolve, reject){
          console.log('└─ AnotherIrrelevantPromiseVariable initing..');
        });*/
        var that = new Promise(function (resolve, reject) {
            console.log('├─ Promise initing .. notPromiseVariable is', notPromiseVariable);
            console.log('├─ Promise initing .. that is', that);
            console.log('└─ Promise initing .. this is', this);
            handle({
                onFulfilled: onFulfilled,
                onRejected: onRejected,
                resolve: resolve.bind(this),
                reject: reject.bind(this)
            });
        });
        console.log('After initialization that is', that);
        return that;
    };

    function handle(deferred) {
        if (state === 'pending') {
            deferreds.push(deferred);
            return;
        }
        setTimeout(function () { // instead of none -> Test Case: 2.2.4.js Line 68 & 154
            var cb = state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected,
                pass = state === 'fulfilled' ? deferred.resolve : deferred.reject,
                ret;
            if (!(cb && typeof cb === 'function')) {
                pass(value);
                return;
            }
            try {
                ret = cb(value);
                deferred.resolve(ret); // instead of `pass(ret);` -> Test Case: 2.2.6.js Line 191
            } catch (e) {
                deferred.reject(e);
            }
        }, 0);
    }

    function resolve(newValue) {
        // Needs to avoid recursive calls on promise
        if (newValue === this) {
            console.log('---> The value passing into resolve is the current promise !!');
            throw new TypeError('recursive promise');
        }
        if (newValue
            && (typeof newValue === 'object'
                || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
                then.call(newValue, resolve, reject);
                return;
            }
        }
        if (state === 'pending') {
            state = "fulfilled";
            value = newValue;
            afterward(newValue);
        }
    }

    function reject(reason) {
        /*if (reason
            && (typeof reason=== 'object'
                || typeof reason === 'function')) {
            var then = reason.then;
            if (typeof then === 'function') {
                then.call(reason, resolve, reject);
                return;
            }
        }*/
        if (state === 'pending') {
            state = 'rejected';
            value = reason;
            afterward(reason);
        }
    }

    function afterward() {
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        setTimeout(function () {
            deferreds.forEach(function (deferred) {
                handle(deferred);
            });
        }, 0);
    }

    // TODO
    console.log('In constructor, fn init with this :', this);
    fn.call(this, resolve, reject);
}

/* adapter functions */
var resolved = function (value) {
    return new Promise(function (resolve) {
        resolve(value);
    });
};
var rejected = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    });
};
var deferred = function () {
    var promise = new Promise(function (resolve, reject) {
    });
    var fulfill = function (value) {
        promise.resolve(value);
    };
    var reject = function (err) {
        promise.reject(err);
    };
    return {
        promise: promise,
        resolve: fulfill,
        reject: reject
    };
};

/* test case */
console.log('### Test Start ###');
var dummy = {dummy: "dummy"};
var promise = resolved(dummy).then(function () {
    console.log('Inside 1st then, promise is', promise)
    return promise;
});
console.log('#### 第一个 then 结束，第二个 then 开始 ####');
promise.then(null, function (reason) {
//   assert(reason instanceof TypeError);
    console.log('Error :', reason);
    done();
});
