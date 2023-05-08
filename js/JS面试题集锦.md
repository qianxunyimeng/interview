# JS面试题集合

## 1.typeof('abc')和typeof 'abc'都是string, 那么typeof是操作符还是函数

typeof 是操作符，不是函数。可以添加括号，但是括号的作用是进行分组而非函数的调用

## 2.你理解的"use strict";是什么?使用它有什么优缺点？

设立"严格模式"的目的，主要有以下几个：

- 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;

- 消除代码运行的一些不安全之处，保证代码运行的安全；
  
- 提高编译器效率，增加运行速度；

- 为未来新版本的Javascript做好铺垫

```html
设立"严格模式"的目的，主要有以下几个：
　　- 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;
　　- 消除代码运行的一些不安全之处，保证代码运行的安全；
　　- 提高编译器效率，增加运行速度；
　　- 为未来新版本的Javascript做好铺垫
```

## 4.”attribute“和“property”有什么不同

property是DOM中的属性，是JavaScript里的对象。
attribute是HTML标签上的特性，它的值只能够是字符串。

## 5.对new操作符符理解，手动实现一个new方法

new 操作符的几个作用

new 操作符会返回一个对象，所以我们需要在内部创建一个对象
这个对象，也就是构造函数中的 this，可以访问到挂载在 this 上的任意属性
这个对象可以访问到构造函数原型上的属性，所以需要将对象与构造函数链接起来
返回原始值需要忽略，返回对象需要正常处理

着手实现功能

```js
function create(Con, ...args) {
  let obj = {}
  Object.setPrototypeOf(obj, Con.prototype)
  let result = Con.apply(obj, args)
  return result instanceof Object ? result : obj
}
```

这就是一个完整的实现代码，我们通过以下几个步骤实现了它：

1. 首先函数接受不定量的参数，第一个参数为构造函数，接下来的参数被构造函数使用
2. 然后内部创建一个空对象 obj
3. 因为 obj 对象需要访问到构造函数原型链上的属性，所以我们通过 setPrototypeOf 将两者联系起来。这段代码等同于 obj.__proto__ = Con.prototype
4. 将 obj 绑定到构造函数上，并且传入剩余的参数
5. 判断构造函数返回值是否为对象，如果为对象就使用构造函数返回的值，否则使用 obj，这样就实现了忽略构造函数返回的原始值。

## 手写call,apply,bind

作用：改变函数内部的this指向
call和apply会立即执行，bind回返回一个改变了上下文后的函数,不会立即执行
call:接收多个参数，第一个为函数上下文也就是 this ，后边参数为函数本身的参数。
apply:接收两个参数，第一个参数为函数上下文 this，第二个参数为函数参数只不过是通过一个 数组 的形式传入的。
bind和call使用类似，只是不会立即执行

手写call

```js
/**
* Object()方法
* 如果传入的是值类型 会返回对应类型的构造函数创建的实例
* 如果传入的是对象 返回对象本身
* 如果传入 undefined 或者 null 会返回空对象
*/
Function.prototype._call = function(ctx, ...args) {
  // 判断上下文类型 如果是undefined或者 null 指向window
  // 否则使用 Object() 将上下文包装成对象
  const o = ctx == undefined ? window : Object(ctx)
  // 如何把函数foo的this 指向 ctx这个上下文呢
  // 把函数foo赋值给对象o的一个属性  用这个对象o去调用foo  this就指向了这个对象o
  // 下面的this就是调用_call的函数foo  我们把this给对象o的属性fn 就是把函数foo赋值给了o.fn
  //给context新增一个独一无二的属性以免覆盖原有属性
  const key = Symbol()
  o[key] = this
  // 立即执行一次
  const result = o[key](...args)
  // 删除这个属性
  delete o[key]
  // 把函数的返回值赋值给_call的返回值
  return result
}
```

手写apply

```js
// 只需要把第二个参数改成数组形式就可以了。
Function.prototype._apply = function(ctx, array = []) {
  const o = ctx == undefined ? window : Object(ctx)
  //给context新增一个独一无二的属性以免覆盖原有属性
  const key = Symbol()
  o[key] = this
  const result = o[key](...array)
  delete o[key]
  return result
}
```

手写bind

```js
Function.prototype._bind = function(ctx, ...args) {
  // 下面的this就是调用_bind的函数,保存给_self
  const _self = this
  // bind 要返回一个函数, 就不会立即执行了
  const newFn = function(...rest) {
    // 调用 call 修改 this 指向
    return _self.call(ctx, ...args, ...rest)
  }
  if (_self.prototype) {
    // 复制源函数的prototype给newFn 一些情况下函数没有prototype，比如箭头函数
    newFn.prototype = Object.create(_self.prototype);
  }
  return newFn
}
```

## 判断字符串是否是回文

给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。
说明：本题中，我们将空字符串定义为有效的回文串。

```html
示例 1:

输入: "A man, a plan, a canal: Panama"
输出: true
示例 2:

输入: "race a car"
输出: false

大概步骤：

获取有效的字符串，我们利用正则去匹配字母和数字，因为忽略大小写，所以我们转成小写
然后利用 split('') 把字符串分割成数组，再用数组的 reverse() 去反转，再用 join(‘’) 去拼接
最后进行比较

```

```js
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
  if (s.length === 1) return true
  const str = s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  const strReverse = str.split('').reverse().join('')
  return str === strReverse
};
```

## 对象遍历方法Object.keys()和for...in的区别

Object.keys()：遍历对象的key,返回一个数组，数组值为对象自有的属性，不会包括继承原型的属性
for in :以任意顺序遍历一个对象的属性，包括自身属性，以及继承自原型的属性

## Object.defineProperty方法

Object.defineproperty 的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性。
Object.defineproperty可以接收三个参数。

Object.defineproperty(obj, prop, desc)

obj :  第一个参数就是要在哪个对象身上添加或者修改属性
prop : 第二个参数就是添加或修改的属性名
desc ： 配置项，一般是一个对象

```js
writable： 是否可重写/修改 默认值 false 不可被修改，一但赋值不能修改
value：   当前值
get：      读取时内部调用的函数
set：        写入时内部调用的函数
enumerable：  是否可以遍历,默认值 false 不可枚举
configurable：  是否通过delete删除从而重新定义属性 默认值 false 不能删除
```

## 为什么会有跨域问题？怎么解决跨域？

跨域：指的是浏览器不能执行其他网站的脚本。它是由浏览器的同源策略造成的，是浏览器对javascript施加的安全限制。
同源策略：是指协议，域名，端口都要相同，其中有一个不同都会产生跨域；

跨域解决方案：
jsonp
document.domain + iframe跨域
ocation.hash + iframe
window.name + iframe跨域
postMessage跨域
跨域资源共享（CORS）
nginx代理跨域
WebSocket协议跨域

jsonp跨域

```html
jsonp的原理就是利用<script>标签没有跨域限制，通过<script>标签src属性，发送带有callback参数的GET请求，服务端将接口返回数据拼凑到callback函数中，返回给浏览器，浏览器解析执行，从而前端拿到callback函数返回的数据。
```

CORS
普通跨域请求：只服务端设置Access-Control-Allow-Origin即可，前端无须设置，若要带cookie请求：前后端都需要设置。

document.domain + iframe跨域
此方案仅限主域相同，子域不同的跨域应用场景。
实现原理：两个页面都通过js强制设置document.domain为基础主域，就实现了同域。

a. 父窗口：(<http://www.domain.com/a.html>)

```js
<iframe id="iframe" src="http://child.domain.com/b.html"></iframe>
<script>
    document.domain = 'domain.com';
    var user = 'admin';
</script>
```

b. 子窗口：<http://child.domain.com/b.html>

```js
<script>
    document.domain = 'domain.com';
    // 获取父窗口中变量
    alert('get js data from parent ---> ' + window.parent.user);
</script>


```

## 说说你对IIFE的理解

IIFE，全称为：Immediately Invoked Function Expression，即：立即调用函数表达式。

```js
(function(){
})()
```

优点

- 避免作用域命名污染
- 提升性能（减少了对作用域的查找）
- 避免全局命名冲突
- 保存闭包状态
- 有利于代码压缩（可以用简单字符串代替）
- 颠倒代码执行顺序
- 模仿块级作用域

缺点

- 多个块级作用域需要多个嵌套；
- 性能问题。

## window对象和document对象有什么区别

Window对象是全局对象global，所有的表达式都在当前的环境中计算，window对象实现了核心JavaScript所定义的全局属性和方法。
document：代表整个HTML文档，可以用来访问页面中的所有元素。document对象是window对象的一部分可以通过window.document属性对其进行访问。

## 创建对象的几种方式

方式一：new Object()

直接通过构造函数创建一个新对象。

```js
var obj = new Object()
//等同于 var obj = {}
```

使用字面量的方式更简单，其实他俩是一样的。
优点是足够简单，缺点是每个对象都是独立的。

方式二：工厂模式

```js
function createObj(name,age){
    var obj = {};
    obj.name=name;
    obj.age=age;
    return obj
}
var Anson = createObj('Anson', 18)
console.log(Anson)
//{name: "Anson", age: 18}
```

优点是 可以解决创建多个相似对象的问题，缺点是 无法识别对象的类型。

方式三：构造函数

```js
function Person(name,age){
    this.name =name;
    this.age=age;
    this.sayName =function (){ alert(this.name) }
}
var person = new Person('小明',13);
console.log(person);
//Person {name: "小明", age: 13, sayName: ƒ}
```

优点是 可以创建特定类型的对象，缺点是 多个实例重复创建方法

方式四：（构造函数 + 原型 ） 组合模式

```js
function Person(name, age){
    this.name = name;
    this.age = age;
    Person.prototype.sayName = function (){ alert(this.name) }
 }
var person = new Person('小白',18)
console.log(person);
//Person {name: "小白", age: 18} __proto__ -> sayName: ƒ ()
```

优点 多个实例引用一个原型上的方法 比较常用

方法五：寄生构造函数模式

```js
function Person(name,age,job){
    var o=new Object();
    o.name=name;
    o.age=age;
    o.job=job;
    o.sayName=function(){
        console.log(this.name)
    }
    return o;
}
var friend=new Person("her",18,"Front-end Engineer");
friend.sayName();
//her
```

除了使用new操作符，其他的和工厂函数一样，可以为对象创建构造函数。

方法六 Object.create()

```js
const person = {
  isHuman: false,
  printIntroduction: function () {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  }
};

const me = Object.create(person);

me.name = "Matthew"; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // inherited properties can be overwritten

me.printIntroduction();
// expected output: "My name is Matthew. Am I human? true"

```

传入一个原型对象，创建一个新对象，使用现有的对象来提供新创建的对象的__proto__，实现继承。

## 写一个使两个整数进行交换的方法（不能使用临时变量）

利用执行顺序

```js
a = a + b;
b = a - b;
a = a - b;
```

亦或取值

```js
a ^= b;
b ^= a;
a ^= b;
```

数组解构

```js
let a = 1, b= 2
[a, b] = [b, a]
```

## JS事件和任务

JS任务分为同步任务和异步任务，异步任务又分为宏任务和微任务，其中异步任务属于耗时的任务。
![js任务](../images/js%E4%BB%BB%E5%8A%A1.png)

### 宏任务和微任务有哪些

宏任务：整体代码script、setTimeout、setInterval、setImmediate、i/o操作（输入输出，比如读取文件操作、网络请求）、ui render（dom渲染，即更改代码重新渲染dom的过程）、异步ajax等

微任务：Promise（then、catch、finally）、async/await、process.nextTick、Object.observe(⽤来实时监测js中对象的变化)、 MutationObserver(监听DOM树的变化)

### 任务执行顺序

js代码在执行的时候，会先执行同步代码，遇到异步宏任务则将异步宏任务放入宏任务队列中，遇到异步微任务则将异步微任务放入微任务队列中，当所有同步代码执行完毕后，再将异步微任务从队列中调入主线程执行，微任务执行完毕后，再将异步宏任务从队列中调入主线程执行，一直循环至所有的任务执行完毕（完成一次事件循环EventLoop）。

注意：

每个异步宏任务执行完之后，都会检查是否存在待执行的微任务；如果有，则执行完所有的微任务之后，再继续执行下一个宏任务。
![js任务执行顺序](../images/js%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F.png)

<font color="red">一次事件循环只能处理一个宏任务，一次事件循环可以将所有的微任务处理完毕。</font>

### 练习题

```js
console.log(1);
setTimeout(function () {
  console.log(2);
  let promise = new Promise(function (resolve, reject) {
    console.log(3);
    resolve();
  }).then(function () {
    console.log(4);
  });
}, 1000);
setTimeout(function () {
  console.log(5);
  let promise = new Promise(function (resolve, reject) {
    console.log(6);
    resolve();
  }).then(function () {
    console.log(7);
  });
}, 0);
let promise = new Promise(function (resolve, reject) {
  console.log(8);
  resolve()
}).then(function () {
  console.log(9);
}).then(function () {
  console.log(10)
});
console.log(11);
//执行顺序：1 8 11 9 10 5 6 7 2 3 4
```

分析

1. 执⾏同步任务 console.log(1) ，输出 1 ；
2. 遇到 setTimeout 放到宏任务队列中，命名 time1 ；
3. 遇到 setTimeout 放到宏任务队列中，命名 time2 ；
4. new Promise 在实例化过程中所执⾏的代码都是同步执⾏的（ function 中的代码），输出8 ；
5. 将 Promise 中注册的回调函数放到微任务队列中，命名为 then1 ；
6. 将 Promise 中注册的回调函数放到微任务队列中，命名为 then2 ；
7. 执⾏同步任务 console.log(11)， 输出 11 ；
8. 从微任务队列取出任务 then1 到主线程中，输出 9 ；
9. 从微任务队列取出任务 then2 到主线程中，输出 10 ，⾄此微任务队列为空；
10. 从宏任务队列中取出 time2( 注意这⾥不是 time1 的原因是 time2 的执⾏时间为 0)；
11. 执⾏同步任务 console.log(5) ，输出 5 ；
12. new Promise 在实例化过程中所执⾏的代码都是同步执⾏的（ function 中的代码），输出6 ；
13. 将 Promise 中注册的回调函数放到微任务队列中，命名为 then3 ，⾄此宏任务time2执⾏完成；
14. 从微任务队列取出任务 then3 到主线程中，输出 7 ，⾄此微任务队列为空；
15. 从宏任务队列中取出 time1 ，⾄此宏任务队列为空；
16. 执⾏同步任务 console.log(2) ，输出 2 ；
17. new Promise 在实例化过程中所执⾏的代码都是同步执⾏的（ function 中的代码），输出3 ；
18. 将 Promise 中注册的回调函数放到微任务队列中，命名为 then4 ，⾄此宏任务time1执⾏完成；
19. 从微任务队列取出任务 then4 到主线程中，输出 4 ，⾄此微任务队列为空。

### 宏任务之间的执行顺序

宏任务有setTimeout、setInterval、setImmediate、i/o操作、异步的ajax，它们之间的执行也是有先后顺序，它们之间的执行顺序是：
setImmediate --> setTimeout --> setInterval --> i/o操作 --> 异步ajax

## web worker

[更多内容](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)
Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

Web Worker 有以下几个使用注意点。

（1）同源限制

分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。

（2）DOM 限制

Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用document、window、parent这些对象。但是，Worker 线程可以navigator对象和location对象。

（3）通信联系

Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。

（4）脚本限制

Worker 线程不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。

（5）文件限制

Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。

## document的load 和ready有什么区别？

主要执行顺序的区别，load：页面资源加载完成； ready：是dom加载完成。

## 理解constructor、prototype、__proto__和原型链

① 当任意一个普通函数用于创建一类对象时，它就被称作构造函数，或构造器。

```js
function Person() {}
var person1 = new Person()
var person2 = new Person()
```

上面代码Person( )就是person1和person2的构造函数。

② 可以通过对象.constructor拿到创建该实例对象的构造函数。
![对象.constructor拿到创建该实例对象的构造函数](../images/js_001.awebp)

```js
console.log(person1.constructor) // 结果输出: [Function: Person]
```

Person函数就是person1对象的构造函数。



③ Function函数和Object函数是JS内置对象，也叫内部类，JS自己封装好的类，所以很多莫名其妙、意想不到的设定其实无需过分纠结，官方动作，神仙操作。

④ 原型对象即实例对象自己构造函数内的prototype对象。

## 什么是原型和原型链

1）每一个对象上，都有一个属性，叫__proto__，它指向了一个对象，这个对象我们叫原型对象。

2）每一个构造器（类，函数），也是对象，这个对象上，有一个属性，叫prototype，它也指向一个对象，和__proto__指向同一个对象，也是原型对象

3）每一个原型对象上，都是有一个属性，叫constructor，它指向此原型对象所对应的构造器

4）原型链：原型链指查找对象上某个属性的查找机制，查找一个对象上的私有属性，先在自己的私有属性中找，找不到，就沿着__proto__去原型对象上找…

## 如何实现a===1 && a===2 && a===3返回true？

```js
Object.defineProperty(this, 'a', {
    get: function () {
        return this.value = this.value ? (this.value += 1) : 1
    }
})
console.log(a===1 && a===2 && a===3) //true
```

```js
let a = new Proxy({ i: 0 }, {
    get: (target, name) => name === Symbol.toPrimitive ? () => ++target.i : target[name],
});
console.log(a == 1 && a == 2 && a == 3);    // true

```

```js
let _a= 1;
Reflect.defineProperty(this, 'a', {
    get() {
        return _a++;
    }
});
console.log(a === 1 && a === 2 && a === 3);//true
```
