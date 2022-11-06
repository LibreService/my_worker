type Task = {
  name: string
  args: any[]
  transferableIndices: number[]
  resolve: (value: any) => void
  reject: (reason: any) => void
}

class TaskSkippedError extends Error {}

class RunningTaskSkippedError extends TaskSkippedError {
  constructor (...params: any[]) {
    super(...params)
    this.name = 'RunningTaskSkippedError'
  }
}

class PendingTaskSkippedError extends TaskSkippedError {
  constructor (...params: any[]) {
    super(...params)
    this.name = 'PendingTaskSkippedError'
  }
}

class RentedBuffer {
  buffer: ArrayBuffer

  constructor (buffer: ArrayBuffer) {
    this.buffer = buffer
  }
}

/**
 * Worker class for pure functions,
 */
class LambdaWorker {
  worker: Worker
  #scriptURL: string
  #queue: Task[] = []
  #running: Task | null = null
  #commandHandlers: { [key: string]: ((...args: any[]) => void) | undefined } = {}

  /**
   * @param scriptURL - The URL of the worker script
   */
  constructor (scriptURL: string) {
    this.#scriptURL = scriptURL
    this.worker = new Worker(scriptURL)
    this.#setUp()
  }

  #setUp () {
    this.worker.onmessage = (msg: MessageEvent<MessageData>) => {
      const { type } = msg.data
      if (type === 'control') {
        const { name, args } = msg.data
        const handler = this.#commandHandlers[name]
        if (handler) {
          handler(...args)
        } else {
          console.warn(`No handler for command ${name}`)
        }
      } else {
        const { args, transferableIndices, resolve, reject } = this.#running!
        this.#running = null
        this.#next()
        if (type === 'success') {
          const { result, transferables } = msg.data
          transferables.forEach((arrayBuffer, i) => {
            (args[transferableIndices[i]] as RentedBuffer).buffer = arrayBuffer
          })
          resolve(result)
        } else {
          const { name, message } = msg.data.error
          const error = new Error(message) // reconstruct Error for webkit
          error.name = name
          reject(error)
        }
      }
    }
  }

  #run (task: Task) {
    const { name, args, transferableIndices } = task
    const transferables: Transferable[] = []
    const unwrappedArgs = args.map((arg, i) => {
      if (arg.constructor === RentedBuffer) {
        transferableIndices.push(i)
        transferables.push(arg.buffer)
        return arg.buffer
      }
      return arg
    })
    this.#running = task
    this.worker.postMessage({ name, args: unwrappedArgs, transferableIndices }, transferables)
  }

  #next () {
    if (this.#queue.length) {
      const task = this.#queue.shift()!
      this.#run(task)
    }
  }

  #schedule (task: Task) {
    if (this.#running) {
      this.#queue.push(task)
    } else {
      this.#run(task)
    }
  }

  /**
   * Registers a worker function in main thread.
   *
   * @param name - The function name
   * @returns A wrapper function for the worker function of the name
   */
  register (name: string) {
    return (...args: any[]) =>
      new Promise<any>((resolve, reject) =>
        this.#schedule({ name, args, transferableIndices: [], resolve, reject }))
  }

  #killCurrent () {
    if (!this.#running) {
      return false
    }
    this.worker.terminate()
    const { reject } = this.#running
    reject(new RunningTaskSkippedError('Running task skipped.'))
    this.#running = null
    return true
  }

  /**
   * Skips the current function.
   *
   * @returns Whether a running function is skipped
   */
  skip () {
    if (!this.#killCurrent()) {
      return false
    }
    this.worker = new Worker(this.#scriptURL)
    this.#setUp()
    this.#next()
    return true
  }

  /**
   * Skips all functions.
   *
   * @returns Whether any functions are skipped
   */
  skipAll () {
    if (!this.#killCurrent()) {
      return false
    }
    for (const { reject } of this.#queue) {
      reject(new PendingTaskSkippedError('Pending task skipped.'))
    }
    this.#queue = []
    this.worker = new Worker(this.#scriptURL)
    this.#setUp()
    return true
  }

  /**
   * Set callback when receiving signal from a control function.
   *
   * @param name - The name of the control function
   * @param callback The callback
   */
  control (name: string, callback: (...args: any[]) => void) {
    this.#commandHandlers[name] = callback
  }
}

export { LambdaWorker, TaskSkippedError, RunningTaskSkippedError, PendingTaskSkippedError, RentedBuffer }
