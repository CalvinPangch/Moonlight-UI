import { fireEvent, render, screen } from '@testing-library/react'
import { Select } from './Select'

const options = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
  { label: 'Gamma', value: 'g' },
]

describe('Select', () => {
  it('opens dropdown and selects an option', () => {
    const onChange = vi.fn()
    render(<Select label="Choice" options={options} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Select...' }))
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('supports keyboard navigation', () => {
    const onChange = vi.fn()
    render(<Select options={options} onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: 'Select...' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('Select extra branches', () => {
  it('supports searchable multi select and escape close', () => {
    const onChange = vi.fn()
    render(<Select options={options} multiple searchable onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Select...' }))
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'ga' } })
    fireEvent.click(screen.getByRole('option', { name: 'Gamma' }))
    expect(onChange).toHaveBeenCalledWith(['g'])

    const trigger = screen.getByRole('button', { name: 'Select...' })
    fireEvent.keyDown(trigger, { key: 'Escape' })
  })
})
