/* Promise Class */
function Promise(fn) {
    var state = 'pending';
    var value;
    var reason;
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
            case 'rejected':
                fail && fail(reason);
                break;
        }
        return this; // 返回 promise 对象：以支持链式调用
    };

    this.resolve = function (newValue) {
        // console.log('## In resolve, this is ', this);
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        if (state === 'pending') {
            state = "fulfilled";
            value = newValue;
            setTimeout(function () {
                for (var i = 0, L = doneList.length; i < L; i++) {
                    if(doneList[i] && typeof doneList[i] === "function") {
                        var tmp = doneList[i](value);
                        if (tmp instanceof Promise) {
                            // Another Promise
                            console.log('...rest `done`s to append to another Promise ', doneList.slice(i + 1));
                            for (var j = i + 1; j < L; j++) {
                                tmp.then(doneList[j], failList[j]);
                            }
                            break;
                        } else {
                            value = tmp; // done.call(null, value);
                        }
                    }
                }
            }, 0);
        }
    };

    this.reject = function (err) {
        if (state === 'pending') {
            state = "rejected";
            reason = err;
            setTimeout(function () {
                for (var i = 0, L = failList.length; i < L; i++) {
                    if(failList[i] && typeof failList[i] === "function") {
                        var tmp = failList[i](err);
                        if (tmp instanceof Promise) {
                            for (var j = i + 1; j < L; j++) {
                                tmp.then(doneList[j], failList[j]);
                            }
                            break;
                        } else {
                            reason = tmp;
                        }
                    }
                }
            }, 0);
        }
    };

    fn(this.resolve, this.reject);
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
var getSomethingElse = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 600, 'emmmmm');
    });
};
var getFin = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 900, 'Good Luck!');
    });
};
// Success case
/*getNameById(0).then(function (name) {
    console.log('Name : ' + name);
    return name;
}, function (err) {
    console.error('Err : ' + err);
}).then(function (sth) {
    console.log('Name again : ' + sth)
}).then(function (nothing) {
    console.log('Last `then` return nothing : ' + nothing);
}).then(
    getSomethingElse
).then(function (sth) {
    console.log('Sth else : ' + sth);
}).then(
    getFin
).then(function (fin) {
    console.log('Finally : ' + fin);
});*/
// Fail case
getNameById(1).then(function (name) {
    console.log('Name : ' + name);
    return name;
}, function (err) {
    console.error('Err : ' + err);
}).then(function (sth) {
    console.log('Name again : ' + sth)
}).then(function (nothing) {
    console.log('Last `then` return nothing : ' + nothing);
}).then(
    getSomethingElse
).then(function (sth) {
    console.log('Sth else : ' + sth);
}).then(
    getFin
).then(function (fin) {
    console.log('Finally : ' + fin);
});

/* NodeJS's exports */
module.exports = Promise;