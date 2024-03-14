# 手写源码

## 1.instanceof

object instanceof constructor
用于检测 constructor.prototype 是否存在于参数 object 的原型链上。

要自实现 instanceof，就要了解这些特性：

- object 必须是引用值，否则将会返回 false。
- constructor 必须是函数对象，否则会抛出 TypeError。
  
```js
// 构造函数访问 prototype 属性
constructor.prototype

// 实例对象访问 __proto__ 属性
instance.__proto__
// __proto__ 非 ECMAScript 标准，只是被所有浏览器支持罢了
// 可使用标准中的 Object.getPrototypeOf() 方法替换
```

获取原型对象的方法：

```js
/**
 * inst:实例对象
 * ctor:构造函数
 */
function myInstanceof(inst, ctor) {
  // 是否为函数对象
  const isCallable = val => typeof val === 'function'

  // 是否为引用值
  const isObject = val => typeof val === 'function' || (val !== null && typeof val === 'object')

  // ctor 必须是引用值
  if (!isObject(ctor)) throw new TypeError('ctor必须是引用值')

  // ctor 必须是函数对象
  if (!isCallable(ctor)) throw new TypeError(`ctor必须是函数对象`)

  // inst 为原始值，则返回 false
  if (!isObject(inst)) return false

  do {
    const proto = inst.__proto__ // 可换成标准方法 const proto = Object.getPrototypeOf(inst)
    // 原型链顶端（proto 为 null）或者 inst 通过 Object.create(null) 构造（proto 为 undefined）
    if (proto == null) return false
    if (proto === ctor.prototype) return true
    inst = proto // 往上一级查找
  } while (true)
}
```

## 2. 深度拷贝deepClone

```js
// 利用 WeakMap 解决循环引用
let map = new WeakMap()
function deepClone (obj) {
  if (obj instanceof Object) {
    if (map.has(obj)) {
      return map.get(obj)
    }
    let newObj
    if (obj instanceof Array) {
      newObj = []
    } else if (obj instanceof Function) {
      newObj = function () {
        return obj.apply(this, arguments)
      }
    } else if (obj instanceof RegExp) {
      // 拼接正则
      newobj = new RegExp(obj.source, obj.flags)
    } else if (obj instanceof Date) {
      newobj = new Date(obj)
    } else {
      newObj = {}
    }
    // 克隆一份对象出来
    let desc = Object.getOwnPropertyDescriptors(obj)
    let clone = Object.create(Object.getPrototypeOf(obj), desc)
    map.set(obj, clone)
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = deepClone(obj[key])
      }
    }
    return newObj
  }
  return obj
}
```