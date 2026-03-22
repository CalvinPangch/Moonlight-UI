import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { DataGrid, type ColDef, type DataGridRef } from './DataGrid'

type Row = { id: number; name: string; age: number; team: string }

const rows: Row[] = [
  { id: 1, name: 'Alice', age: 31, team: 'GroupOne' },
  { id: 2, name: 'Bob', age: 22, team: 'GroupOne' },
  { id: 3, name: 'Cara', age: 18, team: 'GroupTwo' },
]

const columns: ColDef<Row>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true, resizable: true, pinned: 'left' },
  { field: 'age', headerName: 'Age', sortable: true, filterable: true },
  { field: 'team', headerName: 'Team', sortable: true, filterable: true },
]

describe('DataGrid advanced coverage', () => {
  it('supports grouping collapse and expand', () => {
    const { container } = render(<DataGrid rowData={rows} columnDefs={columns} groupBy="team" />)

    const groupRows = container.querySelectorAll('[class*="groupRow"]')
    expect(groupRows.length).toBeGreaterThan(0)
    expect(screen.getByText('Alice')).toBeInTheDocument()

    fireEvent.click(groupRows[0])
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()

    fireEvent.click(groupRows[0])
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('applies numeric range filtering and shift multi-sort', () => {
    render(<DataGrid rowData={rows} columnDefs={columns} />)

    fireEvent.click(screen.getByRole('button', { name: /Name/i }))
    fireEvent.click(screen.getByRole('button', { name: /Age/i }), { shiftKey: true })

    const filters = screen.getAllByPlaceholderText(/Filter|e.g\./i)
    fireEvent.change(filters[1], { target: { value: '20-30' } })

    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('supports cell editing and emits onCellValueChanged', () => {
    const onCellValueChanged = vi.fn()

    const editableColumns: ColDef<Row>[] = [
      {
        field: 'name',
        headerName: 'Name',
        cellEditor: ({ value, onChange }) => (
          <input
            aria-label="editor"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        ),
      },
      { field: 'age', headerName: 'Age' },
      { field: 'team', headerName: 'Team' },
    ]

    render(
      <DataGrid
        rowData={rows}
        columnDefs={editableColumns}
        onCellValueChanged={onCellValueChanged}
      />,
    )

    fireEvent.doubleClick(screen.getByText('Alice'))
    fireEvent.change(screen.getByLabelText('editor'), { target: { value: 'Alicia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onCellValueChanged).toHaveBeenCalled()
  })

  it('triggers infinite load and csv export', () => {
    const onLoadMore = vi.fn()
    const ref = createRef<DataGridRef>()

    const createObjectURL = vi.fn(() => 'blob://mock')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    const { container } = render(
      <DataGrid
        ref={ref}
        rowData={rows}
        columnDefs={columns}
        infiniteScroll
        onLoadMore={onLoadMore}
        hasMoreRows
        isLoadingMore={false}
        height={120}
      />,
    )

    const viewport = container.querySelector('[class*="bodyViewport"]') as HTMLDivElement
    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 200 })
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 1100 })
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 1000, writable: true })
    fireEvent.scroll(viewport)

    expect(onLoadMore).toHaveBeenCalled()

    ref.current?.exportToCsv('rows.csv')
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    click.mockRestore()
  })
})
