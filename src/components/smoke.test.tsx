import { act, fireEvent, render, screen } from '@testing-library/react'
import { Alert } from './Alert/Alert'
import { Avatar } from './Avatar/Avatar'
import { Badge } from './Badge/Badge'
import { Sidebar } from './Sidebar/Sidebar'
import { Spinner } from './Spinner/Spinner'
import { Tabs } from './Tabs/Tabs'
import { ThemeProvider } from './ThemeProvider/ThemeProvider'
import { ToastProvider, useToast } from './Toast/Toast'
import { Tooltip } from './Tooltip/Tooltip'

describe('component smoke coverage', () => {
  it('covers alert/avatar/badge/spinner/theme', () => {
    render(
      <ThemeProvider>
        <Alert dismissible>Heads up</Alert>
        <Avatar name="Jane Doe" />
        <Avatar src="/x.png" alt="Profile" />
        <Badge dot>Live</Badge>
        <Spinner size="lg" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Heads up')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByAltText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('covers sidebar/tabs/tooltip', () => {
    const onChange = vi.fn()
    render(
      <>
        <Sidebar
          items={[
            { id: 'dashboard', label: 'Dashboard', children: [{ id: 'overview', label: 'Overview' }] },
            { id: 'reports', label: 'Reports' },
          ]}
          onChange={onChange}
        />

        <Tabs
          items={[
            { id: 'a', label: 'Tab A', content: <div>Panel A</div> },
            { id: 'b', label: 'Tab B', content: <div>Panel B</div> },
          ]}
        />

        <Tooltip content="Tip content">
          <button type="button">Hover me</button>
        </Tooltip>
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reports' }))
    expect(onChange).toHaveBeenCalledWith('reports')

    fireEvent.click(screen.getByRole('button', { name: /</ }))
    fireEvent.click(screen.getByRole('button', { name: />/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))

    const tabB = screen.getByRole('tab', { name: 'Tab B' })
    fireEvent.click(tabB)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B')
    fireEvent.keyDown(tabB, { key: 'ArrowLeft' })
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A')

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Hover me' }))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tip content')
  })

  it('covers toast provider and hook', async () => {
    vi.useFakeTimers()

    function Demo() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() =>
            toast.push({
              title: 'Saved',
              message: 'Changes committed',
              variant: 'success',
            }, 100)
          }
        >
          Push toast
        </button>
      )
    }

    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Push toast' }))
    expect(screen.getByRole('status')).toHaveTextContent('Changes committed')

    act(() => {
      vi.runAllTimers()
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    vi.useRealTimers()
  })
})
