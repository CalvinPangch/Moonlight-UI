import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Alert,
  Badge,
  Button,
  Card,
  Chart,
  DataGrid,
  Input,
  Modal,
  Select,
  Sidebar,
  Tabs,
  ThemeProvider,
  ToastProvider,
  Tooltip,
  useToast,
} from './index'
import type { ColDef } from './components/DataGrid'

type PipelineRow = {
  id: string
  team: string
  owner: string
  stage: 'Concept' | 'Build' | 'Review' | 'Launch'
  velocity: number
  qa: string
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: 'OV' },
  {
    id: 'library',
    label: 'Library',
    icon: 'LB',
    children: [
      { id: 'foundations', label: 'Foundations' },
      { id: 'patterns', label: 'Patterns' },
    ],
  },
  { id: 'analytics', label: 'Analytics', icon: 'AN' },
  { id: 'ship', label: 'Ship Log', icon: 'SL' },
]

const velocityData = [
  { month: 'Jan', adoption: 28, revenue: 19 },
  { month: 'Feb', adoption: 34, revenue: 24 },
  { month: 'Mar', adoption: 42, revenue: 29 },
  { month: 'Apr', adoption: 49, revenue: 31 },
  { month: 'May', adoption: 58, revenue: 38 },
  { month: 'Jun', adoption: 66, revenue: 44 },
]

const trafficMix = [
  { segment: 'Product teams', value: 46 },
  { segment: 'Design systems', value: 24 },
  { segment: 'Agencies', value: 18 },
  { segment: 'Startups', value: 12 },
]

const pipelineRows: PipelineRow[] = [
  { id: 'ML-201', team: 'Foundations', owner: 'Avery', stage: 'Build', velocity: 92, qa: 'Stable' },
  { id: 'ML-204', team: 'Charts', owner: 'Nora', stage: 'Review', velocity: 76, qa: 'Needs pass' },
  { id: 'ML-208', team: 'Navigation', owner: 'Kai', stage: 'Launch', velocity: 98, qa: 'Green' },
  { id: 'ML-211', team: 'Inputs', owner: 'Mina', stage: 'Concept', velocity: 54, qa: 'Pending' },
]

const pipelineColumns: ColDef<PipelineRow>[] = [
  { field: 'id', headerName: 'Token', width: 120, pinned: 'left' },
  { field: 'team', headerName: 'Stream', width: 160 },
  { field: 'owner', headerName: 'Owner', width: 140 },
  { field: 'stage', headerName: 'Stage', width: 140 },
  { field: 'velocity', headerName: 'Velocity', width: 120 },
  { field: 'qa', headerName: 'QA', width: 140 },
]

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        display: 'inline-grid',
        placeItems: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--ml-border-subtle)',
        color: 'var(--ml-primary-strong)',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.08em',
      }}
    >
      {children}
    </span>
  )
}

function DemoCanvas() {
  const toast = useToast()
  const [activeNav, setActiveNav] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [releaseTrack, setReleaseTrack] = useState('cinematic')
  const [query, setQuery] = useState('Refine hierarchy and hover states')

  const tabs = useMemo(
    () => [
      {
        id: 'foundation',
        label: 'Foundation',
        content: (
          <div style={{ display: 'grid', gap: 'var(--ml-space-3)' }}>
            <p style={{ color: 'var(--ml-text-secondary)' }}>
              Rebalanced the library around layered surfaces, larger touch targets, and a cleaner editorial type scale.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ml-space-2)' }}>
              <Badge variant="info" dot>Glass Surface</Badge>
              <Badge variant="success" dot>44px Targets</Badge>
              <Badge variant="warning" dot>Reduced Motion Safe</Badge>
            </div>
          </div>
        ),
      },
      {
        id: 'motion',
        label: 'Motion',
        content: (
          <p style={{ color: 'var(--ml-text-secondary)' }}>
            Interaction timing now uses a consistent ease curve, subtle lift on hover, and stronger focus rings for keyboard clarity.
          </p>
        ),
      },
      {
        id: 'contrast',
        label: 'Contrast',
        content: (
          <p style={{ color: 'var(--ml-text-secondary)' }}>
            Dark surfaces are separated with translucency, border strength, and restrained glow instead of raw saturation.
          </p>
        ),
      },
    ],
    [],
  )

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)' }}>
      <Sidebar
        title="Moonlight UI"
        items={sidebarItems.map((item) => ({
          ...item,
          icon: <IconChip>{item.icon}</IconChip>,
        }))}
        value={activeNav}
        onChange={setActiveNav}
      />

      <main style={{ padding: 'var(--ml-space-6)', display: 'grid', gap: 'var(--ml-space-6)' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--ml-border)',
            borderRadius: 'var(--ml-radius-lg)',
            padding: 'var(--ml-space-8)',
            background:
              'radial-gradient(circle at top right, rgba(142,242,255,0.16), transparent 28%), linear-gradient(135deg, rgba(124,184,255,0.16), rgba(155,124,255,0.08) 52%, rgba(6,17,31,0.82) 100%)',
            boxShadow: 'var(--ml-shadow)',
          }}
        >
          <div style={{ maxWidth: 760, display: 'grid', gap: 'var(--ml-space-5)' }}>
            <Badge variant="info">Design System Redesign</Badge>
            <div style={{ display: 'grid', gap: 'var(--ml-space-3)' }}>
              <h1 style={{ fontSize: 'var(--ml-font-size-4xl)', lineHeight: 0.95 }}>
                A sharper component library for product teams that ship in the dark.
              </h1>
              <p style={{ color: 'var(--ml-text-secondary)', fontSize: '1.05rem', maxWidth: 620 }}>
                Moonlight UI now reads like a deliberate system: cinematic surfaces, stronger hierarchy, clearer interaction states, and demo screens that feel like a real product instead of a token sandbox.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ml-space-3)' }}>
              <Button onClick={() => toast.push({ title: 'Preview ready', message: 'The redesigned demo surface is live in the Vite preview.', variant: 'success' })}>
                Trigger Toast
              </Button>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open Release Notes
              </Button>
              <Tooltip content="Storybook remains the best way to audit every component state.">
                <Button variant="ghost">Inspect System</Button>
              </Tooltip>
            </div>
          </div>
        </section>

        <Alert variant="info">
          <div style={{ display: 'grid', gap: 4 }}>
            <strong style={{ color: 'var(--ml-text)' }}>System direction</strong>
            <span style={{ color: 'inherit' }}>
              The redesign prioritizes accessibility, larger targets, calmer contrast, and a more premium editorial rhythm across primitives and data UI.
            </span>
          </div>
        </Alert>

        <section style={{ display: 'grid', gap: 'var(--ml-space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            ['Adoption lift', '+38%', 'success'],
            ['Visual debt removed', '27 patterns', 'info'],
            ['Interaction target', '44px minimum', 'warning'],
          ].map(([label, value, variant]) => (
            <Card key={label} variant="elevated" header={label}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ml-text)' }}>{value}</div>
                <Badge variant={variant as 'success' | 'info' | 'warning'} dot>{label}</Badge>
              </div>
            </Card>
          ))}
        </section>

        <section style={{ display: 'grid', gap: 'var(--ml-space-5)', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.9fr)' }}>
          <Card
            variant="elevated"
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ml-space-3)', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--ml-text)', marginBottom: 2 }}>Adoption Curve</div>
                  <div style={{ fontSize: 13, color: 'var(--ml-text-secondary)' }}>Design and engineering alignment across six sprints.</div>
                </div>
                <Badge variant="info">Live Preview</Badge>
              </div>
            }
          >
            <Chart
              type="area"
              data={velocityData}
              series={[
                { dataKey: 'adoption', name: 'Adoption' },
                { dataKey: 'revenue', name: 'Ship Rate' },
              ]}
              xAxis={{ dataKey: 'month', label: 'Month' }}
              yAxis={{ label: 'Index' }}
              height={320}
              smooth
              showLegend
              showTooltip
            />
          </Card>

          <Card header="Control Room" footer={<span style={{ color: 'var(--ml-text-tertiary)', fontSize: 12 }}>Every input now uses clearer labels, stronger focus treatment, and larger field height.</span>}>
            <div style={{ display: 'grid', gap: 'var(--ml-space-4)' }}>
              <Input
                label="Current refinement brief"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                helperText="Use one sentence that design and engineering can both action."
              />
              <Select
                label="Release track"
                value={releaseTrack}
                onChange={(value) => setReleaseTrack(String(value))}
                options={[
                  { label: 'Cinematic', value: 'cinematic' },
                  { label: 'Quiet minimal', value: 'minimal' },
                  { label: 'Data dense', value: 'dense' },
                ]}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ml-space-3)' }}>
                <Button fullWidth>Publish Tokens</Button>
                <Button variant="secondary" fullWidth>Review States</Button>
              </div>
            </div>
          </Card>
        </section>

        <section style={{ display: 'grid', gap: 'var(--ml-space-5)', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <Card header="Usage Mix">
            <Chart
              type="pie"
              data={trafficMix}
              series={[{ dataKey: 'value', name: 'Audience' }]}
              xAxis={{ dataKey: 'segment' }}
              donutCutout={0.6}
              height={300}
              legendLayout="vertical"
              showLegend
              showTooltip
            />
          </Card>
          <Card header="System Notes">
            <Tabs items={tabs} />
          </Card>
        </section>

        <Card
          variant="elevated"
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ml-space-3)', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--ml-text)', marginBottom: 2 }}>Pipeline Snapshot</div>
                <div style={{ fontSize: 13, color: 'var(--ml-text-secondary)' }}>Data surfaces now share the same layered shell as the rest of the library.</div>
              </div>
              <Badge variant="success">4 Active Streams</Badge>
            </div>
          }
        >
          <DataGrid
            rowData={pipelineRows}
            columnDefs={pipelineColumns}
            height={280}
            pagination
            pageSize={4}
            rowSelection="checkbox"
          />
        </Card>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <div style={{ display: 'grid', gap: 'var(--ml-space-4)' }}>
            <Badge variant="info">Release Notes</Badge>
            <h2 style={{ fontSize: '2rem' }}>Moonlight UI is now a clearer, stronger default.</h2>
            <p style={{ color: 'var(--ml-text-secondary)' }}>
              This pass upgrades the entire visual foundation: typography, color contrast, touch sizing, surface layering, focus rings, modal depth, and the demo shell itself.
            </p>
            <div style={{ display: 'flex', gap: 'var(--ml-space-3)', flexWrap: 'wrap' }}>
              <Button onClick={() => setModalOpen(false)}>Close</Button>
              <Button variant="secondary" onClick={() => toast.push({ title: 'Storybook tip', message: 'Run npm run storybook to inspect the redesigned components individually.', variant: 'info' })}>
                Storybook Tip
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <DemoCanvas />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
