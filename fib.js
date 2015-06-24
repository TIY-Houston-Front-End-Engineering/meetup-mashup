function* fib(){
    var a = 1,
      b = 1,
      temp = null
    while(true){
      temp = b
      b = a+b
      a = temp
      yield b
    }
}

var gen = fib()
var x = Array(150).join(',-').split(',')
console.log(
  x.map(() => gen.next().value).join(', ')
)