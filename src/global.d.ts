declare global {
  type ControlMessageData = {
    type: 'control'
    name: string
    args: any[]
  }
  type SuccessMessageData = {
    type: 'success'
    result: any
    transferables: ArrayBuffer[]
  }
  type ErrorMessageData = {
    type: 'error'
    error: {
      name: string
      message: string
    }
  }
  type MessageData = ControlMessageData | SuccessMessageData | ErrorMessageData

  interface Window {
    Module: {
      onRuntimeInitialized: () => void
      locateFile: (path: string, prefix: string) => string
    }
  }
}

export {}
