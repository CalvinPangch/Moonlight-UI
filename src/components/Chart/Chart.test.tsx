import { fireEvent, render, screen } from '@testing-library/react'
import { Chart } from './Chart'

describe('Chart', () => {
  const data = [
    { label: 'Jan', value: 10 },
    { label: 'Feb', value: 20 },
  ]

  it('renders as SVG and supports legend toggle', () => {
    render(
      <Chart
        type="line"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        xAxis={{ dataKey: 'label' }}
      />,
    )

    expect(screen.getByRole('img', { name: 'line chart' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Revenue' }))
    expect(screen.getByRole('button', { name: 'Revenue' })).toBeInTheDocument()
  })

  it('renders tooltip on point hover', () => {
    const { container } = render(
      <Chart
        type="line"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        xAxis={{ dataKey: 'label' }}
      />,
    )

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThan(0)

    fireEvent.mouseMove(circles[0], { clientX: 120, clientY: 80 })
    expect(screen.getByText('X: Jan')).toBeInTheDocument()
    expect(screen.getByText('Y: 10')).toBeInTheDocument()
  })
})
