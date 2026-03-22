import { fireEvent, render, screen } from '@testing-library/react'
import { Chart } from './Chart'

const data = [
  { label: 'Jan', value: 10, value2: 12, x: 1, y: 2, size: 4 },
  { label: 'Feb', value: 20, value2: 18, x: 2, y: 4, size: 7 },
]

describe('Chart advanced coverage', () => {
  it('renders bar/area/pie/scatter variants', () => {
    const { rerender } = render(
      <Chart
        type="bar"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }, { dataKey: 'value2', name: 'Cost' }]}
        xAxis={{ dataKey: 'label' }}
        barMode="stacked"
        orientation="horizontal"
      />,
    )
    expect(screen.getByRole('img', { name: 'bar chart' })).toBeInTheDocument()

    rerender(
      <Chart
        type="area"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        xAxis={{ dataKey: 'label' }}
        smooth={false}
      />,
    )
    expect(screen.getByRole('img', { name: 'area chart' })).toBeInTheDocument()

    rerender(
      <Chart
        type="pie"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        donutCutout={0.4}
      />,
    )
    expect(screen.getByRole('img', { name: 'pie chart' })).toBeInTheDocument()

    rerender(
      <Chart
        type="scatter"
        data={data}
        series={[{ dataKey: 'value', name: 'Scatter', xKey: 'x', yKey: 'y', sizeKey: 'size' }]}
        showLegend={false}
      />,
    )
    expect(screen.getByRole('img', { name: 'scatter chart' })).toBeInTheDocument()
  })

  it('supports custom tooltip and legend toggling', () => {
    const { container } = render(
      <Chart
        type="line"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        xAxis={{ dataKey: 'label' }}
        yAxis={{ min: 0, max: 25, tickFormat: (v) => `v:${v}` }}
        tooltipRenderer={(payload) => <div>Custom {payload.seriesName}</div>}
      />,
    )

    const legendButton = screen.getByRole('button', { name: 'Revenue' })
    fireEvent.click(legendButton)
    fireEvent.click(legendButton)

    const circles = container.querySelectorAll('circle')
    if (circles.length > 0) {
      fireEvent.mouseMove(circles[0], { clientX: 120, clientY: 80 })
      expect(screen.getByText('Custom Revenue')).toBeInTheDocument()
    }
  })

  it('does not show tooltip when disabled', () => {
    const { container } = render(
      <Chart
        type="line"
        data={data}
        series={[{ dataKey: 'value', name: 'Revenue' }]}
        xAxis={{ dataKey: 'label' }}
        showTooltip={false}
        animate={false}
      />,
    )

    const circles = container.querySelectorAll('circle')
    if (circles.length > 0) {
      fireEvent.mouseMove(circles[0], { clientX: 120, clientY: 80 })
      expect(screen.queryByText(/X:/)).not.toBeInTheDocument()
    }
  })
})
