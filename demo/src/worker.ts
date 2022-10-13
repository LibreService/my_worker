import { expose } from '@libreservice/my-worker'

function basic (x: number) {
  return x + 1
}

function chain (x: number) {
  if (x) {
    return true
  }
  throw new Error("x is falsy")
}

function forever () {
  let i = 1
  while (i) {
    ++i
  }
  return i
}

expose({ basic, chain, forever })
