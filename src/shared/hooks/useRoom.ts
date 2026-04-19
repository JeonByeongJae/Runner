import { useState, useEffect } from 'react'

export function useRoom<T>(
  roomId: string | null,
  subscribe: (roomId: string, cb: (data: T | null) => void) => () => void
) {
  const [room, setRoom] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribe(roomId, data => {
      setRoom(data)
      setLoading(false)
    })
    return unsubscribe
  }, [roomId, subscribe])

  return { room, loading }
}
