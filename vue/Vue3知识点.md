# Vue3知识点

## 1. emits和&emits

emits 可以是数组或对象，从组件触发自定义事件，emits 可以是简单的数组，也可以是对象，后者允许配置事件验证。
在对象语法中，每个 property 的值可以为 null 或验证函数。验证函数将接收传递给 $emit 调用的其他参数。如果 this.$emit('foo',1) 被调用，foo 的相应验证函数将接收参数 1。验证函数应返回布尔值，以表示事件参数是否有效。

数组写法：// emits:['emitEvnentName']

对象写法：// emits:{}
        { eventName:null }
        { eventName:()=>{} }

细节说明：
1、数组形式和对象形式的值为null，表示该emit事件无验证函数。
2、对象形式且值为函数表示该 emit 配置了事件验证
  验证函数必须有 return 真假值，真值表示通过验证，假值则 vue 会自动抛出 warn 警告！不 return 值默认当做失败，抛出 warn 警告！
  <font color="red">验证函数主要就是验证参数是否正确，并不会在 return false 时中断 emit() 事件！</font>

```vue
// 子组件
<template>
    <el-button type="success" plain @click='trigger'>emits测试</el-button>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  // 定义自定义事件
  // emits:['emitEvnentName'], // 数组写法都默认无验证函数！！
  emits: {
    noVerification: null, // 无验证函数
 
    emitEvnentName: ({ email, password },data2,dataX) => { 
      console.log('定义自定义事件-myEvent',email, password,data2,dataX);
      if (email && password) {
 
        // 验证函数应返回布尔值，以表示事件参数是否有效。
        return true
 
      } else {
        console.error('Invalid submit event payload!')
        return false
      }
    }
  },
  methods:{
    trigger(){
      let email = 1
      let password = null
      this.$emit('emitEvnentName',{email, password},'data2',['data3','data4'])
    }
  }
})
</script>
```

composition Api 写法：defineEmits

```vue
<script setup>
const emit = defineEmits({
  noVerification: null, // 无验证函数
 
  delete: (val) => { 
    console.log('定义自定义事件-myEvent',val);
    if (val) {
      return true
 
    } else {
      console.error('Invalid submit event payload!')
      return false
    }
  }
})
console.log(emit);
 
setTimeout(() => {
  emit('delete','测试')
}, 1000*10);
</script>
```

```vue
<script setup lang='ts'>
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'delete', value: string, vlaue2:number ,value3?:boolean): void
}>()
 
setTimeout(() => {
  emit('delete', '123', 5666)
}, 1000*4);
</script>
```

## 2. 组合式api和选项式api的优缺点

### 2.1 选项式api

- 优点：
  - 简单，易于上手
  - 代码组织结构清晰
  - 便于理解
- 缺点：
  - 代码冗余，逻辑分散
  - 复杂业务逻辑难以维护

### 2.2 组合式api

- 优点：
  - 组件逻辑更易于抽象、封装和重用，代码复用性更好
  - 逻辑聚合更加明显，提高了代码的可读性和可维护性
- 缺点：
  - 学习成本高
  - 代码量增加


## 3. Vue3.0性能提升主要是通过哪几方面体现的？

### 3.1 编译阶段优化

- diff算法优化
  vue3在diff算法中相比vue2增加了`静态标记`，其作用是为了会发生变化的地方添加一个`flag`标记，下次发生变化的时候直接找该地方进行比较。
- 静态提升
  Vue3中对不参与更新的元素，会做静态提升，只会被创建一次，在渲染时直接复用。免去了重复的创建操作，优化内存。
- 事件监听缓存
- ssr渲染优化

### 3.2 源码体积优化

相比Vue2，Vue3整体体积变小了，除了移出一些不常用的API，最重要的是Tree shanking。

任何一个函数，如ref、reavtived、computed等，仅仅在用到的时候才打包，没用到的模块都被摇掉，打包的整体体积变小。


### 3.3 响应式系统

vue2中采用 defineProperty来劫持整个对象，然后进行深度遍历所有属性，给每个属性添加getter和setter，实现响应式。

vue3采用proxy重写了响应式系统，因为proxy可以对整个对象进行监听，所以不需要深度遍历。

## 4. pina和vuex的区别

- 两者都是状态管理工具
- pina是轻量级的，vuex是重量级的
- vuex采用全局单例模式，只有一个store实例，pina采用分离模式，可以创建多个store实例
- pina没有模块的概念，vuex有模块的概念
- pina没有mutation的概念，vuex有mutation的概念
- pina没有namespace的概念，vuex有namespace的概念