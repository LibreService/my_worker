import { basic, chain, forever, lambdaWorker } from './workerAPI'

(async () => {
  console.log(await basic(0)) // 1

  await chain(1).then(r => console.log(r)) // true
  await chain(0).catch(e => console.error(`${e.name}: ${e.message}`)) // Error: x is falsy

  forever()
  const promise = basic(0)
  lambdaWorker.skip() // Without it, the worker will hang
  console.log(await promise) // 1

  forever()
  forever()
  lambdaWorker.skipAll() // Skip all scheduled tasks
  console.log(await basic(0)) // 1
})()
