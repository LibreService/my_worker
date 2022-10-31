import { expose, control } from '@libreservice/my-worker'

function basic (x: number) {
  return x + 1
}

async function asynchronous () {
  return 0
}

const predictError = control('predictError')
const predictErrorUnknown = control('predictErrorUnknown')

function chain (x: number) {
  if (x) {
    return true
  }
  predictError('Something wrong may happen')
  predictErrorUnknown('This command is mistyped')
  throw new Error('x is falsy')
}

function forever () {
  let i = 1
  while (i) {
    ++i
  }
  return i
}

function xor (arrayBuffer: ArrayBuffer, n: number) {
  const u8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < u8Array.length; ++i) {
    u8Array[i] ^= n
  }
}

expose({ basic, asynchronous, chain, forever, xor })
