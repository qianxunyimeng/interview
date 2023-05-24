# React基础

## React优缺点

React优点
1.简洁
在当业务流程复杂的时候，我们就会发现单向数据流和组件化的组合方式会很大程度上降低问题的复杂度

2.灵活
在 React 里，我们可以把一切理解为 JS，这样操作起来就少了很多束缚；另外组件提供的多种嵌套方式，数据驱动、生命周期等让开发变得更加顺畅

3.高效
这离不开我们刚才的虚拟 DOM，它通过减少和优化 对DOM 的操作，能在 React 在浏览器里有更好的性能表现

React缺点

1. React 只是 视图层的一个框架，如果需要做其他事情，需要依赖它的生态系统；如处理单页面路由使用 Router,处理数据使用 Redux。
2. 变动频繁，经常不向前兼容。

## 1.react定义组件的方法有哪些？区别是什么？

1. 函数式组件
2. es5方式`React.createClass`组件 
3. es6方式`extends React.Component`

注意: React.createClass 在16.0以后的版本中被废弃

区别： 

## 2.props为什么是只读的

React对props做过冻结处理Object.freeze(props)

## 3.为函数组件为props设置默认值,属性校验

```js
const Demo = function (props){
  let {title,x} = props

  return <div></div>
}

Demo.defaultProps = {
  x:0
}
import PropTypes from 'prop-types'
Demo.propTypes = {
  title:PropTypes.string.isRequired
}

```

## 4.setState到底是异步还是同步?

1. setState只在合成事件和钩子函数中是“异步”的，在原生事件和setTimeout 中都是同步的。
2. setState 的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，<font color="red">只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值</font>，形成了所谓的“异步”，当然可以通过第二个参数 setState(partialState, callback) 中的callback拿到更新后的结果。
3. setState 的批量更新优化也是建立在“异步”（合成事件、钩子函数）之上的，在原生事件和setTimeout 中不会批量更新，在“异步”中如果对同一个值进行多次setState，setState的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时setState多个不同的值，在更新时会对其进行合并批量更新。

## 5.react17前后版本生命周期的差异

17版本之前的生命周期
![react 17版本之前的生命周期](../images/react生命周期旧.png)

17及以后的新生命周期
![react 17及之后新生命周期](../images/react生命周期新.png)

在react 18版本中
废弃的生命周期
- componentWillMount
- componentWillReceiveProps
- componentWillUpdate
  并改名为 UNSAFE_componentWillMount、UNSAFE_componentWillReceiveProps、UNSAFE_componentWillUpdate

## 6.React组件通信的几种方式

- 父子组件：props，props回调
- 兄弟组件：共同父级，再由父节点转发props，props回调
- 跨级组件：context对象，注入全局变量：getChildContext;   获取全局变量：this.- context.color;
- 非嵌套组件：使用事件订阅，向事件对象添加监听器，和触发事件来实现组件之间的通讯，通过引入event模块实现
- 全局状态管理工具：Redux,Mobox维护全局store
  
## 7.react UI组件和容器组件的区别与应用

  容器组件：拥有自己的状态，生命周期

  UI组件：只负责页面UI渲染，不具备任何逻辑，功能单一，通常是无状态组件，没有自己的state,生命周期。

## 8.React的请求放在componentWillMount有什么问题？

- 在SSR（服务端渲染）中，componentWillMount生命周期会执行两次，导致多余请求
- 在react16进行fiber重写后，componentWillMount 可能在一次渲染中多次调用
- react17版本后要删除componentWillMount生命周期

## 9.React 虚拟dom和 Vue虚拟dom的异同？

两者对diff算法的优化基本上思路是相同的：

- tag不同认为是不同节点

- 只比较同一层级，不跨级比较

- 同一层级的节点用key唯一标识，tag和key都相同则认为是同一节点

<font color="red">dom的更新策略不同</font>

react 会自顶向下全diff。vue会跟踪每一个组件的依赖关系,不需要重新渲染整个组件树。

在react中，当状态发生改变时，组件树就会自顶向下的全diff, 重新render页面， 重新生成新的虚拟dom tree, 新旧dom tree进行比较， 进行patch打补丁方式，局部更新dom。所以react为了避免父组件更新而引起不必要的子组件更新， 可以在shouldComponentUpdate做逻辑判断，减少没必要的render， 以及重新生成虚拟dom，做差量对比过程。

在vue中， 通过Object.defineProperty 把 data 属性全部转为 getter/setter。同时watcher实例对象会在组件渲染时，将属性记录为dep, 当dep 项中的 setter被调用时，通知watch重新计算，使得关联组件更新。

## 10.react中component和pureComponent两者的区别是什么

PureComponent其实就是一个继承自Component的子类，会自动加载shouldComponentUpdate函数。当组件需要更新的时候，shouldComponentUpdate会对组件的props和state进行一次浅比较。如果props和state都没有发生变化，那么render方法也就不会出发，当然也就省去了之后的虚拟dom的生成和对比，在react性能方面得到了优化。

区别：
1. PureComponent会自动执行shouldComponentUpdate函数，通过shallowEqual的浅对比，实现react的性能优化。
2. PureComponent不仅会影响本身，而且会影响子组件，所以PureComponent最佳情况是展示组件
   1. 假如父组件是继承自PureComponent,而子组件是继承自Component，那么如果当父组件的props或者是state没有变化而子组件的props或者state有变化，那么此时子组件也不会有更新，因为子组件受到父组件的印象，父组件没有更新。
   2. 如果，父子组件均继承自PureComponent，那么父子组件的更新就会依赖与各自的props和state
   3. 父组件是继承自Component，而子组件是继承自PureComponent那么就是看各自的props和state
   4. 当然如果父子组件都是继承自Component那么就是只要有更新，那么都会去重新渲染

