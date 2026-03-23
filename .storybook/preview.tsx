import React from 'react'
import type { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import '../src/styles/tokens.css'
import '../src/styles/theme.css'
import './nexus-shell.css'

const navGroups = [
  { label: 'Foundation', items: ['ThemeProvider', 'Button', 'Card', 'Badge', 'Avatar', 'Spinner'] },
  { label: 'Inputs', items: ['Input', 'Select', 'Tabs', 'Tooltip', 'Modal'] },
  { label: 'Feedback', items: ['Alert', 'Toast'] },
  { label: 'Data', items: ['Chart', 'DataGrid'] },
  { label: 'Navigation', items: ['Sidebar'] },
]

function getAccent(title: string) {
  if (title.includes('Data')) {
    return 'nexus-accent-violet'
  }
  if (title.includes('Feedback')) {
    return 'nexus-accent-amber'
  }
  if (title.includes('Forms') || title.includes('Input')) {
    return 'nexus-accent-cyan'
  }
  return 'nexus-accent-cyan'
}

function PreviewShell({ Story, context }: { Story: Preview['decorators'][number] extends infer _ ? React.ComponentType : any; context: any }) {
  const title = context.title ?? 'Moonlight UI'
  const storyName = context.name ?? 'Story'
  const activeLeaf = title.split('/').pop() ?? title
  const section = title.split('/')[0] ?? 'Core'

  return (
    <div className="nexus-shell">
      <div className="nexus-shell__backdrop" />
      <aside className="nexus-shell__sidebar">
        <div className="nexus-shell__brand">
          <div className="nexus-shell__brand-mark">
            <span>MOON</span>
          </div>
          <div>
            <div className="nexus-shell__eyebrow">Storybook</div>
            <div className="nexus-shell__brand-name">Moonlight Nexus</div>
          </div>
        </div>

        <nav className="nexus-shell__nav" aria-label="Story categories">
          {navGroups.map((group) => (
            <div key={group.label} className="nexus-shell__nav-group">
              <div className="nexus-shell__nav-label">{group.label}</div>
              <div className="nexus-shell__nav-items">
                {group.items.map((item) => {
                  const active = activeLeaf.toLowerCase().includes(item.toLowerCase())
                  return (
                    <div key={item} className={`nexus-shell__nav-item${active ? ' is-active' : ''}`}>
                      <span className="nexus-shell__nav-dot" />
                      <span>{item}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="nexus-shell__main">
        <header className="nexus-shell__hero">
          <div className="nexus-shell__hero-copy">
            <div className="nexus-shell__eyebrow">Component Operations</div>
            <h1>{activeLeaf}</h1>
            <p>
              {section} surface, rendered inside a Nexus-inspired dashboard shell so components can be reviewed in a more realistic dark admin context.
            </p>
          </div>

          <div className="nexus-shell__metrics">
            <div className="nexus-shell__metric-card">
              <span className="nexus-shell__metric-label">Section</span>
              <strong>{section}</strong>
            </div>
            <div className={`nexus-shell__metric-card ${getAccent(title)}`}>
              <span className="nexus-shell__metric-label">Story</span>
              <strong>{storyName}</strong>
            </div>
            <div className="nexus-shell__metric-card">
              <span className="nexus-shell__metric-label">Mode</span>
              <strong>Dark Admin</strong>
            </div>
          </div>
        </header>

        <section className="nexus-shell__canvas-wrap">
          <div className="nexus-shell__toolbar">
            <div>
              <div className="nexus-shell__canvas-title">{title}</div>
              <div className="nexus-shell__canvas-subtitle">Interactive review canvas</div>
            </div>
            <div className="nexus-shell__pills">
              <span className="nexus-shell__pill">Neon Glass</span>
              <span className="nexus-shell__pill">Responsive</span>
              <span className="nexus-shell__pill">A11y Safe</span>
            </div>
          </div>

          <div className="nexus-shell__canvas">
            <Story />
          </div>
        </section>
      </main>
    </div>
  )
}

const preview: Preview = {
  decorators: [
    (Story, context) => <PreviewShell Story={Story} context={context} />,
  ],
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Core', 'Forms', 'Feedback', 'Data Display'],
      },
    },
    backgrounds: {
      disable: true,
    },
    docs: {
      theme: themes.dark,
    },
  },
}

export default preview
