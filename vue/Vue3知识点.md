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