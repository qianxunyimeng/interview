# Vue2知识点汇总

## 1. vue2 内部是如何监听数组变化的

Vue2.x 中实现检测数组变化的方法，是将数组的常用方法(push,pop,shift,unshift,splice,sort,reverse)进行了重写。Vue 将 data 中的数组进行了原型链重写，指向了自己定义的数组原型方法。这样当调用数组 api 时，可以通知依赖更新。如果数组中包含着引用类型，会对数组中的引用类型再次递归遍历进行监控。这样就实现了监测数组变化。

```js

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]


methodsToPatch.forEach(function (method) {
  // 缓存原来的方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

def源码
```js
/**
 * Define a property.
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

// var data = {}
// data.id = 999 === def(data, 'id', 999); // 类似于


```

1. 先获取原生 Array 的原型方法，因为拦截后还是需要原生的方法帮我们实现数组的变化。
2. 对 Array 的原型方法使用 Object.defineProperty 做一些拦截操作
3. 把需要被拦截的 Array 类型的数据原型指向改造后原型

```js
constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
```

### $set为啥能检测数组变动

```js
function set (target, key, val) {
  //... 
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  //... 
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}
```

1. 如果target是一个数组且索引有效，就设置length的属性。
2. 通过splice方法把value设置到target数组指定位置。
3. 设置的时候，vue会拦截到target发生变化，然后把新增的value也变成响应式
4. 最后返回value

这就是vue重写数组方法的原因，利用数组这些方法触发使得每一项的value都是响应式的。
