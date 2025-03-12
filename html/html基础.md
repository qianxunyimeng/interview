
# Html基础面试题

## html中src和href属性有什么区别

  1. 应用标签不同
    这两个属性分别适用于不同的 HTML 标签。误用 href 替代 src（或者反之）可能会导致页面功能无法正常运作，因为浏览器不会对错误的属性做出正确的响应。
    src 属性的作用是 指定要加载的资源路径，常出现于 <script>、<img>、<audio>、<video> 和 <iframe> 等标签中，用于加载 JavaScript 脚本、图像、音频、视频或嵌入的网页文件。
    href 属性的作用是 ** 指定超链接的目标地址 **或定义文档与外部资源的关联，主要用在 <a>、<link>、<area> 等标签中。例如，当你创建一个超链接 <a> 时，需要用 href 属性指定用户点击后跳转的目标 URL；或者当你在文档头部使用 <link> 标签引入外部样式表时，也是使用 href 属性来指定样式表的地址。
  
  2. 资源加载方式不同
    当浏览器解析到适用于 src 属性的标签（比如 <script> 和 <img>）时，会暂停其他资源的下载和处理，直到将该资源加载、编译（如果是 JavaScript）、执⾏（如果是脚本）完成。这种方式称为阻塞加载，所以⼀般建议将 JavaScript 脚本放在页面底部。
    而当浏览器识别到适用于 href 属性的标签（比如 <a> 和 <link>）时，会并⾏下载资源，不会停⽌对当前⽂档的处理。这种方式称为非阻塞加载，浏览器可以同时处理超链接或引入样式表。

## web页面生命周期

1. DOMContentLoaded
DOMContentLoaded在页面的 HTML 和 DOM 树加载完成后触发，但在所有外部资源（如图像、样式表、脚本等）加载完成之前。这使得我们可以在 DOM 加载完成后执行一些操作，例如初始化页面元素、注册事件监听器、执行一些初始的 JavaScript 逻辑等。

DOMContentLoaded事件不会冒泡，不可以取消默认行为。

应用场景
- 初始化页面元素
- 注册事件监听器
- 发送初始的 AJAX 请求
- 执行一些初始的 JavaScript 逻辑

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // DOMContentLoaded 事件触发后执行的逻辑
  console.log('DOMContentLoaded event triggered');
});
```

2. load
load 事件在整个页面及其所有外部资源（如图像、样式表、脚本等）加载完成后触发。这意味着页面的所有内容已经可用，并且可以执行与页面渲染和交互相关的操作。
load事件不会冒泡，不可以取消默认行为。

应用场景
- 执行一些需要页面完全加载后才能进行的操作
- 初始化和配置第三方库和插件
- 启动动画或其他视觉效果

```javascript
window.addEventListener('load', function() {
  // load 事件触发后执行的逻辑
  console.log('load event triggered');
});
```

3. beforeunload
beforeunload 事件在页面即将被卸载（关闭、刷新、导航到其他页面等）之前触发。它通常用于询问用户是否确定离开当前页面，并可以在事件处理函数中执行一些清理操作。
beforeunload事件不会冒泡，可以取消默认行为。

应用场景
- 提示用户保存未保存的数据或离开前的确认提示
- 执行清理操作，如取消未完成的 AJAX 请求、释放资源等

```javascript
window.addEventListener('beforeunload', function(event) {
  // beforeunload 事件触发时执行的逻辑
  // 可以在这里提示用户保存未保存的数据或离开前的确认提示
  event.preventDefault(); // 阻止默认的 beforeunload 行为
  event.returnValue = ''; // Chrome 需要设置 returnValue 属性
});
```
4. unload
unload 事件在页面被卸载后触发，适用于执行最后的清理操作。

应用场景
- 释放页面所使用的资源，如清除定时器、取消事件监听器等
- 发送最后的统计数据或日志

```javascript
window.addEventListener('unload', function() {
  // unload 事件触发后执行的逻辑
  console.log('unload event triggered');
});
```
## async和defer

  普通的script引入js，js的下载和执行都会阻塞html文档的解析渲染

  |  script标签  |   是否阻塞html   |    执行时机    |    执行顺序    |      DOMContentLoaded回调  |
  | ---         |   ----           |     ----          |  ---           |  ---                       |
  | script      |   阻塞           |    下载完立即执行     |   按顺序(引入书序、书写顺序)执行    | 等待(等所有的script执行完毕才会触发 DOMContentLoaded回调)     |
  | async       |   下载不阻塞，执行阻塞  |   下载完立即执行(执行期间暂停html的解析和渲染)      |  无序(谁先加载完谁先执行)     |  不等待    |
  | defer       |   下载、执行都不阻塞    |   等dom渲染完毕，同时等待所有的defer下载完毕，<br>再依次执行 |  按顺序(引入书序、书写顺序)执行     |  等待(等所有的script执行完毕才会触发 DOMContentLoaded回调)    |


## html5新特性有哪些?

 1. 语义化的标签
    - header：定义文档的页眉（头部）。
    - footer：定义文档或节的页脚（底部）。
    - nav：定义导航链接的部分。
    - article：定义独立的文章内容。
    - section：定义文档中的节（section、区段）。
    - aside：定义与页面主内容相关联但又相对独立的内容，如侧边栏。

 2. 增强型表单
    - type="email"、type="url"：自动验证用户输入格式。
    - type="number"、type="range"：输入数字或范围。
    - type="search"：优化的搜索框。
    - type="color"：颜色选择器。
    - placeholder：输入框为空时显示的提示文字。
    - required、pattern：简化了数据验证过程。
    - time：时分秒
    - data：日期选择年月日
    - datatime：时间和日期(目前只有Safari支持)
    - datatime-local：日期时间控件
    - week：周控件
    - month：月控件

3. 媒体标签
  Audio 标签：用于嵌入音频内容。
      ```html
        <audio src="audio.mp3" controls autoplay loop></audio>
      ```
  Video 标签：用于嵌入视频内容。
      ```html
        <video src="video.mp4" poster="poster.jpg" controls></video>
      ```
  Source 标签：在音视频标签内使用，为不同的浏览器提供多种格式的媒体文件。
      ```html
        <video controls>
          <source src="video.mp4" type="video/mp4">
          <source src="video.webm" type="video/webm">
        </video>
      ```
    
4. 新的API

    - Canvas
    - Svg
    - 地理定位
    - 拖放API Drag
    -  web worker
    - web storage
    - websocket

## Web Worker

Web Worker 就是为了 javascript 创造多线程而生的，主线程创建 worker 子线程，将一些任务分配给后台运行，等到子线程完成计算任务，再把结果返回给主线程，好处是计算密集型或高延迟的任务被 worker 负担了，主线程就会很流畅。网页加载展示可分为两部分：主进程也叫 UI 进程，子进程也叫工作进程，子进程不能控制 UI 进程，只能进行数据交互。

Web Worker 子线程一旦创建成功，就会独立于其他脚本始终运行，不会被主线程上活动打断。这样有利于随时响应主线程的通信。但是这也造成 Worker 比较耗费资源，不应该过度使用，使用完毕之后应该关闭。

使用 Web Worker 注意点：

1. 同源限制：分配给 Worker 线程运行的脚本，必须与主线程的脚本文件同源，否则存在跨域问题。
2. DOM限制：Worker 线程所在的全局对象，与主线程不同，无法读取主线程的DOM对象，也无法使用 window、document、parent 这些对象。但是Worker线程可以使用navigation和location对象。
3. 数据通信：Worker 线程与主线程不在一个环境，不能直接通信，必须通过消息来完成数据通信。
4. 脚本限制：Worker 线程不能执行 window 的 alert、confirm 方法。但是可以通过ajax发送请求。
5. 文件限制：Worker线程无法读取本地文件，子线程加载的脚本必须来自网络。

使用步骤:
```javascript
// 主线程
if( typeof Worker !== undefined ){
 console.log("支持Worker线程")
 // 脚本文件必须来自网络
 var myWorker = new Worker('worker.js')
 // 主线程调用 postMessage() 方法，向 Worker 发消息。postMessage(参数) 方法中参数就是传给 Worker 的数据，这个数据可以是任意格式。
 myWorker.postMessage("你好")
 // 监听worker的回复消息
 myWorker.onmessage = function(res){
  console.log("主线程收到消息：",res.data)
 }
 // 监听work线程是否发生错误
  // 写法一
  myWorker.onerror = function(e){
  console.log('e',e)
  }
  //写法二
  // myWorker.addEventListener("error",function(e){
  //  console.log("e",e)
  // })

  // worker 比较耗费资源，如果不用了要及时关闭。主线程和子线程都可以关闭
  //主线程关闭
  myWorker.terminate() 
}else{
 console.log("不支持Worker")
}
```

```javascript
// worker 线程
// self 代表子线程本身,也可以换成this 其中 this 是子线程的全局对象
self.onmessage = function(e) {
  console.log('Received message from main thread:', e.data);
  self.postMessage('Hello from worker!');
};

// 也可以使用 addEventListener
//写法一
this.addEventListener("message",function(res){
 console.log("res",res.data)
})
//写法二
// addEventListener("message",function(res){
//  this.console.log("1",res.data)
// })

//子线程关闭
self.close() //方法一
//this.close() //方法二
```

同一个网页的worker

通常情况下，Worker 载入的是一个单独的 javascript 文件，但是也可以载入与主线程在同一个网页的代码。网页中添加 Worker 脚本，必须注意指定script标签的type属性是一个浏览器不认识的值，否则就会失去意义

```html
<script type="app/worker" id="wrs">
 this.onmessage = function(res){
  console.log("接收参数",res.data)
 }
</script>
```

然后，需要读取这段代码，先将嵌入网页的脚本代码转成二进制对象，然后为这个二进制对象生成url，再让worker加载url,这样就实现了主进程和worker在同一个网页内。

```html
<script>
 var blob = new Blob([document.querySelector("#wrs").textContent]);
 var url = window.URL.createObjectURL(blob);
 var worker = new Worker(url)
 worker.postMessage("发送数据")
</script>
```

将一个函数变成webworker
```js
// 文件名为main.js
function work () {
  onmessage = ({data: {message}}) => {
    console.log ('i am worker, receive:' + message);
    postMessage ({result: 'message from worker'});
  };
}

const runWorker = f => {
  const worker = new Worker (
    URL.createObjectURL (new Blob ([`(${f.toString ()})()`]))
  );

  worker.onmessage = ({data: {result}}) => {
    console.log ('i am main thread, receive:' + result);
  };

  worker.postMessage ({message: 'message from main thread'});
};

const testWorker = runWorker (work);
```

用Promise和闭包的方式去改造
我们再让它更通用一些，用Promise和闭包的方式去改造它，把runworker函数改造成一个makeworker函数

```js
// 文件名为index.js
function work () {
  onmessage = ({data: {jobId, message}}) => {
    console.log ('i am worker, receive:-----' + message);
    postMessage ({jobId, result: 'message from worker'});
  };
}

const makeWorker = f => {
  let pendingJobs = {};

  const worker = new Worker (
    URL.createObjectURL (new Blob ([`(${f.toString ()})()`]))
  );

  worker.onmessage = ({data: {result, jobId}}) => {
    // 调用resolve，改变Promise状态
    pendingJobs[jobId] (result);
    // 删掉，防止key冲突
    delete pendingJobs[jobId];
  };

  return (...message) =>
    new Promise (resolve => {
      const jobId = String (Math.random ());
      pendingJobs[jobId] = resolve;
      worker.postMessage ({jobId, message});
    });
};

const testWorker = makeWorker (work);

testWorker ('message from main thread').then (message => {
  console.log ('i am main thread, i receive:-----' + message);
});
```

## HTML中，img 标签 srcset 属性的作用是什么?

srcset 属性可为同一图像提供多个文件源和各自的分辨率描述符。浏览器会根据当前设备的屏幕尺寸（如宽度）和像素密度（如 DPI ）来选择最合适的图像源进行加载。这样，就能 获得与其设备相匹配的最佳图像体验，而不必加载比所需更大或更高分辨率的图像，从而节省带宽并加快页面加载速度。用法如下
```html
<img 
  src="small.jpg" 
  srcset="small.jpg 500w, 
  medium.jpg 1000w, 
  large.jpg 1500w" 
  alt="示例图片"
/>
```
这里的示例中：根据设备的屏幕宽度，浏览器会从三个图像中选择一个最合适的来显示。如果屏幕宽度接近 500 像素，它会加载 small.jpg；如果接近 1000 像素，则会加载 medium.jpg，以此类推。

一般情况下，srcset 和 sizes 属性一起使用，因为 sizes 可以帮助浏览器更准确地知道在不同视图下应该显示多大的图像，这样浏览器在选择图像时就更加精准了。
```html
<img 
  src="small.jpg"
  srcset="small.jpg 500w, 
  medium.jpg 1000w, 
  large.jpg 1500w"
  sizes="(max-width: 600px) 500px, (max-width: 900px) 1000px, 1500px"
  alt="示例图像"
>
```
srcset：列出了三个图像源和它们各自的宽度描述符。500w、1000w和1500w告诉浏览器每个图像的自然宽度。
sizes：

- 当视口宽度最大为 600px 时，图像的显示大小应为 500px 宽。
- 当视口宽度最大为 900px 时，图像的显示大小应为 1000px 宽。
- 如果视口宽度超过 900px 时，图像的显示大小应为 1500px 宽。

这种方法非常有效，因为它确保了图像不会过大或过小，从而避免了不必要的带宽消耗，并确保图像在各种设备上都能快速且正确地加载。

rcset 还可以与 <picture> 元素结合使用。<picture> 元素提供了更复杂的图像源选项，可以根据不同的媒体条件（如屏幕宽度和分辨率）指定不同的图像源。这对于艺术方向性的响应式图像特别有用，比如当你希望在不同设备上显示不同裁剪或方向的图片时。用法如下

```html
<picture>
  <source 
    media="(min-width: 800px)"
    srcset="large-1.jpg 1x, large-2.jpg 2x"
    sizes="(min-width: 1200px) 600px, (min-width: 1000px) 50vw, 100vw">
  <source 
    media="(min-width: 400px)"
    srcset="medium-1.jpg 1x, medium-2.jpg 2x">
  <img 
    src="default.jpg" 
    srcset="small-1.jpg 1x, small-2.jpg 2x"
    alt="Responsive image">
</picture>
```

```<source>``` 元素：

- 第一个 <source> 元素针对视口宽度至少为 800px 的设备。使用 srcset 提供了两种分辨率（1x 和 2x）的大图像，适用于高分辨率显示设备。sizes 属性进一步定义了不同视口宽度下图像的显示宽度，提供更精细的控制。
- 第二个 <source> 元素针对视口宽度至少为 400px 的设备。同样使用 srcset 提供普通和高分辨率的中等尺寸图像。

```<img>``` 元素：

- 作为所有 <source> 元素的后备选项。如果没有任何 <source> 元素的条件被满足，或者浏览器不支持 <picture> 元素，将加载 <img> 中定义的图像。这里还使用了 srcset 来为小图提供不同分辨率的版本。