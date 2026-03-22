import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('opens and closes via close button and escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <button type="button">Action</button>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('closes on backdrop click and traps focus', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')
    const backdrop = dialog.parentElement
    expect(backdrop).toBeTruthy()

    const closeButton = screen.getByRole('button', { name: 'Close modal' })
    const lastButton = screen.getByRole('button', { name: 'Last' })

    expect(closeButton).toHaveFocus()

    lastButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    closeButton.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(lastButton).toHaveFocus()

    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    }
  })
})
