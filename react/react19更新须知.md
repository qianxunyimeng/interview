

## Actions

在 React 应用中，一个常见的用例是执行数据变更，然后响应更新状态。例如，当用户提交一个表单来更改他们的名字，你会发起一个 API 请求，然后处理响应。在过去，你需要手动处理待定状态、错误、乐观更新和顺序请求。

在 React 19 中，我们正在添加在过渡中使用异步函数的支持，以自动处理待定状态、错误、表单和乐观更新。

例如，你可以使用 useTransition 来为你处理待定状态：

```tsx
// 使用 Actions 中的待定状态
function UpdateName({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => { // react 19 支持异步函数，而在react8中必须是同步函数
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      } 
      redirect("/path");
    })
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

异步过渡会立即将 isPending 状态设置为 true，发出异步请求，然后在任何过渡后将 isPending 切换为 false。这使你能够在数据变化时保持当前 UI 的响应性和交互性。

seTransition的优点：
- 自带加载状态
- startTransition的任务不会阻塞UI渲染

按照惯例，使用异步过渡的函数被称为 “Actions”。 
Actions 自动为你管理数据提交：

待定状态: Actions 提供一个待定状态，该状态在请求开始时启动，并在最终状态更新提交时自动重置。
乐观更新: Actions 支持新的 useOptimistic Hook，因此你可以在请求提交时向用户显示即时反馈。
错误处理: Actions 提供错误处理，因此当请求失败时，你可以显示错误边界，并自动将乐观更新恢复到其原始值。
表单: <form> 元素现在支持将函数传递给 action 和 formAction 属性。将函数传递给 action 属性默认使用 Actions，并在提交后自动重置表单。

## 新的hooks: useActionState

useActionState 是一个可以根据某个表单动作的结果更新 state 的 Hook。
```const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);```


```tsx
import {useState,useActionState,startTransition} from 'react'
function App(){
  const [name,setname] = useState('')
  // formData就是调用submitHandle时传递的参数
  const action = async (previousState, formData) => {
    const resp = await updateName(formData)
    if(resp.code == 0){
      return {
        success: true,
        data: resp.data
      } // 无论成功还是失败都必须有返回值，这个返回值会自动更新到state，也作为下一次的previousState
    }else{
      return {
        success: false,
        message: resp.message
      }
    }
  }
  const [state, submitHandle,isPending] = useActionState(action, null);

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)}/>
      <button disabled={isPending} onClick={() => {
          startTransition(() => { // 注意外面必须使用startTransition包裹
            submitHandle(name)
          })
        }}>提交</button>

        <h1>{state}</h1>
    </div>
  )
}
```

## form action加强
```tsx
import {useState,useActionState,startTransition} from 'react'
function App(){
  // formData:FormData
  const action = async (previousState, formData) => {
    const resp = await updateName(formData)
    if(resp.code == 0){
      return {
        success: true,
        data: resp.data
      } // 无论成功还是失败都必须有返回值，这个返回值会自动更新到state，也作为下一次的previousState
    }else{
      return {
        success: false,
        message: resp.message
      }
    }
  }
  const [state, submitHandle,isPending] = useActionState(action, null);

  return (
    <div>
      <form action={submitHandle}>
        <input name="name1"/>
        <button disabled={isPending} type="submit">提交</button>
      </form>
        <h1>{state}</h1>
    </div>
  )
}
```

## useOptimistic 乐观更新

todoList案例
```tsx
import {useState,useOptimistic，startTransition} from 'react'

const fakeApi = (task) => {
  return new promise((resolve,reect) => {
    settimeout(() => {
      if(Math.random() > 0.5){
        resolve(`任务【${task}】添加成功`)
      }else{
        reject('任务添加失败')
      }
    },1000)
  })
}

function TaskList(){
  const [tasks,setTasks] = useState([]) //待办事项列表
  const [optimisticState, addOptimistic] = useOptimistic(state, (currentTasks,newTask) => {
    return [...currentTasks,newTask] //返回一个新的乐观状态
  });

  const addTask = (task) => {
    startTransition(async() => {
      // 在发起异步任务之前，先更新乐观值，如果请求失败了，会自动回滚乐观状态
      addOptimistic(task)
      // 掉接口,
      await fakeApi(task)
      //  更新真实状态
      setTasks((currentTask) => {
        return [...currentTask,task]
      })
    })
    
  }

  return (
    <div>
      <h1>待办事项列表</h1>
      <ul>
        {
          optimisticState.map((task,index) => (<li key={index}>{task}</li>))
        }
      </ul>
    </div>
  )
}
```

## useFormStatus

useFormStatus 读取离它最近的那个 <form> 的状态，就像表单是一个 Context 提供者一样

```tsx
import {useFormStatus} from 'react-dom';
async function submitForm(){
  return new Promise((res) => setTimeout(res,1000))
}
function Submit(){
  // 获取父组件Form的状态
  const { pending, data, method, action } = useFormStatus();
  return (
    <button type="submit">
      {pending ? '提交中...' : '提交'}
    </button>
  )
}
function Form({action}){
  return (
    <form action={action}>
      <input name="message" />
      <Submit />
    </form>
  )
}

function App(){
  return <Form action={submitForm} />
}

```