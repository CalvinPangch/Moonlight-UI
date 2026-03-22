import type { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider } from './ThemeProvider'

const meta: Meta<typeof ThemeProvider> = {
  title: 'Foundation/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Provides Moonlight UI design tokens as CSS custom properties. Wrap your app (or a section) with ThemeProvider to activate the dark-first Moonlight palette.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemeProvider>

const ColorSwatch = ({
  name,
  variable,
  withBorder = false,
}: {
  name: string
  variable: string
  withBorder?: boolean
}) => (
  <div
    style={{
      background: `var(${variable})`,
      border: withBorder ? '1px solid var(--color-border)' : 'none',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--spacing-3)',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-1)',
    }}
  >
    <strong>{name}</strong>
    <code style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
      {variable}
    </code>
  </div>
)

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-2)',
            marginTop: 0,
          }}
        >
          Moonlight UI
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--spacing-6)',
            marginTop: 0,
          }}
        >
          Dark-first design tokens — colors, typography, spacing, radius, shadows.
        </p>

        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Color Palette
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          <ColorSwatch name="Background" variable="--color-background" withBorder />
          <ColorSwatch name="Surface" variable="--color-surface" withBorder />
          <ColorSwatch name="Border" variable="--color-border" withBorder />
          <ColorSwatch name="Accent" variable="--color-accent" />
          <ColorSwatch name="Error" variable="--color-error" />
          <ColorSwatch name="Warning" variable="--color-warning" />
          <ColorSwatch name="Success" variable="--color-success" />
        </div>

        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Typography Scale
        </h3>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-2)',
          }}
        >
          {(
            [
              ['3xl', '1.875rem'],
              ['2xl', '1.5rem'],
              ['xl', '1.25rem'],
              ['lg', '1.125rem'],
              ['base', '1rem'],
              ['sm', '0.875rem'],
              ['xs', '0.75rem'],
            ] as const
          ).map(([scale, size]) => (
            <div
              key={scale}
              style={{ fontSize: `var(--font-size-${scale})`, lineHeight: 1.4 }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {scale} ({size}):{' '}
              </span>
              The quick brown fox
            </div>
          ))}
        </div>
      </div>
    ),
  },
}

export const Minimal: Story = {
  args: {
    children: (
      <div style={{ padding: 'var(--spacing-4)' }}>
        <p>ThemeProvider is active — CSS custom properties are injected.</p>
      </div>
    ),
  },
}
