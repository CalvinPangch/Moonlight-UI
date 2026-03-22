import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './index'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <div style={{ padding: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>
          Moonlight UI
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Dark-first UI framework — run Storybook to explore components.
        </p>
      </div>
    </ThemeProvider>
  </React.StrictMode>,
)
