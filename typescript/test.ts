



// type ParametersRes = Parameters<(name: string, age: number) => void>





// type ReturnTypeRes = ReturnType<() => "hello">


// class Person { 
//   public name: string
//   public age: number
//   constructor(name:string,age:number) {
//     this.name = name
//     this.age = age
//   }

//   say(this:Person) { 
//     console.log(`name: ${this.name}, age: ${this.age}`);  
//   }
// }

// const p1 = {
//   name: '张三',
//   age: 23
// }

// const p2 = new Person('李四', 24)
// p2.say.call(p1)

// type ThisParameterTypeRes = ThisParameterType<typeof Person.prototype.say>


// interface PersonConstructor {
//   new(name:string,age:string): Person
// }

// type ConstructorParametersRes = ConstructorParameters<PersonConstructor>;


// type InstanceTypeRes = InstanceType<PersonConstructor>;



type Student = {
  name: string,
  cardNo: number
}

function getStudent(this:Student) {
  console.log(this.name); 
}
getStudent.call(33);




type Animal = {
  name: string;
  category: string;
  age: number;
  eat: () => number;
};





type AwaitedRes = Awaited<Promise<Promise<Promise<Animal>>>>;