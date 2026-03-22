import * as Moonlight from './index'

describe('library exports', () => {
  it('exports primary components', () => {
    expect(Moonlight.ThemeProvider).toBeDefined()
    expect(Moonlight.Button).toBeDefined()
    expect(Moonlight.Card).toBeDefined()
    expect(Moonlight.Modal).toBeDefined()
    expect(Moonlight.Input).toBeDefined()
    expect(Moonlight.Select).toBeDefined()
    expect(Moonlight.DataGrid).toBeDefined()
    expect(Moonlight.Chart).toBeDefined()
    expect(Moonlight.ToastProvider).toBeDefined()
  })
})
