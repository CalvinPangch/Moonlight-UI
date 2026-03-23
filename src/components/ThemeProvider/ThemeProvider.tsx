import React from 'react'
import '../../styles/tokens.css'
import '../../styles/theme.css'
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
        fontFamily: 'var(--ml-font-family)',
        color: 'var(--ml-text)',
        background: 'var(--ml-bg)',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  )
}
