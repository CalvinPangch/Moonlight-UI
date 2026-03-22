import { fireEvent, render, screen } from '@testing-library/react'
import { DataGrid } from './DataGrid'

type Row = { id: number; name: string; age: number }

const rows: Row[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 20 },
]

const columns = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'age', headerName: 'Age', sortable: true, filterable: true },
] as const

describe('DataGrid', () => {
  it('renders rows and supports sorting', () => {
    const { container } = render(<DataGrid rowData={rows} columnDefs={columns as never} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Age/i }))

    const text = container.textContent ?? ''
    expect(text.indexOf('Bob')).toBeLessThan(text.indexOf('Alice'))
  })

  it('supports filtering and row selection', () => {
    const onSelectionChanged = vi.fn()
    render(
      <DataGrid
        rowData={rows}
        columnDefs={columns as never}
        rowSelection="checkbox"
        onSelectionChanged={onSelectionChanged}
      />,
    )

    const filters = screen.getAllByPlaceholderText(/Filter|100/i)
    fireEvent.change(filters[0], { target: { value: 'Bob' } })

    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Select row 1'))
    expect(onSelectionChanged).toHaveBeenCalled()
  })

  it('supports pagination controls', () => {
    render(
      <DataGrid
        rowData={rows}
        columnDefs={columns as never}
        pagination
        pageSize={1}
        pageSizeOptions={[1, 2]}
      />,
    )

    expect(screen.getByText(/Page 1 \/ 2/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText(/Page 2 \/ 2/)).toBeInTheDocument()
  })
})
