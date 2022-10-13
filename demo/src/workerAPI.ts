import { LambdaWorker } from '@libreservice/my-worker'

const lambdaWorker = new LambdaWorker('/worker.js')
const basic: (x: number) => Promise<number> = lambdaWorker.register('basic')
const chain: (x: number) => Promise<boolean> = lambdaWorker.register('chain')
const forever: () => any = lambdaWorker.register('forever')

export { basic, chain, forever, lambdaWorker }
