import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders header, body, and footer slots', () => {
    render(
      <Card header={<div>Header</div>} footer={<div>Footer</div>}>
        Body Content
      </Card>,
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
