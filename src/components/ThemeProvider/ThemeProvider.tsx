import React from 'react'
import '../../tokens/tokens.css'

export interface ThemeProviderProps {
  children: React.ReactNode
  className?: string
}

export function ThemeProvider({ children, className }: ThemeProviderProps) {
  return (
    <div
      className={`moonlight-theme${className ? ` ${className}` : ''}`}
      style={{
        fontFamily: 'var(--font-family-base)',
        color: 'var(--color-text-primary)',
        background: 'var(--color-background)',
      }}
    >
      {children}
    </div>
  )
}
