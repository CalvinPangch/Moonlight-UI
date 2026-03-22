import { fireEvent, render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders variants and sizes', () => {
    render(<Button variant="danger" size="lg">Delete</Button>)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls onClick when enabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows spinner and prevents click while loading', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Loading
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
