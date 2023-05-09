# Vue面试题集锦

## 1. 有使用过vue吗？说说你对vue的理解

vue是一套用于构建用户界面的渐进式框架。被设计为自底向上逐层应用。vue核心库只关心视图层。

优点有：轻量（大小只有十几k），简单易学；实现双向数据绑定和组件化；视图、数据、结构分离，是数据更改更简单；使用虚拟DOM，减少了dom操作；运行速度快；

缺点：不支持IE8及以下、是SPA，对SEO不友好

## 2. 什么是虚拟DOM？

虚拟DOM：是使用JS对象来模拟DOM树。页面的更新可以先全部反应在JS对象（虚拟DOM）上（使用DIff算法），操作内存中的JS对象的速度显然更快，等更新完成后，再将最终的JS对象映射成真实的DOM，交由浏览器去绘制。

## 3. 说说你对选项el,template,render的理解

1. el：提供一个在页面上已存在的DOM元素作为Vue实例的挂载目标。只在用new 创建实例时生效，组件对象中不能使用

2. template：一个字符串模板作为Vue实例的标识使用。模板将会替换挂载元素。挂载元素的内容将会被忽略，除非模板的内容由分发插槽。

    可以是id选择器、普通的html元素字符串、注册好的组件

    new 创建实例以及组件对象中均能使用
3. render函数：可以渲染组件对象、普通元素名

4. 显示权重：reader > remplate > el

## 4. 为什么说基于Proxy的响应式实现，性能整体优于Object.defineProperty

proxy是对整个对象进行代理，所以可以监听对象某个属性值的变化，还可以监听对象属性的新增和删除，而且还可以监听数组；而 defineProperty 只是给对象的某个已存在的属性添加对应的 getter 和 setter，所以它只能监听这个属性值的变化，而不能去监听对象属性的新增和删除。

## 5. Vue2.0和Vue3.0的生命周期有什么区别

### vue2常用生命周期

创建前：beforeCreate() 只有一些实例本身的事件和生命周期函数

创建后：Created() 是最早使用data和methods中数据的钩子函数

挂载前：beforeMount() 指令已经解析完毕，内存中已经生成dom树

挂载后：Mounted() dom渲染完毕页面和内存的数据已经同步

更新前：beforeUptate() 当data的数据发生改变会执行这个钩子，内存中的数据是新的，页面是旧的

更新后：Updated() 内存和页面都是新的

销毁前：beforeDestroy() 即将销毁data和methods中的数据此时还是可以使用的，可以做一些释放内存的操作

销毁后：Destroyed() 已经销毁完毕

### vue3生命周期做出了一些改动

前面的是vue2的后面是vue3

beforeCreate  -> setup() 开始创建组件之前，创建的是data和method

created       -> setup()

beforeMount   -> onBeforeMount 组件挂载到节点上之前执行的函数。

mounted       -> onMounted 组件挂载完成后执行的函数

beforeUpdate  -> onBeforeUpdate 组件更新之前执行的函数。

updated       -> onUpdated 组件更新完成之后执行的函数。

beforeDestroy -> onBeforeUnmount 组件挂载到节点上之前执行的函数。

destroyed     -> onUnmounted 组件卸载之前执行的函数。

## 6. 使用Vue2写的项目如何升级为Vue3？需要考虑哪些因素？

Vue3不支持IE11

## 7. Vue2和Vue3数据双向绑定的原理及区别

vue2
使用Object.defineProperty对象以及对象属性的劫持+发布订阅模式，只要数据发生变化直接通知变化 并驱动视图更新。

```html
1.实现一个监听器Observer，用来劫持并监听所有属性，如果有变动的，就通知订阅者。

2.实现一个订阅者Watcher，可以收到属性的变化通知并执行相应的函数，从而更新视图。

3.实现一个解析器Compile，可以扫描和解析每个节点的相关指令，并根据初始化模板数据以及初始化相应的订阅器。
```

Vue3
通过Proxy代理拦截对data任意属性的操作(13种),包括对属性值的读写，添加，删除等等...
通过Reflet动态对呗代理对象相应属性进行相应的操作。


## 8. Vue2 数据定义不在data里有什么问题，有什么解决方案

不在data里，属性就不是响应式的，可以用Vue.set(target,key,val)或 this.$.set() 将属性转换成响应式的

## 9. Vue2是如何监测数组数据的变化

Vue2是监测不到通过数组索引修改值的变化。
Vue2包装了数组相关的七个方法(push,pop,shift,unshift,splice,sort,reverse),通过这七种方法操作数组数据，vue是可以监测的数据的变化

## 10. Vue3组件通信方式

方式一：props / $emit
props父组件传递数据给子组件
emit子组件以方发派发的方式触发

方式二：expose / ref
父组件获取子组件的属性或者调用子组件方法

```js
// Child.vue
<script setup>
    // 方法一 不适用于Vue3.2版本，该版本 useContext()已废弃
    import { useContext } from "vue"
    const ctx = useContext()
    // 对外暴露属性方法等都可以
    ctx.expose({
        childName: "这是子组件的属性",
        someMethod(){
            console.log("这是子组件的方法")
        }
    })
    
    // 方法二 适用于Vue3.2版本, 不需要引入
    // import { defineExpose } from "vue"
    defineExpose({
        childName: "这是子组件的属性",
        someMethod(){
            console.log("这是子组件的方法")
        }
    })
</script>

// Parent.vue  注意 ref="comp"
<template>
    <child ref="comp"></child>
    <button @click="handlerClick">按钮</button>
</template>
<script setup>
    import child from "./child.vue"
    import { ref } from "vue"
    const comp = ref(null)
    const handlerClick = () => {
        console.log(comp.value.childName) // 获取子组件对外暴露的属性
        comp.value.someMethod() // 调用子组件对外暴露的方法
    }
</script>

```
  
方式四：attrs
attrs：包含父作用域里除 class 和 style 除外的非 props 属性集合

```js
// Parent.vue 传送
<child :msg1="msg1" :msg2="msg2" title="3333"></child>
<script setup>
    import child from "./child.vue"
    import { ref, reactive } from "vue"
    const msg1 = ref("1111")
    const msg2 = ref("2222")
</script>

// Child.vue 接收
<script setup>
    import { defineProps, useContext, useAttrs } from "vue"
    // 3.2版本不需要引入 defineProps，直接用
    const props = defineProps({
        msg1: String
    })
    // 方法一 不适用于 Vue3.2版本，该版本 useContext()已废弃
    const ctx = useContext()
    // 如果没有用 props 接收 msg1 的话就是 { msg1: "1111", msg2:"2222", title: "3333" }
    console.log(ctx.attrs) // { msg2:"2222", title: "3333" }
    
    // 方法二 适用于 Vue3.2版本
    const attrs = useAttrs()
    console.log(attrs) // { msg2:"2222", title: "3333" }
</script>

```

方式五：provide / inject 为依赖注入

provide：可以让我们指定想要提供给后代组件的数据或
inject：在任何后代组件中接收想要添加在这个组件上的数据，不管组件嵌套多深都可以直接拿来用

```js
// Parent.vue
<script setup>
    import { provide } from "vue"
    provide("name", "沐华")
</script>

// Child.vue
<script setup>
    import { inject } from "vue"
    const name = inject("name")
    console.log(name) // 沐华
</script>
```

方式六： mitt.js
Vue3 中没有了 EventBus 跨组件通信，但是现在有了一个替代的方案 mitt.js，原理还是 EventBus

## 11. Vue2组件通信方式

- 父子组件通信: props; $parent / $children; provide / inject ; ref ;  $attrs / $listeners
- 兄弟组件通信: eventBus ;  vuex
- 跨级通信:  eventBus；Vuex；provide / inject 、$attrs / $listeners

## 12. 说说你对指令的理解

指令 (Directives) 是带有 v- 前缀的特殊 attribute。指令 attribute 的值预期是单个 JavaScript 表达式 (v-for 是例外情况，稍后我们再讨论)。指令的职责是，当表达式的值改变时，将其产生的连带影响，响应式地作用于 DOM。


## 13. 自定义指令的生命周期（钩子函数）有哪些

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。

- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。

- unbind：只调用一次，指令与元素解绑时调用。

## 14. 说说你对keep-alive的理解是什么？

keep-alive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：

- 一般结合路由和动态组件一起使用，用于缓存组件；
- 提供 include 和 exclude 属性，两者都支持字符串或正则表达式， include 表示只有名称匹配的组件会被缓存，exclude 表示任何名称匹配的组件都不会被缓存 ，其中 exclude 的优先级比 include 高；
- 对应两个钩子函数 activated 和 deactivated ，当组件被激活时，触发钩子函数 activated，当组件被移除时，触发钩子函数 deactivated。

## 15. 计算属性和监听属性的区别

vue 2.x：

computed（计算属性）：

1. 监听值未在data中定义，以return返回值形式；
2. 计算属性的值会被缓存，只有实例中相关依赖值改变时，才重新计算，性能好但不适合做异步请求；
3. 计算属性默认只有get来读取，手动修改计算属性时，会触发手写的set函数。

watch (监听器）：

1. 监听值要在data中先定义，可以不写return返回值；
2. 不支持缓存，可以做异步操作；
3. 监听值改变，回调函数自动调用。

vue 3.x：

computed（计算属性）：

以函数返回的形式定义，接受一个getter函数，并根据getter的返回值返回一个不可变的响应式ref对象

```js
const count = ref(0)
const add = computed(() => count.value++)
```

手动修改计算属性的值，回出发手写的set函数

```js
const count = ref(1)
const plusOne = computed({
    get: () => count.value + 1,
    set: val => {
        count.value = val - 1
    }
})

plusOne.value = 1
console.log(plusOne.value) // 0
```

watch(监听器）：
监听器封装成了函数，数据源可以是一个具有返回值的getter函数，也可以是一个ref

```js
const state = reactive({count:0})
watch(
    () => state.count,
    (count,prevCount) => {
        /**  TODO */
    }
)

const count = ref(0)
watch(count,(count,prevCount) => {
    /** TODO */
})

```

可以同时监听多数据源

```js
watch(
    [fooRef,barREf],
    ([foo,bar],[prevFoo,prevBar]) => {
        /**  */
    }
)

```

## 16. vue3 watch和watchEffet的区别

watch:
避坑：

- watch监视ref定义的数据可以正确获取oldValue,watch监视reative定义的对象数据，oldValue不准确
- watch监视的是reactive定义的整个对象数据时，deep配置失效，强制开启深度监视，深度监视关闭不了。监视的是reactive定义的对象某个属性时，deep配置生效，如果监视的层级较深，需要手动开启deep:true

- 需要指定监听源
- 默认不执行回调，通过配置{immediate:true}初始化时立即执行一次回调
- 配置{deep:true} 指定深度监视

watchEffet：

- 不需要指定监听源
- 默认初始化时会立即执行一次回调

## 17. v-if 和 v-for 的优先级是什么？

在Vue2中：v-for优先级比v-if高，Vue3 中：v-if优先级比v-for高。

注意事项：

1. 永远不要把 v-if 和 v-for 同时用在同一个元素上
2. 如果避免出现这种情况，则在外层嵌套template（页面渲染不生成dom节点），在这一层进行 v-if 判断，然后在内部进行 v-for 循环

```vue
<template v-if="isShow">
    <p v-for="item in items">
</template>
```

3. 如果条件出现在循环内部，可通过计算属性computed提前过滤掉那些不需要显示的项

```vue
computed: {
    items: function() {
      return this.list.filter(function (item) {
        return item.isShow
      })
    }
}
```

## 18. 删除数组用delete和Vue.delete有什么区别？

- delete：只是被删除数组成员变为 empty / undefined，其他元素键值不变
- Vue.delete：直接删了数组成员，并改变了数组的键值（对象是响应式的，确保删除能触发更新视图，这个方法主要用于避开 Vue 不能检测到属性被删除的限制）

## 19. 说说你对vue的mixin的理解，有什么应用场景？

多个实例引用了相同或相似的方法或属性等，可将这些重复的内容抽取出来作为mixins的js，export出去，在需要引用的vue文件通过mixins属性注入，与当前实例的其他内容进行merge。
一个混入对象可以包含任意组件选项。同一个生命周期，混入对象会比组件的先执行。

## 20. 怎么捕获组件vue的错误信息？

1. errorCaptured 钩子可以捕获组件内部错误 
   errorCaptured 是组件内部钩子，当捕获一个来自子孙组件的错误时被调用，接收 error、 vm、info 三个参数，return false 后可以阻止错误继续向上抛出

```vue
export default{
  data(){},
  methods:{},
  created(){},
  mounted(){},
  /**
   * 收到三个参数：
   * 错误对象、发生错误的组件实例
   * 以及一个包含错误来源信息的字符串。
   * 此钩子可以返回 false 以阻止该错误继续向上传播。
   */
  errorCaptured(err, vm, info){
    console.log(err)
    // -> 错误返回
    console.log(vm)
    // -> vue实例
    console.log(info)
    // -> 在哪个钩子发生错误
    return false
  }
}
```

2. errorHandler 全局错误捕获
errorHandler 为全局钩子，使用 Vue.config.errorHandler 配置，接收参数与 errorCaptured 一 致，2.6 后可捕捉 v-on 与 promise 链的错误，可用于统一错误处理与错误兜底

```vue
/** * 收到三个参数： 
    * 错误对象、发生错误的组件实例 
    * 以及一个包含错误来源信息的字符串。
    */
Vue.config.errorHandler = function (err, vm, info) {
    
}
```

## 21. SPA首屏加载速度慢的怎么解决？

（1）较少入口文件体积：如路由懒加载

（2）静态资源本地缓存：如采用http缓存、localStorage等

（3）UI框架按需加载

（4）避免重复组件多次下载：修改webpack配置

（5）图片资源压缩

（6）开启Gzip压缩

（7）使用服务器端渲染（SSR）

## 22. 说说你对vue的extend（构造器）的理解，它主要是用来做什么的？

 (1) Vue.extend(option)：使用基础Vue构造器，创建一个“子类”。参数是一个包含组件选项的 对象

（2）extends：允许声明扩展另一个组件（可以是一个简单的选项对象或构造函数），而无需使用Vue.extend。主要是为了便于扩展单文件组件

## 23. 页面刷新后vuex的state数据丢失怎么解决？

- 一般结合localStorage来做数据的备份

- 借助辅助插件vuex-persistedstate

## 24. vue-router钩子函数有哪些？都有哪些参数？

1）全局守卫：beforeEach()、beforeResolve()、afterEach()

```vue
const router = new VueRouter({...})

router.beforeEach((to, from, next) => { // 全局前置守卫
 /* 必须调用next */
})

router.beforeResolve((to, from, next) =>{ // 全局解析守卫
 /* 必须调用next */
})

router.afterEach((to, from) => {}) // 全局后置钩子

```

（2）路由独享守卫

```vue
const router = new VueRouter({
 routes: [{
  path: '/home',
  component: Home,
  beforeEnter: (to, from, next) => {
   // ...
  }
 }]
})

```

3）组件内的守卫：beforeRouteEnter()、beforeRouteUpdate()、beforeRouteLeave()

```vue
const Foo = {
 template: `...`,
 beforeRouteEnter(to, from, next) {
  next(vm => {
   // 通过`vm`访问组件实例，this不可用
  })
 },
 beforeRouteUpdate(to, from, next) {
  this.name = to.params.name
  next()
 },
 beforeRouteLeave(to, from, next) {
  const answer = window.confirm('Do you really want to leave?')
  if (answer) {
   next()
  } else {
   next(false)
  }
 }
}

```

（4）完整的导航解析流程

1. 导航被触发
2. 在失活的组件里调用beforeRouteLeave()守卫
3. 调用全局的beforeEach()守卫
4. 在重用组件里调用beforeRouteUpdate()守卫
5. 在路由配置里调用beforeEnter()
6. 解析异步路由组件
7. 在被激活的组件里调用beforeRouteEnter()
8. 调用全局的beforeResolve()守卫
9. 导航被确认
10. 调用全局的afterEach钩子
11. 触发DOM更新
12. 调用beforeRouteEnter守卫中传给next的回调函数，创建好的组件实例会作为回调函数的参数传入

## 25. 怎么实现路由懒加载呢？

```vue
const router = new VueRouter({
  routes: [{ path: '/foo', component: () => import('./Foo.vue') }]
})
```

## 26. vue-router如何响应路由参数的变化？

1）为什么要响应参数变化

- 切换路由，参数发生了变化，但页面数据并未及时更新，需要强制刷新后才会变化
- 不同路由渲染相同的组件时（组件复用比销毁再创建效率高），切换路由后，当前组件的生命周期函数不在被调用

2）方法：

- 使用watch监听
  
```vue
watch: {
    $route(to, from){
        if(to != from) {
            console.log("监听到路由变化，做出相应的处理");
        }
    }
}
```

- 向router-view组件中添加key
  
```vue
<router-view :key="$route.fullPath"></router-view>
```

## 27. 切换到新路由时，页面要滚动到顶部或保持原先的滚动位置怎么做呢？

```vue
const router = new VueRouter({
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
     return savedPosition // 保持原滚动位置
   } else {
     return { x: 0, y: 0 } // 滚动到顶部
   }

   // if (to.hash) {
   //   return {
   //     selector: to.hash // 滚动到锚点
   //     behavior: 'smooth', // 平滑滚动
   //   }
   // }

   // return new Promise((resolve, reject) => { // 异步滚动
   //   setTimeout(() => {
   //     resolve({ x: 0, y: 0 })
   //   }, 500)
   // })
  }
})
```

## 28. route和router有什么区别？

- route：表示当前的路由信息，包含了当前URL解析得到的信息，如当前的路径、参数、query对象等

- router：是全局路由的实例，是Router构造方法的实例。包含了所有路由的属性和方法

## 29. 怎么监听vuex数据的变化？

- 在vue文件中：通过计算属性获取vuex中的数据，再通过watch来监听计算属性中的值

- 在非vue文件中：使用vuex的实例方法watch来监听

## 30. 有用过vuex吗？它主要解决的是什么问题？推荐在哪些场景用？

1）Vuex是一个专为Vue.js应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

（2）应用场景：

- 多个视图依赖同一状态
- 来自不同视图的行为需要变更同一状态
- 大型单页应用
  
（3）优势

- 全局变量状态的同一管理，便于代码的维护
- 单向数据流，使状态的变化可追踪、可预测
- 实现各个组件的自由传参

## 31. 你认为vue的核心是什么？

数据驱动和组件系统


## 32. 你了解什么是高阶组件吗？可否举个例子说明下？

所谓高阶组件其实就是一个高阶函数, 即返回一个组件函数的函数，Vue中怎么实现呢？ 注意 高阶组件有如下特点

- 高阶组件(HOC)应该是无副作用的纯函数，且不应该修改原组件,即原组件不能有变动
- 高阶组件(HOC)不关心你传递的数据(props)是什么，并且新生成组件不关心数据来源
- 高阶组件(HOC)接收到的 props 应该透传给被包装组件即直接将原组件prop传给包装组件
- 高阶组件完全可以添加、删除、修改 props


Base.vue

```vue
<template>
  <div>
    <p @click="Click">props: {{test}}</p>
  </div>
</template>
<script>
export default {
  name: 'Base',
  props: {
    test: Number
  },
  methods: {
    Click () {
      this.$emit('Base-click')
    }
  }
}
</script>
```

[高阶组件](https://blog.csdn.net/z609373067/article/details/81258966)

```vue
function Console (Base) {
  return {
    mounted () {
      console.log('haha')
    },
    props: Base.props,
    render (h) {
      const slots = Object.keys(this.$slots)
        .reduce((arr, key) => arr.concat(this.$slots[key]), [])
        // 手动更正 context
        .map(vnode => {
          vnode.context = this._self //绑定到高阶组件上
          return vnode
        })
 
      return h(WrappedComponent, {
        on: this.$listeners,
        props: this.$props,
        attrs: this.$attrs
      }, slots)
    }
  }
}
```

## 33.  怎么缓存当前的组件？缓存后怎么更新？

开发中缓存组件使用keep-alive组件，keep-alive是vue内置组件，keep-alive包裹动态组件component时，会缓存不活动的组件实例，而不是销毁它们，这样在组件切换过程中将状态保留在内存中，防止重复渲染DOM。

```vue
<keep-alive>
  <component :is="view"></component>
</keep-alive>
```

结合属性include和exclude可以明确指定缓存哪些组件或排除缓存指定组件,<font color="red">**include和exclude匹配的是组件的name属性，所以要给所有的路由组件赋值name属性**</font>

vue3中结合vue-router时变化较大，之前是keep-alive包裹router-view，现在需要反过来用router-view包裹keep-alive：

```vue
<router-view v-slot="{ Component }">
  <transition>
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </transition>
</router-view>

```

缓存后如果要获取数据，解决方案可以有以下两种：

```
1.beforeRouteEnter：在有vue-router的项目，每次进入路由的时候，都会执行beforeRouteEnter

 beforeRouteEnter(to, from, next){
  next(vm=>{
    console.log(vm)
    // 每次进入路由执行
    vm.getData()  // 获取数据
  })
},

2.activated：在keep-alive缓存的组件被激活的时候，都会执行activated钩子

activated(){
  this.getData() // 获取数据
},
```

## 34.  vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？

人员 - 角色 - 权限（菜单、按钮）

封装了一个指令权限，能简单快速的实现按钮级别的权限判断。

使用权限字符串 v-hasPermi

```vue
// 单个
<el-button v-hasPermi="['system:user:add']">存在权限字符串才能看到</el-button>
// 多个
<el-button v-hasPermi="['system:user:add', 'system:user:edit']">包含权限字符串才能看到</el-button>
```

使用角色字符串 v-hasRole

```vue
// 单个
<el-button v-hasRole="['admin']">管理员才能看到</el-button>
// 多个
<el-button v-hasRole="['role1', 'role2']">包含角色才能看到</el-button>

```

在某些情况下，它是不适合使用v-hasPermi，如元素标签组件，只能通过手动设置v-if。 可以使用全局权限判断函数，用法和指令 v-hasPermi 类似。

```vue
<template>
  <el-tabs>
    <el-tab-pane v-if="checkPermi(['system:user:add'])" label="用户管理" name="user">用户管理</el-tab-pane>
    <el-tab-pane v-if="checkPermi(['system:user:add', 'system:user:edit'])" label="参数管理" name="menu">参数管理</el-tab-pane>
    <el-tab-pane v-if="checkRole(['admin'])" label="角色管理" name="role">角色管理</el-tab-pane>
    <el-tab-pane v-if="checkRole(['admin','common'])" label="定时任务" name="job">定时任务</el-tab-pane>
   </el-tabs>
</template>

<script>
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default{
   methods: {
    checkPermi,
    checkRole
  }
}
</script>

```

v-hasPermi

```vue
 /**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */
 
import store from '@/store'

export default {
  mounted(el, binding, vnode) {
    const { value } = binding
    const all_permission = "*:*:*";
    const permissions = store.getters && store.getters.permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
```
v-hasRole

```
 /**
 * v-hasRole 角色权限处理
 * Copyright (c) 2019 ruoyi
 */
 
import store from '@/store'

export default {
  mounted(el, binding, vnode) {
    const { value } = binding
    const super_admin = "admin";
    const roles = store.getters && store.getters.roles

    if (value && value instanceof Array && value.length > 0) {
      const roleFlag = value

      const hasRole = roles.some(role => {
        return super_admin === role || roleFlag.includes(role)
      })

      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置角色权限标签值"`)
    }
  }
}
```

```
import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'

export default function directive(app){
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
}
```

v-if 工具方法判断  

```vue
import store from '@/store'

/**
 * 字符权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export function checkPermi(value) {
  if (value && value instanceof Array && value.length > 0) {
    const permissions = store.getters && store.getters.permissions
    const permissionDatas = value
    const all_permission = "*:*:*";

    const hasPermission = permissions.some(permission => {
      return all_permission === permission || permissionDatas.includes(permission)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need roles! Like checkPermi="['system:user:add','system:user:edit']"`)
    return false
  }
}

/**
 * 角色权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export function checkRole(value) {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value
    const super_admin = "admin";

    const hasRole = roles.some(role => {
      return super_admin === role || permissionRoles.includes(role)
    })

    if (!hasRole) {
      return false
    }
    return true
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`)
    return false
  }
}
```

## 35. vuex的action和mutation的特性是什么？有什么区别？

Action

一些对 State 的异步操作可放在 Action 中，并通过在 Action 中 commit Mutation 变更状态。Action 可通过 store.dispatch() 方法触发，或者通过 mapActions 辅助函数将 vue 组件的 methods 映射成 store.dispatch() 调用。

Mutation

在 vuex 的严格模式下，Mutaion 是 vuex 中改变 State 的唯一途径，Mutation 中只能是同步操作通过 store.commit() 调用 Mutation

## 36. 怎么监听vuex数据的变化？

- 可以通过watch选项或者watch方法监听状态；
- 可以使用vuex提供的API：store.subscribe()；

- watch选项方式，可以以字符串形式监听$store.state.xx；subscribe方式，可以调用store.subscribe(cb)，回调函数接收mutation对象和state对象，这样可以进一步判断mutation.type是否是期待的那个，从而进一步做后续处理；
- 总的来说，watch方式简单好用，且能获取变化前后值，首选；subscribe方法会被所有commit行为触发，因此还需要判断mutation.type，用起来略繁琐，一般用于vuex插件中；

```vue
//Vue2
watch: {
  "$store.state.test.count": {
    immediate: true,
    handler(val) {
      console.log(val)
    }
  }
}
//Vue3
const store = useStore()

watch(
  store.state,
  (val) => {
    console.log(val.count)
  },
  { immediate: true }
)
//store.subscribe
mounted() {
  this.$store.subscribe((mutation, state) => {
    if (mutation.type == "test/INCREMENT") {
      console.log(state.test.count)
    }
  })
}
```

## 37.  vuex怎么知道state是通过mutation修改还是外部直接修改的？ 

Vuex 中修改 state 的唯一渠道就是执行 commit(‘xx’, payload) 方法，其底层通过执行 this._withCommit(fn) 设置_committing 标志变量为 true，然后才能修改 state，修改完毕还需要还原_committing 变量。外部修改虽然能够直接修改 state，但是并没有修改_committing 标志位，所以只要 watch 一下 state，state change 时判断是否_committing 值为 true，即可判断修改的合法性。

## 38.  在vue事件中传入$event，使用e.target和e.currentTarget有什么区别？

event.currentTarget指向事件所绑定的元素，而event.target始终指向事件触发的元素。

## 39. vue怎么实现强制刷新组件？

1. 如果要在组件内部中进行强制刷新
  
    调用this.$forceUpdate()强制重新渲染组件

1. 如果是刷新某个子组件
  
    利用v-if指令的特性。

    当组件的key 值变更时，会自动的重新渲染

## 40. Vue实例初始化时，data、props、methods顺序

```js
function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }
```
以上为vue的部分源码，可以看出判断顺序：
props > methods > data > computed > watch
因此如果有同名属性或方法，会被覆盖
