/* Promise Class */
function Promise(fn) {
    var state = 'pending';
    var value;
    var doneList = [];
    var failList = [];

    this.then = function (done, fail) {
        switch (state) {
            case 'pending':
                doneList.push(done);
                failList.push(fail);
                break;
            case 'fulfilled':
                done(value);
                break;
        }
        return this; // 返回 promise 对象：以支持链式调用
    };

    function resolve(newValue) {
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        value = newValue;
        setTimeout(function () {
            doneList.forEach(function (done) {
                value = done(value); // done.call(null, value);
            });
        }, 0);
    }

    function reject(err) {
        failList.forEach(function (fail) {
            fail(err);
        });
    }

    fn(resolve, reject);
}

/* Local Test */
var getNameById = function (id) {
    var fakeData = {
        0: 'imo'
    };
    return new Promise(function (resolve, reject) {
        if (id in fakeData) {
            setTimeout(resolve, 300, fakeData[id]);
        } else {
            setTimeout(reject, 300, '404');
        }
    });
};
getNameById(0).then(function (name) {
    console.log('name : ' + name);
}, function (err) {
    console.error('Err : ' + err);
}).then(function (what) {
    console.log('what ? ' + what);
});

/* NodeJS's exports */
module.exports = Promise;