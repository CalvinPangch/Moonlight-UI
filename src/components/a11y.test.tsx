import axe from 'axe-core'
import { render } from '@testing-library/react'
import { Button } from './Button/Button'
import { Card } from './Card/Card'
import { Input } from './Input/Input'
import { Modal } from './Modal/Modal'
import { Select } from './Select/Select'

async function expectNoSeriousOrCritical(container: HTMLElement) {
  const results = await axe.run(container)
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(serious).toHaveLength(0)
}

describe('a11y smoke checks', () => {
  it('button/card/input/select/modal have no serious or critical violations', async () => {
    const button = render(<Button>Save</Button>)
    await expectNoSeriousOrCritical(button.container)

    const card = render(<Card header="Head">Body</Card>)
    await expectNoSeriousOrCritical(card.container)

    const input = render(<Input label="Email" placeholder="name@example.com" />)
    await expectNoSeriousOrCritical(input.container)

    const select = render(
      <Select
        options={[
          { label: 'One', value: '1' },
          { label: 'Two', value: '2' },
        ]}
      />,
    )
    await expectNoSeriousOrCritical(select.container)

    const modal = render(
      <Modal isOpen onClose={() => {}}>
        <button type="button">Action</button>
      </Modal>,
    )
    await expectNoSeriousOrCritical(modal.container)
  })
})
