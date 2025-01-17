
# 同一请求频繁触发

解决方案：
- 取消重复请求(适合查询类接口，例如input输入框走接口查询输入建议等)
- 挂起重复请求(适合提交类接口,例如表单新增编辑)

type.ts
```ts
import type {
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosInstance,
    AxiosError,
  } from 'axios'
  
  /**
   *  axios实例配置选项，继承AxiosRequestConfig
   */
  export interface AxiosOptions extends AxiosRequestConfig {
    // 是否直接返回data数据
    directlyGetData?: boolean
    // 定义拦截器
    interceptors?: RequstInterceptors
    // 是否取消重复请求(此模式 服务端会收到多个请求)
    abortRepetitiveRequest?: boolean
    // 是否挂起重启请求，后续重复请求会挂起，等待第一个请求相应，并返回第一个请求的结果(此模式 服务端会收到一个请求)
    pendingRepetitiveRequest?: boolean
    // 重连配置
    retryConfig?: {
      // 重连次数
      count: number
      // 每次请求间隔时间
      waitTime: number
    }
  }
  
  /**
   *  定义拦截器抽象类，后续在index.ts文件中继承实现
   */
  export abstract class RequstInterceptors {
    // 请求拦截器
    abstract requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
    // 请求错误拦截器
    abstract requestInterceptorsCatch?: (err: Error) => Error
    // 响应拦截器
    abstract responseInterceptor?: (res: AxiosResponse) => AxiosResponse
    // 响应错误拦截器
    abstract responseInterceptorsCatch?: (axiosInstance: AxiosInstance, error: AxiosError) => void
  }
  
  /**
   *  定义返回类型
   */
  export interface Respones<T = any> {
    code: number
    result: T
  }
  
```

订阅发布模式:当第一个请求响应后，通知后续挂起的重复请求
```ts
class EventEmitter {
    // 尚未相应的请求
    event: Record<string,Function[][]>
    constructor() {
        this.event = {}
    }
    on(key:string, resolve:Function, reject:Function) {
        if (!this.event[key]) {
            this.event[key] = [[resolve, reject]]
        } else {
            this.event[key].push([resolve, reject])
        }
    }
 
    emit(key:string, res:any, callBackType: "resolve" | "reject") {
        if (!this.event[key]) return
        this.event[key].forEach(cbArr => {
            if(callBackType === 'resolve') {
                cbArr[0](res)
            }else{
                cbArr[1](res)
            }
        });
        
    }
}

export {EventEmitter}
```

挂起重复请求核心代码
```ts

import { AxiosRequestConfig, AxiosResponse } from 'axios'
import {EventEmitter} from "./EventEmitter"

// 根据请求生成对应的key
/**
 * 
 * @param config AxiosRequestConfig
 * @param hash location.hash
 * @returns 唯一请求key
 */
function generateReqKey(config: AxiosRequestConfig, hash = "") {
    const { method, url, params, data } = config;
    return [method, url, JSON.stringify(params), JSON.stringify(data), hash].join("&");
}

// 存储已发送但未响应的请求
const pendingRequest = new Set();
const pendingMap = new Map<string, any>()
const ev = new EventEmitter()

class PendingAxios {
    async pengingRequest(config: AxiosRequestConfig & { pendKey?: string }):Promise<any> {
        const reqKey = generateReqKey(config)
        if (pendingRequest.has(reqKey)) { // 存在相同请求并暂未相应的，在这里挂起
            console.log("11")
            // 这里需注意，拿到结果后，无论成功与否，都需要return Promise.reject()来中断这次请求，否则请求会正常发送至服务器
            let res = null
            try {
                // 接口成功响应
                res = await new Promise((resolve, reject) => {
                    ev.on(reqKey, resolve, reject)
                })
                console.log(res)
                return Promise.reject({
                    type: 'limiteResSuccess',
                    val: res
                })
            } catch (limitFunErr) {
                // 接口报错
                return Promise.reject({
                    type: 'limiteResError',
                    val: limitFunErr
                })
            }

        }else{
            config.pendKey = reqKey
            pendingRequest.add(reqKey)
            return Promise.resolve()
        }
    }

    removePending(config: AxiosRequestConfig) {
        const reqKey = generateReqKey(config)
        if (pendingRequest.has(reqKey)) {
            pendingRequest.delete(reqKey)
        }
    }

    successHandle(response: AxiosResponse) {
        const reqKey = (response.config as any).pendKey
        if (pendingRequest.has(reqKey)) {
            let x = null
            try {
                x = JSON.parse(JSON.stringify(response))
            } catch (e) {
                x = response
            }
            pendingRequest.delete(reqKey)
            ev.emit(reqKey, x, 'resolve')
            delete ev.event[reqKey]
        }
    }
    errorHandle(error: any) {
        const reqKey = error.config.pendKey
        if (pendingRequest.has(reqKey)) {
            let x = null
            try {
                x = JSON.parse(JSON.stringify(error))
            } catch (e) {
                x = error
            }
            pendingRequest.delete(reqKey)
            ev.emit(reqKey, x, 'reject')
            delete ev.event[reqKey]
        }

    }
}

export { PendingAxios }

```

AxiosMax
```ts
import type { AxiosOptions, RequstInterceptors, Respones } from './type'
import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { PendingAxios } from './PendingAxios'

class AxiosMax {
    // axios实例, 通过axios.create()方法创建
    private axiosInstance: AxiosInstance
    // 传入的配置
    private options: AxiosOptions
    // 拦截器
    private interceptors: RequstInterceptors | undefined

    constructor(options: AxiosOptions) {
        this.axiosInstance = axios.create(options)
        this.options = options
        this.interceptors = options.interceptors
        // 对拦截器进行初始化注册
        this.setInterceptors()
    }

    /**
     * 注册拦截器
     */
    setInterceptors() {
        const {
            requestInterceptors,
            requestInterceptorsCatch,
            responseInterceptor,
            responseInterceptorsCatch,
        } = this.interceptors || {}

        // 创建挂起请求实例
        const pendingAxios = new PendingAxios()

        // 挂载请求拦截器
        this.axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
            // 是否挂起后续重复请求
            const pendingRepetitiveRequest = (config as any)?.pendingRepetitiveRequest ?? this.options.pendingRepetitiveRequest
            if (pendingRepetitiveRequest) {
                await pendingAxios.pengingRequest(config)
            }

            if (requestInterceptors) {
                // 如果存在请求拦截器，则将 config 先交给 requestInterceptors 做对应的配置。
                config = requestInterceptors(config)
            }
            return config
        }, requestInterceptorsCatch ?? undefined)

        // 挂载响应拦截器
        this.axiosInstance.interceptors.response.use(
            (res: AxiosResponse) => {
                // 取消请求
                res && pendingAxios.successHandle(res)
                if (responseInterceptor) {
                    // 如果存在响应拦截器，则将返回值先交给 responseInterceptor 做处理
                    res = responseInterceptor(res)
                }
                // 根据 options.directlyGetData 配置选项判断是否直接取得data值
                if (this.options.directlyGetData) {
                    res = res.data
                }
                return res
            },
            (err: AxiosError | any) => {
                if (err.type && err.type === 'limiteResSuccess') {
                    return Promise.resolve(this.options.directlyGetData ? err.val.data : err.val)
                } else if (err.type && err.type === 'limiteResError') {
                    return Promise.reject(err.val);
                } else {
                    pendingAxios.errorHandle(err)
                }
                if (responseInterceptorsCatch) {
                    // 如果存在响应错误拦截器，则将返回值交给 responseInterceptorsCatch 做处理
                    return responseInterceptorsCatch(this.axiosInstance, err)
                }
                return err
            },
        )
    }

    /**
     * 统一请求方法
     */
    request<T = any>(config: AxiosRequestConfig): Promise<T> {
        return new Promise((resolve, reject) => {
            this.axiosInstance
                .request<any, AxiosResponse<Respones>>(config)
                .then((res) => {
                    return resolve(res as unknown as Promise<T>)
                })
                .catch((err) => {
                    return reject(err)
                })
        })
    }

    get<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'GET' })
    }

    post<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'POST' })
    }

    put<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'PUT' })
    }

    delete<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'DELETE' })
    }
}

export default AxiosMax
```

index.ts
```ts
import AxiosMax from "./AxiosMax"

const useRequest = new AxiosMax({
    directlyGetData: true,
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 15000,
    withCredentials:false,
    //interceptors: _RequstInterceptors,
    //abortRepetitiveRequest: true,
    pendingRepetitiveRequest: true,
    retryConfig: {
      count: 0,
      waitTime: 500,
    },
})

export {useRequest}
export default useRequest
```