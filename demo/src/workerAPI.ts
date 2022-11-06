import { LambdaWorker, RentedBuffer } from '@libreservice/my-worker'

const lambdaWorker = new LambdaWorker('/worker.js')
const basic: (x: number) => Promise<number> = lambdaWorker.register('basic')
const asynchronous: () => Promise<number> = lambdaWorker.register('asynchronous')
const chain: (x: number) => Promise<boolean> = lambdaWorker.register('chain')
const forever: () => Promise<any> = lambdaWorker.register('forever')
const xor: (rBuf: RentedBuffer, n: number) => Promise<void> = lambdaWorker.register('xor')

lambdaWorker.control('predictError', (msg: string) => console.log(msg))

export { basic, asynchronous, chain, forever, xor, lambdaWorker }
