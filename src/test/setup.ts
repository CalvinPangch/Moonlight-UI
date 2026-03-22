import '@testing-library/jest-dom/vitest'

type ResizeObserverCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void

const observers: Array<{ callback: ResizeObserverCallback }> = []

class ResizeObserverMock {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe() {
    observers.push({ callback: this.callback })
    this.callback([{ contentRect: { width: 800, height: 400 } }])
  }

  unobserve() {}

  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
