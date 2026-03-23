import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, Button, Card, Badge, Alert } from './index'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <div style={{ padding: 'var(--ml-space-8)', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--ml-space-6)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--ml-space-2)', letterSpacing: '-0.02em' }}>
            Moonlight UI
          </h1>
          <p style={{ color: 'var(--ml-text-secondary)', marginBottom: 'var(--ml-space-6)' }}>
            Dark-first component library for admin dashboards — run <code style={{ fontFamily: 'var(--ml-font-mono)', background: 'var(--ml-surface-alt)', padding: '2px 6px', borderRadius: 4 }}>npm run storybook</code> to explore all components.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 'var(--ml-space-4)' }}>
          <Alert variant="info" title="Design system unified">
            Token system migrated to a single dark-first <code>--ml-*</code> namespace. All components now share the Moonlight dark palette.
          </Alert>

          <Card header="Component Preview">
            <div style={{ display: 'flex', gap: 'var(--ml-space-3)', flexWrap: 'wrap', marginBottom: 'var(--ml-space-4)' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--ml-space-2)', flexWrap: 'wrap' }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="info" dot>In Progress</Badge>
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Review</Badge>
              <Badge variant="error" dot>Critical</Badge>
            </div>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  </React.StrictMode>,
)
