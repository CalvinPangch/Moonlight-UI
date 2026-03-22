import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Input } from './Input'

describe('Input', () => {
  it('works as a controlled input', () => {
    function Controlled() {
      const [value, setValue] = useState('start')
      return <Input aria-label="Name" value={value} onChange={(e) => setValue(e.target.value)} />
    }

    render(<Controlled />)
    const input = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement
    expect(input.value).toBe('start')

    fireEvent.change(input, { target: { value: 'next' } })
    expect(input.value).toBe('next')
  })

  it('shows error state and disabled state', () => {
    render(<Input aria-label="Email" error="Required" disabled />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled()
  })
})

import { Textarea } from './Input'

describe('Input extra branches', () => {
  it('renders helper text, prefix/suffix, and textarea', () => {
    render(
      <>
        <Input aria-label="Search" helperText="Type to filter" prefix={<span>$</span>} suffix={<span>%</span>} />
        <Textarea aria-label="Notes" helperText="Optional" />
      </>,
    )

    expect(screen.getByText('Type to filter')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument()
  })
})
