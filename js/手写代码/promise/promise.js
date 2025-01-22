// 这里是index.js 的代码修改版，抽离重复代码
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
//import {isPromiseLike } from "./util"
const { isPromiseLike} = require("./util")

// 手写Promise
class MyPromise {
  // 私有属性，防止外部修改该属性的值
  #PromiseState = PENDING;
  #PromiseResult = undefined;
  #callbackHandler = []
  constructor(executor) {
    try {
      // 实例化Promise时必须传入一个执行器函数，该函数接收两个参数 resolve和reject用来改变promise的状态
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error);
    }
  }

  resolve (result) { 
    this.#changeState(FULFILLED,result)
  }

  reject (reason) {
    this.#changeState(REJECTED,reason)
  }

  then (onFulfilled,onRejected) { 
    const promise2 = new MyPromise((resolve,reject) => { 
      this.#callbackHandler.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
      this.#run()
    })
    return promise2
  }

  catch (onRejected) {
    return this.then(undefined, onRejected);
  }
  finally (callBack) {
    return this.then(callBack, callBack)
  }

  static try (fn) { 
    return new MyPromise((resolve, reject) => {
      try {
        resolve(fn());
      } catch (error) {
        reject(error);
      }
    });
  }

  static resolve (value) {
    if (value instanceof MyPromise) {
      console.log("value is Mypromise")
      // 如果参数是 Promise 实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。
      return value
    } else if (isPromiseLike(value)) {
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

  // promise状态改变
  #changeState (state, result) { 
    // 状态只会改变一次，如果已经改变直接返回
    if (this.#PromiseState !== PENDING) {
      return
    }
    this.#PromiseState = state
    this.#PromiseResult = result
    this.#run()
  }

  #runOne (callback, resolve, reject) { 
    this.#runMicroTask(() => { 
      if (typeof callback !== "function") {
        // 回调不是函数，发生穿透
        const settled = this.#PromiseState === FULFILLED ? resolve : reject
        settled(this.#PromiseResult)
      } else {
        // 回调是函数就执行函数
        try {
          const data = callback(this.#PromiseResult)
          // 如果回调函数的返回结果是promise
          if (this.#isPromiseLike(data)) {
            data.then(resolve, reject)
          } else {
            resolve(data)
          }
        } catch (error) {
          reject(error)
        }
      }
    })
  }
  #run () { 
    if (this.#PromiseState === PENDING) {
      return
    }

    while (this.#callbackHandler.length) { 
      // 弹出第一项，执行
      const { onFulfilled, onRejected, resolve, reject } = this.#callbackHandler.shift()
      if (this.#PromiseState === FULFILLED) {
        this.#runOne(onFulfilled,resolve,reject)
      } else if (this.#PromiseState === REJECTED) {
        this.#runOne(onRejected,resolve,reject)
      } else {

      }
    }
  }

  #isPromiseLike (fn) {
    if (fn != null && (typeof fn === "function" || typeof fn === "object") && typeof fn.then === "function") {
      return true
    }
    return false
  }

  #runMicroTask (task) {
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
}


const p = new MyPromise((resolve, reject) => { 
  setTimeout(() => {
    resolve(111)
  }, 3000);
})

p.then(
  //res => {console.log("promise 完成1",res) },
  456,
  err => { console.log("promise 失败1", err) }
).then(data => { 
  console.log('ok', data) // data 为111
})

p.then(
  res => { 
    console.log("promise 完成2", res)
    return "456-2"
   },
  err => { console.log("promise 失败2", err) }
).then(data => {
  console.log('ok', data) // data 为111
})

p.then(
  res => { console.log("promise 完成3", res) },
  err => { console.log("promise 失败3", err) }
)

p.then(
  res => { console.log("promise 完成4", res) },
  err => { console.log("promise 失败4", err) }
)

function f1 () { 
  return Promise.reject("hah")
}


async function mian () { 
  try {
    await f1()
  } catch (error) {
    console.log("异常",error)
  }
}

//mian()

function mayBeSyncOrAsync () {
  if (Math.random() > 0.5) {
    return 'Sync value';
  } else {
    return Promise.resolve('Async value');
  }
}

MyPromise.try(() => mayBeSyncOrAsync())
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
