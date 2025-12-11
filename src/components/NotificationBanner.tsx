import { Button } from '@/components/ui/button'

interface NotificationBannerProps {
  permission: NotificationPermission
  onRequestPermission: () => Promise<void>
}

export function NotificationBanner({ permission, onRequestPermission }: NotificationBannerProps) {
  if (permission === 'granted') {
    return null
  }

  return (
    <div className="rounded-lg sm:rounded-xl border border-blue-400/30 dark:border-blue-400/30 bg-blue-500/20 dark:bg-blue-500/20 backdrop-blur-xl text-blue-800 dark:text-blue-100 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm shadow-[0_4px_16px_0_rgba(59,130,246,0.2)]">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <span className="flex-1">
          Activez les notifications pour être alerté en cas de pluie ou de température élevée.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestPermission}
          className="text-xs whitespace-nowrap flex-shrink-0"
        >
          Activer
        </Button>
      </div>
    </div>
  )
}
