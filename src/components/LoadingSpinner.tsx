'use client'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
}

export function LoadingSpinner({ fullScreen = false, message }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-6">
      {/* Animated rings */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent-full" />
        <div className="absolute inset-2 animate-spin-slow rounded-full border-2 border-accent/20 border-b-accent-bright" style={{ animationDirection: 'reverse' }} />
        <div className="absolute inset-4 animate-pulse-glow rounded-full bg-accent/10" />
        <div className="relative flex h-8 w-8 items-center justify-center">
          <svg className="h-6 w-6 text-accent-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2.5 2.5 0 0 1 0-5C6.5 4 6 9 6 9Zm0 0 3 9h9l3-9H6Zm0 0H3m3 0h3m3 0h3m0 0h3m-3 0 3 9m-3-9H9m3 0h3" />
          </svg>
        </div>
      </div>

      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
      )}

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-accent/20 animate-float-slow" />
        <div className="absolute right-1/3 top-1/4 h-1.5 w-1.5 rounded-full bg-accent/15 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/3 bottom-1/3 h-1 w-1 rounded-full bg-accent/10 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute right-1/4 bottom-1/4 h-2 w-2 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    )
  }

  return (
    <div className="flex h-[60vh] items-center justify-center">
      {content}
    </div>
  )
}
