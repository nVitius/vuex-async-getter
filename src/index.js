import TinyEmitter from 'tiny-emitter'
import hash from 'object-hash'

const EventBus = new TinyEmitter()

const pluginState = {
  throttle: {}
}

export function dispatch(module, action, args, { throttle } = { throttle: 'none' }) {
  EventBus.emit('dispatch', { module, action, args, throttle })
}

export default function createGetterDispatch() {
  return store => {
    EventBus.on('dispatch', async ({ module , action, args, throttle } = { throttle: 'none' }) => {
      if (throttle === 'none')
        store.dispatch(`${module ? module : ''}/${action}`, args)

      let key
      if (throttle === 'action')
        key = `${module}_${action}`
      else if (throttle === 'args')
        key = hash({ module, action, ...args })

      if (pluginState.throttle[key])
        return

      pluginState.throttle[key] = true
      await store.dispatch(`${module ? module : ''}/${action}`, args)
      pluginState.throttle[key] = false
    })
  }
}
