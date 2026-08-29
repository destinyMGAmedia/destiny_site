import { renderHook, act } from '@testing-library/react'
import { createElement, useState, useEffect } from 'react'
import { YellowPagesBaseContext, useYellowPagesBase } from './context'

describe('YellowPagesBaseContext', () => {
  it('defaults to /yellowpages when rendered with no Provider', () => {
    const { result } = renderHook(() => useYellowPagesBase())
    expect(result.current).toBe('/yellowpages')
  })
})

describe('useYellowPagesBase', () => {
  it('returns the value supplied by an ancestor Provider', () => {
    const { result } = renderHook(() => useYellowPagesBase(), {
      wrapper: ({ children }) =>
        createElement(YellowPagesBaseContext.Provider, { value: '' }, children),
    })
    expect(result.current).toBe('')
  })

  it('returns a custom base value from the Provider', () => {
    const { result } = renderHook(() => useYellowPagesBase(), {
      wrapper: ({ children }) =>
        createElement(YellowPagesBaseContext.Provider, { value: '/custom-base' }, children),
    })
    expect(result.current).toBe('/custom-base')
  })

  it('reflects a change in the Provider value', () => {
    // renderHook's `wrapper` does not receive the hook's own initialProps/rerender args — it's
    // a static wrapper. To vary the Provider's value across renders, give the wrapper its own
    // state and drive it from a ref the test can mutate, then force a re-render.
    let setBase
    function Wrapper({ children }) {
      const [base, setter] = useState('/yellowpages')
      useEffect(() => {
        setBase = setter
      }, [setter])
      return createElement(YellowPagesBaseContext.Provider, { value: base }, children)
    }

    const { result } = renderHook(() => useYellowPagesBase(), { wrapper: Wrapper })
    expect(result.current).toBe('/yellowpages')

    act(() => setBase('/other'))
    expect(result.current).toBe('/other')
  })
})
