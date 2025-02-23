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


## watch 使用
Vue3中的watch只能监视以下四种数据：
1. ref定义的数据。

2. reactive定义的数据。

3. 函数返回一个值（getter函数）。

4. 一个包含上述内容的数组。

  1. 监听ref定义的基本数据类型
  ```vue
<template>
    <div class="itemStyle">
          <div>
            当前数量: <span>{{num}}</span>
        </div>
        <div>
            <button @click="handleAdd">添加数量</button>
        </div>
    </div>
</template>

<script setup lang="ts" name="item">
    import {ref,reactive,toRefs,toRef,watch} from "vue"
    let num = ref(1)

    const handleAdd = ()=>{
        num.value++
    }

    let stopWatch = watch(num,(newVal,oldVal)=>{
        console.log("我监听了");
        if(newVal>5){
            stopWatch() // 解除监听
        }
    })
</script>
  ```

  2. 监听ref定义的对象类型数据
  ```vue
<template>
  <div class="person">
    <h1>情况二：监视【ref】定义的【对象类型】数据</h1>
    <h2>姓名：{{ person.name }}</h2>
    <h2>年龄：{{ person.age }}</h2>
    <button @click="changeName">修改名字</button>
    <button @click="changeAge">修改年龄</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>
 
<script lang="ts" setup name="Person">
  import {ref,watch} from 'vue'
  // 数据
  let person = ref({
    name:'张三',
    age:18
  })
  // 方法
  function changeName(){
    person.value.name += '~'
  }
  function changeAge(){
    person.value.age += 1
  }
  function changePerson(){
    person.value = {name:'李四',age:90}
  }
  /* 
    监视，情况一：监视【ref】定义的【对象类型】数据，监视的是对象的地址值，若想监视对象内部属性的变化，需要手动开启深度监视
    watch的第一个参数是：被监视的数据
    watch的第二个参数是：监视的回调
    watch的第三个参数是：配置对象（deep、immediate等等.....） 
  */
  watch(person,(newValue,oldValue)=>{
    console.log('person变化了',newValue,oldValue)
  },{deep:true})
  
</script>
  ```

(1) 直接写数据名，监视的是对象的【地址值】，若想监视对象内部的数据，要开启深度监视。

(2) 若修改的是 ref 定义对象的属性，newValue 和 oldValue 都是新值，因为它们是同一个对象。

(3) 若修改整个 ref 定义的对象，newValue 是新值， oldValue 是旧值，因为不是同一个对象了

3. 监听reactive定义的对象类型数据
如果监听reactive对象中的地址值，默认开启深度监听的，不能关闭
Vue3官方定义不能整体替换 reactive 定义的对象。可以使 Object.assign() 方法可以在不改变对象引用的情况下更新属性。如果监听的是reactive定义的对象整体，而不是某一个具体的属性，无论是修改属性还是用Object.assign()替换，oldValue和newValue都是指向的同一个对象，那二者也就是相等。
```vue
<template>
    <div class="person">
      <h1>情况三：监视【reactive】定义的【对象类型】数据</h1>
      <h2>姓名：{{ person.name }}</h2>
      <h2>年龄：{{ person.age }}</h2>
      <button @click="changeName">修改名字</button>
      <button @click="changeAge">修改年龄</button>
      <button @click="changePerson">修改整个人</button>
      <hr>
      <h2>测试：{{obj.a.b.c}}</h2>
      <button @click="test">修改obj.a.b.c</button>
    </div>
  </template>
  
  <script lang="ts" setup name="Person">
    import {reactive,watch} from 'vue'
    // 数据
    let person = reactive({
      name:'张三',
      age:18
    })
    let obj = reactive({
      a:{
        b:{
          c:666
        }
      }
    })
    // 方法
    function changeName(){
      person.name += '~'
    }
    function changeAge(){
      person.age += 1
    }
    function changePerson(){
      Object.assign(person,{name:'李四',age:80})
    }
    function test(){
      obj.a.b.c = 888
    }
    watch(person,(newValue,oldValue)=>{
      console.log('person变化了',newValue,oldValue)
    })
    watch(obj,(newValue,oldValue)=>{
      console.log('Obj变化了',newValue,oldValue)
    })
  </script>
```

4. 监视ref 和 reactive定义的对象类型中的某个属性

若该属性值不是【对象类型】，需要写成函数形式。
若该属性值是依然是【对象类型】，可直接写，也可以写成函数，建议写成函数。

注意：若是对象监视的是地址值，需要关注对象内部，需要手动开启深度监视。

```vue
<template>
    <div class="itemStyle">
          <div>
              姓名: <input type="text" v-model="data.name">
          </div>
          <div>
              年龄: <input type="text" v-model="data.age">
          </div>
          <div>
              爱好: <input type="text" v-model="data.hobby">
          </div>
          <div>
              其他: <input type="text" v-model="data.other.c.d">
          </div>
        <div>
            <button type="button" @click="handleChangeOtherData">修改其他</button>
        </div>
    </div>
</template>

<script setup lang="ts" name="item">
    import {ref,reactive,toRefs,toRef,watch} from "vue"

    let data = reactive({
        name:"小张",
        age:18,
        hobby:"打篮球",
        other:{
            a:"1111",
            b:"2222",
            c:{
                d:"1111",
                e:"2222",
            }
        }
    })

    const handleChangeOtherData = ()=>{
       data.other.c={
                d:"wwwww",
                e:"qqqqq",
            }
    }

	//监视响应式对象中的某个属性，且该属性是基本类型的，要写成函数
	watch(()=>data.name,(newVal,oldVal)=>{
        console.log("新值:",newVal);
        console.log("旧值:",oldVal);
    })
	
	//监视响应式对象中的某个属性，且该属性是对象类型的，可以直接写，也能写函数，更推荐写函数
    watch(()=>data.other.c,(newVal,oldVal)=>{
        console.log("新值:",newVal);
        console.log("旧值:",oldVal);
    })

</script>

```
5. 监听上述多个数据
```vue
<template>
    <div class="itemStyle">
          <div>
              姓名: <input type="text" v-model="data.name">
          </div>
          <div>
              年龄: <input type="text" v-model="data.age">
          </div>
          <div>
              爱好: <input type="text" v-model="data.hobby">
          </div>
          <div>
              其他: <input type="text" v-model="data.other.c.d">
          </div>
        <div>
            <button type="button" @click="handleChangeOtherData">修改其他</button>
        </div>
    </div>
</template>

<script setup lang="ts" name="item">
    import {ref,reactive,toRefs,toRef,watch} from "vue"

    let data = reactive({
        name:"小张",
        age:18,
        hobby:"打篮球",
        other:{
            a:"1111",
            b:"2222",
            c:{
                d:"1111",
                e:"2222",
            }
        }
    })

    const handleChangeOtherData = ()=>{
        data.other.c={
                d:"wwwww",
                e:"qqqqq",
            }
    }
	//监视，情况五:监视上述的多个数据
    watch([data.other.c,()=>data.name,()=>data.age,()=>data.hobby],(newVal,oldVal)=>{
        console.log("新值:",newVal);
        console.log("旧值:",oldVal);
    },{deep:true})

</script>
```
