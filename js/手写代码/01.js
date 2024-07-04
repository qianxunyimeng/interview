

function getname () { 
  return new Promise((resolve, reject) => { 
    setTimeout(() => {
      console.log("获取到了数据");
      resolve("as")
    }, 3000);
  })
}

async function eg () { 
  const res = await getname()
  console.log("res: ",res);
}

eg()
console.log("end...");