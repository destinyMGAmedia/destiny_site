import { renderHook, act } from '@testing-library/react'
import { useYellowPagesUpload } from './useYellowPagesUpload'

const file = new File(['x'], 'logo.png', { type: 'image/png' })

describe('useYellowPagesUpload', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('fetches the signature, uploads to Cloudinary, and returns the result', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ signature: 'sig', timestamp: 1, folder: 'dmga/global/yellowpages', cloudName: 'demo', apiKey: 'key' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ secure_url: 'https://res.cloudinary.com/demo/logo.png' }),
      })

    const { result } = renderHook(() => useYellowPagesUpload())

    let uploadResult
    await act(async () => {
      uploadResult = await result.current.upload(file, 'logo')
    })

    expect(uploadResult).toEqual({ secure_url: 'https://res.cloudinary.com/demo/logo.png' })
    expect(global.fetch.mock.calls[0][0]).toBe('/api/yellowpages/upload-signature?type=logo')
    expect(global.fetch.mock.calls[1][0]).toBe('https://api.cloudinary.com/v1_1/demo/auto/upload')
    expect(result.current.uploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets an error and rethrows when fetching the signature fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false })
    const { result } = renderHook(() => useYellowPagesUpload())

    await act(async () => {
      await expect(result.current.upload(file, 'logo')).rejects.toThrow('Failed to get upload signature')
    })

    expect(result.current.error).toBe('Failed to get upload signature')
    expect(result.current.uploading).toBe(false)
  })

  it('sets an error and rethrows when the Cloudinary upload itself fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ signature: 'sig', timestamp: 1, folder: 'f', cloudName: 'demo', apiKey: 'key' }),
      })
      .mockResolvedValueOnce({ ok: false })

    const { result } = renderHook(() => useYellowPagesUpload())

    await act(async () => {
      await expect(result.current.upload(file, 'photo')).rejects.toThrow('Upload failed')
    })

    expect(result.current.error).toBe('Upload failed')
  })
})
