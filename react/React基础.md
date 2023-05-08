# React基础

## props为什么是只读的

React对props做过冻结处理Object.freeze(props)

## 为函数组件为props设置默认值,属性校验

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