import { expose, control } from '@libreservice/my-worker'

function basic (x: number) {
  return x + 1
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

expose({ basic, chain, forever })
