import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { nativeBankReturnPath } from '#/lib/native-bank-return'

export function NativeBankReturn() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let active = true
    let handledUrl = ''
    let removeListener: (() => Promise<void>) | undefined

    void import('@capacitor/app').then(async ({ App }) => {
      if (!active) return

      const open = (url: string) => {
        if (!active || url === handledUrl) return
        const path = nativeBankReturnPath(url)
        if (!path) return
        if (`${window.location.pathname}${window.location.search}` === path) return
        handledUrl = url
        window.location.replace(path)
      }

      const listener = await App.addListener('appUrlOpen', ({ url }) => open(url))
      if (!active) {
        await listener.remove()
        return
      }
      removeListener = () => listener.remove()
      const launch = await App.getLaunchUrl()
      if (launch?.url) open(launch.url)
    })

    return () => {
      active = false
      void removeListener?.()
    }
  }, [])

  return null
}
