// https://www.bilibili.com/video/BV1C84y1q7LA?spm_id_from=333.788.videopod.episodes&vd_source=13368d27b099420bd2acffa073e99921&p=35
// 本文涉及到的主串和模式串都是从索引为1的地方开始存储的，所以在主串和模式串前面补一个空格
const getNext = (subStr, next = []) => {
  let j = 1
  let t = 0;// 当前公共前后缀的长度
  next[0] = -1
  next[1] = 0
  while (j < subStr.length -1 ) {
    if (t == 0 || subStr[j] == subStr[t]) {
      next[j + 1] = t + 1
      ++t
      ++j
    } else {
      t = next[t]
    }
  }
}

/**
 * 求解nextval数组 
 * 当 j等于1时，nextval[j]=0,作为特殊标记
 * 当 j大于1时：
 *          若P[j]不等于P[next[j]],则nextval[j]等于next[j];
 *          若P[j]等于P[next[j]],则nextval[j]等于nextval[next[j]]
 * @param {*} subStr 
 * @param {*} next 
 * @param {*} nextVal 
 */
const getNextVal_base = (subStr, next = [], nextVal = []) => {
  let j = 1
  let t = 0
  next[0] = -1
  nextVal[0] = -1
  next[1] = 0
  nextVal[1] = 0
  while (j < subStr.length) {
    if (t == 0 || subStr[j] == subStr[t]) {
      next[j + 1] = t + 1 
      if (subStr[j + 1] != subStr[next[j + 1]]) {
        nextVal[j + 1] = next[j + 1]
      } else {
        nextVal[j + 1] = nextVal[next[j + 1]]
      }
      ++t
      ++j
    } else {
      //t = next[t]
      t = nextVal[t]
    }
  }
}

const getNextVal = (subStr, nextVal = []) => {
  let j = 1
  let t = 0
  nextVal[0] = -1
  nextVal[1] = 0
  while (j < subStr.length - 1) {
    if (t == 0 || subStr[j] == subStr[t]) {
      //next[j + 1] = t + 1
      if (subStr[j + 1] != subStr[t + 1]) {
        nextVal[j + 1] = t + 1
      } else {
        nextVal[j + 1] = nextVal[t + 1]
      }
      ++t
      ++j
    } else {
      //t = next[t]
      t = nextVal[t]
    }
  }
}


const kmp = (str, subStr, next = []) => {
  let i = 1 
  let j = 1
  let num = 1;
  while (i < str.length && j < subStr.length) {
    console.log(`=========第${num}次循环==========`)
    console.log(`i = ${i}, j = ${j}`)
    console.log(`str[i]=${str[i]},subStr[j]=${subStr[j]}`)
    if (j == 0 || str[i] == subStr[j]) {
      ++i
      ++j
    } else {
      j = next[j]
    }
    num++
  }


  console.log(`便利结束 i=${i},j=${j},模式串长度=${subStr.length}`)
  // 注意 这里返回的索引是在前面补空格之后的索引，原字符串的索引还要 - 1
  if (j == subStr.length) {
    return i - subStr.length
  } else {
    return -1
  }
}

//const pattern = " ababac"
// const pattern = " aaaaabc"
// const next = new Array(6)
// const nextVal = new Array(6)
// getNext(pattern, next)
// getNextValPlus(pattern, nextVal)
// console.log(next)
// console.log(nextVal)

// console.log(kmp(" abababac", pattern, next)) // 3
// console.log(kmp(" ababbabababac", pattern, next)) // 8

const strSearch = (str, subStr) => { 
  
  const pattern = " " + subStr;
  const ss = " " + str;
  console.log(`主串:${ss}`)
  console.log(`模式串:${pattern}`)
  const next = new Array(pattern.length)
  getNextVal(pattern, next)
  console.log(next)
  return kmp(ss,pattern,next)
}

//strSearch("", "ABABAAABABAA")
console.log(strSearch("sssasad", "sad"))