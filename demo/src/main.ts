import { RentedBuffer } from '@libreservice/my-worker'
import { basic, asynchronous, chain, forever, xor, lambdaWorker } from './workerAPI'

(async () => {
  console.log(await basic(0)) // 1

  console.log(await asynchronous()) // 0

  await chain(1).then(r => console.log(r)) // true
  await chain(0).catch(e => console.error(`${e.name}: ${e.message}`)) // Error: x is falsy

  forever()
  let promise: Promise<any> = basic(0)
  lambdaWorker.skip() // Without it, the worker will hang
  console.log(await promise) // 1

  forever()
  forever()
  lambdaWorker.skipAll() // Skip all scheduled tasks
  console.log(await basic(0)) // 1

  const rentedBuffer = new RentedBuffer(new ArrayBuffer(4))
  promise = xor(rentedBuffer, 3)
  console.log(rentedBuffer.buffer.byteLength) // 0, if we assume it is executed before worker function
  await promise
  console.log(rentedBuffer.buffer.byteLength) // 4
  console.log(new Uint8Array(rentedBuffer.buffer).join(', ')) // 3, 3, 3, 3
})()
