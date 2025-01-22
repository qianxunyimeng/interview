const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class MyPromise {

  // 私有属性，防止外部修改该属性的值
  #PromiseState = PENDING;
  #PromiseResult = undefined;
  #onFulfilledCallbacks = []; // 保存成功时的回调函数
  #onRejectedCallbacks = []; // 保存失败时的回调函数
  constructor(executor) {
    try {
      // 实例化Promise时必须传入一个执行器函数，该函数接收两个参数 resolve和reject用来改变promise的状态
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error);
    }
  }

  resolve (result) {
    if (this.#PromiseState !== PENDING) return;
    this.#PromiseState = FULFILLED;
    this.#PromiseResult = result;
    /**
     * 在执行resolve或者reject的时候，遍历自身的callbacks数组，
     * 看看数组里面有没有then那边 保留 过来的 待执行函数，
     * 然后逐个执行数组里面的函数，执行的时候会传入相应的参数
     */
    this.#onFulfilledCallbacks.forEach(callback => {
      callback(result)
    })

  }

  reject (reason) {
    if (this.#PromiseState !== PENDING) return;
    this.#PromiseState = REJECTED;
    this.#PromiseResult = reason;
    this.#onRejectedCallbacks.forEach(callback => {
      callback(reason)
    })
  }

  /**
   * [注册fulfilled状态/rejected状态对应的回调函数] 
   * @param {function} onFulfilled  fulfilled状态时 执行的函数
   * @param {function} onRejected  rejected状态时 执行的函数 
   * @returns {function} newPromsie  返回一个新的promise对象
   */
  then (onFulfilled, onRejected) {
    // 2.2.7规范 then 方法必须返回一个 promise 对象
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.#PromiseState === FULFILLED) {
        // 2.2.4规范 onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用
        // 这里采用微任务队列的方式
        runMicroTask(() => {
          try {
            if (typeof onFulfilled !== 'function') {
              // 2.2.7.3规范 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
              resolve(this.#PromiseResult);
            } else {
              // 2.2.7.1规范 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x)，即运行resolvePromise()
              let x = onFulfilled(this.#PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (e) {
            // 2.2.7.2规范 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
            reject(e);
          }
        })
      } else if (this.#PromiseState === REJECTED) {
        runMicroTask(() => {
          try {
            if (typeof onRejected !== 'function') {
              // 2.2.7.4规范 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因
              reject(this.#PromiseResult);
            } else {
              let x = onRejected(this.#PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (e) {
            reject(e);
          }
        })
      } else {
        // pending 状态保存的 onFulfilled() 和 onRejected() 
        this.#onFulfilledCallbacks.push(() => {
          runMicroTask(() => {
            try {
              if (typeof onFulfilled !== 'function') {
                resolve(this.#PromiseResult);
              } else {
                let x = onFulfilled(this.#PromiseResult);
                resolvePromise(promise2, x, resolve, reject);
              }
            } catch (e) {
              reject(e);
            }
          })
        });
        this.#onRejectedCallbacks.push(() => {
          runMicroTask(() => {
            try {
              if (typeof onRejected !== 'function') {
                reject(this.#PromiseResult);
              } else {
                let x = onRejected(this.#PromiseResult);
                resolvePromise(promise2, x, resolve, reject);
              }
            } catch (e) {
              reject(e);
            }
          })
        });
      }
    })
    return promise2
  }

  /**
   * Promise.prototype.catch()方法是.then(null, rejection)或.then(undefined, rejection)的别名，用于指定发生错误时的回调函数
   * @param {*} onRejected 发生错误时的回调函数
   * @returns 
   */
  catch (onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * finally() 方法返回一个Promise。在promise结束时，无论结果是fulfilled或者是rejected，都会执行指定的回调函数
   * @param {*} callBack 无论结果是fulfilled或者是rejected，都会执行的回调函数
   * @returns 
   */
  finally (callBack) {
    return this.then(callBack, callBack)
  }

  /**
   * 实现 Promise.resolve()
   * @param {[type]} value 要解析为 Promise 对象的值 
   * @returns 
   */
  static resolve (value) {
    if (value instanceof MyPromise) {
      // 如果参数是 Promise 实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。
      return value
    } else if (value instanceof Object && 'then' in value) {
      // 参数是一个thenable对象,thenable对象指的是具有then方法的对象
      // Promise.resolve()方法会将这个对象转为 Promise 对象，然后就立即执行thenable对象的then()方法。
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject);
      })
    } else {
      // 参数不是具有then()方法的对象，或根本就不是对象
      // 如果参数是一个原始值，或者是一个不具有then()方法的对象，则Promise.resolve()方法返回一个新的 Promise 对象，状态为resolved
      return new MyPromise((resolve) => {
        resolve(value)
      })
    }
  }

  /**
   * Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected
   * @param {*} reason 表示Promise被拒绝的原因
   * @returns 
   */
  static reject (reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  /**
   * - Promise.all 等待所有都完成（或第一个失败）
     - 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
     - 如果参数中包含非 promise 值，这些值将被忽略，但仍然会被放在返回数组中，如果 promise 完成的话 (也就是如果参数里的某值不是Promise，则需要原样返回在数组里)
     - 在任何情况下，Promise.all 返回的 promise 的完成状态的结果都是一个数组，它包含所有的传入迭代参数对象的值（也包括非 promise 值）。
     - 如果传入的 promise 中有一个失败（rejected），Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成
   * @param {*} promises 一个promise的iterable类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static all (promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = []; // 存储结果
        let count = 0; // 计数器
        // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
        if (promises.length === 0) {
          return resolve(promises);
        }

        promises.forEach((item, index) => {
          console.log("index: ", index);
          MyPromise.resolve(item).then(
            value => {
              count++;
              // 每个promise执行的结果存储在result中
              result[index] = value;
              // Promise.all 等待所有都完成（或第一个失败）
              count === promises.length && resolve(result);
            },
            reason => {
              /**
               * 如果传入的 promise 中有一个失败（rejected），
               * Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成
               */
              reject(reason);
            }
          )
        })

      } else {
        // promises 必须是具有 Iterator 接口的对象
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * Promise.allSettled()方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是fulfilled还是rejected），返回的 Promise 对象才会发生状态变更
   * @param {*} promises 一个promise的iterable类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static allSettled (promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = []; // 存储结果
        let count = 0; // 计数器
        // 如果传入的是一个空数组，那么就直接返回一个resolved的空数组promise对象
        if (promises.length === 0) {
          return resolve(promises);
        }
        promises.forEach((item, index) => {
          MyPromise.resolve(item).then(
            value => {
              count++; // 成功计数
              // 对于每个结果对象，都有一个 status 字符串。如果它的值为 fulfilled，则结果对象上存在一个 value 。
              result[index] = {
                status: 'fulfilled',
                value
              }
              // 所有给定的promise都已经fulfilled或rejected后,返回这个promise
              count === promises.length && resolve(result);
            },
            reason => {
              count++; // 失败计数
              /**
                * 对于每个结果对象，都有一个 status 字符串。如果值为 rejected，则存在一个 reason 。
                * value（或 reason ）反映了每个 promise 决议（或拒绝）的值。
                */
              result[index] = {
                status: 'rejected',
                reason
              }
              // 所有给定的promise都已经fulfilled或rejected后,返回这个promise
              count === promises.length && resolve(result);

            }
          )
        })
      } else {
        // promises 必须是具有 Iterator 接口的对象
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * 
   * Promise.any() 接收一个Promise可迭代对象，只要其中的一个 promise 成功，就返回那个已经成功的 promise 。
     如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise 和AggregateError类型的实例，它是 Error 的一个子类，用于把单一的错误集合在一起。
     - 如果传入的参数是一个空的可迭代对象，则返回一个 已失败（already rejected） 状态的 Promise。
     - 如果传入的参数不包含任何 promise，则返回一个 异步完成 （asynchronously resolved）的 Promise。(即将非Promise值，转换为Promise并当做成功)
     - 只要传入的迭代对象中的任何一个 promise 变成成功（resolve）状态，或者其中的所有的 promises 都失败，那么返回的 promise 就会 异步地（当调用栈为空时） 变成成功/失败（resolved/reject）状态。(如果所有Promise都失败，则报错)
     * @param {*} promises 
   */
  static any (promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let errors = []; // 
        let count = 0; // 计数器
        // 如果传入的参数是一个空的可迭代对象，则返回一个 已失败（already rejected） 状态的 Promise。
        if (promises.length === 0) return reject(new AggregateError('All promises were rejected'));
        promises.forEach((item, index) => {
          MyPromise.resolve(item).then(
            value => {
              // 只要其中的一个 promise 成功，就返回那个已经成功的 promise 
              resolve(value);
            },
            reason => {
              count++;
              errors.push(reason);
              /**
               * 如果可迭代对象中没有一个 promise 成功，就返回一个失败的 promise 和AggregateError类型的实例，
               * AggregateError是 Error 的一个子类，用于把单一的错误集合在一起。
               */
              count === promises.length && reject(new AggregateError(errors));

            }
          )
        })

      } else {
        // promises 必须是具有 Iterator 接口的对象
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * romise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。
   * - 如果传的迭代是空的，则返回的 promise 将永远等待
   * @param {*} promises 
   */
  static race (promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        if (promises.length > 0) {
          promises.forEach((item) => {
            /**
              * 如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺，
              * 则 Promise.race 将解析为迭代中找到的第一个值。
              */
            MyPromise.resolve(item).then(resolve, reject)
          })
        }
      } else {
        // promises 必须是具有 Iterator 接口的对象
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  static try (func) {
    if (typeof func !== 'function') {
      return reject(new TypeError('Argument is not a function'))
    }
    return new MyPromise((resolve, reject) => {
      resolve(func())
      //MyPromise.resolve(func()).then(resolve, reject)
    });
  }






}


runMicroTask = (task) => {
  if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
    // node环境
    return process.nextTick(task);
  } else if (typeof queueMicrotask === "function") {
    queueMicrotask(task);
  } else if (typeof MutationObserver === "function") {
    const ob = new MutationObserver(task);
    const textNode = document.createTextNode('1')
    ob.observe(textNode, {
      characterData: true
    })
    textNode.data = '2'
  } else {
    setTimeout(task, 0);
  }
}

/**
 * 对resolve()、reject() 进行改造增强 针对resolve()和reject()中不同值情况 进行处理
 * @param  {promise} promise2 promise1.then方法返回的新的promise对象
 * @param  {[type]} x         promise1.then onFulfilled或onRejected的返回值
 * @param  {[type]} resolve   promise2的resolve方法
 * @param  {[type]} reject    promise2的reject方法
 */
resolvePromise = (promise2, x, resolve, reject) => {
  //console.log(promise2,x);
  // 2.3.1规范 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  if (x === promise2) {
    throw new TypeError('Chaining cycle detected for promise');
  }

  if (x instanceof MyPromise) {
    /**
      * 2.3.2 如果 x 为 Promise ，则使 promise2 接受 x 的状态
      *       也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
      */
    x.then(y => {
      resolvePromise(promise2, y, resolve, reject);
    }, reject)
  } else if (x !== null && ((typeof x === 'object' || (typeof x === 'function')))) {
    // 2.3.3 如果 x 为对象或函数
    try {
      // 2.3.3.1 把 x.then 赋值给 then
      var then = x.then;
    } catch (e) {
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(e);
    }

    /**
     * 2.3.3.3 
     * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
     * 传递两个回调函数作为参数，
     * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
     */
    if (typeof then === 'function') {
      // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      let called = false; // 避免多次调用
      try {
        then.call(x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          // 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        )
      } catch (error) {
        /**
         * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
         */
        if (called) return;
        called = true;
        // 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise
    return resolve(x);
  }
};

isPromiseLike = (value) => {
  return !!(value && typeof value.then === 'function');
}




// MyPromise.deferred = function () {
//   let result = {};
//   result.promise = new MyPromise((resolve, reject) => {
//     result.resolve = resolve;
//     result.reject = reject;
//   });
//   return result;
// }

module.exports = MyPromise;

const f = () => {
  console.log('Function f is executing');
  return 21; // 假设这是一个同步函数，返回一个值  
};

// MyPromise.try(f).then(value => {
//   console.log('Received value:', value); // 输出: Received value: 21  
// });

const asyncF = () => {
  return new MyPromise((resolve) => {
    setTimeout(() => {
      resolve('Async value');
    }, 3000);
  });
};

MyPromise.try(() => asyncF()).then(value => {
  console.log('Received async value:', value); // 一秒后输出: Received async value: Async value  
});

console.log('This will execute before the Promise.try callback');