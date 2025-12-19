# Custom Table Components - Quick Reference

A quick lookup guide for common patterns and configurations.

---

## At a Glance

| Component | Use Case |
|-----------|----------|
| `CustomTable` | Read-only data display with filtering, sorting, pagination |
| `EditCustomTable` | Inline editable table with form validation |

---

## Import Statements

```tsx
// Read-only table
import CustomTable from '@/components/custom-table/CustomTable';

// Editable table
import EditCustomTable from '@/components/custom-table/EditCustomTable';

// Types
import type { 
  TableColumn, 
  TableData, 
  TableState,
  EditTableHandler,
  DynamicFilterDto,
} from '@/types';

// Enums
import { 
  EDIT_TYPE,          // Cell edit types
  TABLE_FILTER_TYPE,  // Filter types
  AGGERATE_TYPE,      // Summary aggregations
  SORT,               // Sort direction
} from '@/types';
```

---

## Minimal Examples

### CustomTable

```tsx
const MyPage = () => {
  const columns: TableColumn<MyData>[] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'name', title: 'Name', dataIndex: 'name', width: 150 },
  ];

  return (
    <CustomTable<MyData>
      columns={columns}
      data={data.map((item, i) => ({ ...item, key: i }))}
      tableState={{ pagination: { total: 100, current: 1, pageSize: 15 } }}
    />
  );
};
```

### EditCustomTable

```tsx
const MyPage = () => {
  const [form] = Form.useForm();
  const tableRef = useRef<EditTableHandler<MyData>>(null);

  const columns: TableColumn<MyData>[] = [
    { 
      key: 'name', 
      title: 'Name', 
      dataIndex: 'name', 
      width: 150,
      editType: EDIT_TYPE.INPUT,
      editProps: { required: true },
    },
  ];

  return (
    <EditCustomTable<MyData>
      ref={tableRef}
      form={form}
      formTableName="items"
      columns={columns}
      data={data.map((item, i) => ({ ...item, key: i }))}
      tableState={{}}
    />
  );
};
```

---

## Edit Types Quick Reference

| Type | Import | Use Case |
|------|--------|----------|
| `EDIT_TYPE.INPUT` | Text input | Names, codes, descriptions |
| `EDIT_TYPE.INPUT_NUMER` | Number input | Amounts, quantities |
| `EDIT_TYPE.SELECT` | Dropdown | Single choice from list |
| `EDIT_TYPE.MULTI_SELECT` | Multi-dropdown | Multiple choices |
| `EDIT_TYPE.CHECKBOX` | Toggle | Yes/No, Active/Inactive |
| `EDIT_TYPE.DATEPICKER` | Date picker | Dates |
| `EDIT_TYPE.SEARCH` | Search modal | Lookup from another table |

---

## Filter Types Quick Reference

| Type | Use Case | Configuration |
|------|----------|---------------|
| `TABLE_FILTER_TYPE.TEXT` | Text search | `filterName` |
| `TABLE_FILTER_TYPE.SELECT` | Dropdown filter | `filterOptions` |
| `TABLE_FILTER_TYPE.NUMBER` | Number range | `filterNumberType` |
| `TABLE_FILTER_TYPE.DATEPICKER` | Date filter | - |

---

## Summary Types Quick Reference

| Type | Result |
|------|--------|
| `AGGERATE_TYPE.SUM` | Sum of values |
| `AGGERATE_TYPE.MAX` | Maximum value |
| `AGGERATE_TYPE.MIN` | Minimum value |
| `AGGERATE_TYPE.COUNT` | Row count |
| `AGGERATE_TYPE.UNIQUE_COUNT` | Unique values count |

---

## Common Props Cheatsheet

### CustomTable Props

```tsx
<CustomTable<T>
  // Required
  columns={columns}
  data={data}
  tableState={{ pagination, rowSelection }}
  
  // Common
  loading={isLoading}
  headerOffset={350}                    // Default: 290
  tableFilterForm={filterForm}          // For column filters
  exportFileName="export_name"
  
  // Selection
  rowSelectionType="checkbox"           // or "radio"
  onSelectChange={(keys, rows) => {}}
  getCheckboxProps={(record) => ({})}
  
  // Pagination
  onPaginationChange={(page, size) => {}}
  autoPagination={false}                // Client-side pagination
  
  // Sorting
  onSortChange={(field, direction) => {}}
  
  // Filtering
  onFilterTableChange={(filters) => {}}
  
  // Row Events
  onRowClick={(record, index) => {}}
  onRowDoubleClick={(record, index) => {}}
  
  // Tree Data
  isTree={true}
  isSelectStrict={true}
  
  // Other
  virtual={true}                        // Large datasets
  noFooter={true}                       // Hide item count
  scroll={{ x: 1500, y: 500 }}          // Custom scroll
/>
```

### EditCustomTable Props

```tsx
<EditCustomTable<T>
  // Required
  ref={tableRef}
  form={form}
  formTableName="items"
  columns={columns}
  data={data}
  tableState={{ rowSelection }}
  
  // Common
  loading={isLoading}
  headerOffset={350}
  exportFileName="export_name"
  
  // Selection
  onSelectChange={(keys, rows) => {}}
  getCheckboxProps={(record) => ({})}
  
  // Events
  onTableDataChange={(changedRow) => {}}
  onPaginationChange={(page, size) => {}}
  onSortChange={(field, direction) => {}}
  
  // Other
  autoPagination={false}
  noFooter={true}
/>
```

---

## Column Configuration Patterns

### Basic Column

```tsx
{
  key: 'field',
  title: 'Title',
  dataIndex: 'field',
  width: 100,
}
```

### With Filter

```tsx
{
  key: 'field',
  title: 'Title',
  dataIndex: 'field',
  width: 100,
  filterProps: {
    showFilter: true,
    filterType: TABLE_FILTER_TYPE.TEXT,
    filterName: 'field',
  },
}
```

### With Sort

```tsx
{
  key: 'field',
  title: 'Title',
  dataIndex: 'field',
  width: 100,
  sorter: true,
}
```

### With Summary

```tsx
{
  key: 'amount',
  title: 'Amount',
  dataIndex: 'amount',
  width: 120,
  align: 'right',
  valueType: 'amount',
  summary: AGGERATE_TYPE.SUM,
}
```

### Fixed Column

```tsx
{
  key: 'code',
  title: 'Code',
  dataIndex: 'code',
  width: 100,
  fixed: 'left',
  resizable: false,
  draggable: false,
}
```

### Editable Cell

```tsx
{
  key: 'name',
  title: 'Name',
  dataIndex: 'name',
  width: 150,
  editType: EDIT_TYPE.INPUT,
  editProps: {
    required: true,
    maxLength: 50,
    placeholder: 'Enter name',
  },
}
```

---

## Table Handler Methods

```tsx
const tableRef = useRef<EditTableHandler<T>>(null);

// Add row
tableRef.current?.onAddRow({ field: 'value' });
tableRef.current?.onAddRow({ field: 'value' }, index);

// Insert above/below
tableRef.current?.insertAbove({}, index);
tableRef.current?.insertBelow({}, index);

// Remove rows
tableRef.current?.onRemoveRow(key);
tableRef.current?.onRemoveRow([key1, key2]);

// Get deleted rows (for API)
const deleted = tableRef.current?.getDeletedRows();

// Reset deleted tracking
tableRef.current?.resetDeletedRows();

// Duplicate rows
tableRef.current?.duplicateRow(selectedRows);
```

---

## Form Validation Pattern

```tsx
const handleSave = async () => {
  try {
    const values = await tableForm.validateFields();
    const deletedRows = tableRef.current?.getDeletedRows() || [];
    
    // Process data
    const toSave = values.items.filter(row => row.procFlag !== 'S');
    
    await api.save({
      items: toSave,
      deleted: deletedRows,
    });
    
    tableRef.current?.resetDeletedRows();
    message.success('Saved!');
  } catch {
    message.error('Fix validation errors');
  }
};
```

---

## procFlag Values

| Flag | Meaning | Action |
|------|---------|--------|
| `'S'` | Saved | Original, unchanged |
| `'I'` | Insert | New row, add to DB |
| `'U'` | Update | Changed row, update in DB |
| `'D'` | Delete | Removed row, delete from DB |

---

## Common Patterns

### Add/Delete Buttons with Selection

```tsx
const [selectedRows, setSelectedRows] = useState<TableData<T>[]>([]);

const handleAdd = () => tableRef.current?.onAddRow({});

const handleDelete = () => {
  if (selectedRows.length === 0) {
    message.warning('Select rows first');
    return;
  }
  const keys = selectedRows.map(r => r.key) as number[];
  tableRef.current?.onRemoveRow(keys);
  setSelectedRows([]);
};

<EditCustomTable
  tableState={{ rowSelection: selectedRows }}
  onSelectChange={(_, rows) => setSelectedRows(rows)}
/>
```

### Calculated Field

```tsx
{
  key: 'quantity',
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    onChange: (value, _, form, name) => {
      const price = form.getFieldValue(['items', name[0], 'price']) || 0;
      form.setFieldValue(['items', name[0], 'total'], value * price);
    },
  },
}
```

### Cascading Dropdown

```tsx
{
  key: 'category',
  editType: EDIT_TYPE.SELECT,
  editProps: {
    options: categories,
    onChange: (_, __, form, name) => {
      form.setFieldValue(['items', name[0], 'subCategory'], null);
    },
  },
}

{
  key: 'subCategory',
  editType: EDIT_TYPE.SELECT,
  editProps: {
    shouldUpdate: (prev, curr, idx) => 
      prev['items']?.[idx]?.category !== curr['items']?.[idx]?.category,
    overrideEditProps: (val, idx) => ({
      options: getSubCategories(val['items']?.[idx]?.category),
    }),
  },
}
```

### Conditional Disable

```tsx
{
  key: 'field',
  editType: EDIT_TYPE.INPUT,
  editProps: {
    shouldUpdate: (prev, curr, idx) => 
      prev['items']?.[idx]?.status !== curr['items']?.[idx]?.status,
    overrideEditProps: (val, idx) => ({
      disabled: val['items']?.[idx]?.status === 'LOCKED',
    }),
  },
}
```

---

## File Structure

```
src/components/custom-table/
├── CustomTable.tsx           # Read-only table
├── EditCustomTable.tsx       # Editable table
├── CustomTable.module.scss   # Styles
├── components/
│   ├── TableHeader.tsx       # Header with resize/drag
│   ├── EditableCell.tsx      # Cell type router
│   ├── ColumnHeader.tsx      # Column header with required indicator
│   ├── cell/                 # Individual cell components
│   │   ├── InputCell.tsx
│   │   ├── InputNumberCell.tsx
│   │   ├── SelectCell.tsx
│   │   ├── MultiSelectCell.tsx
│   │   ├── CheckBoxCell.tsx
│   │   ├── DatePickerCell.tsx
│   │   ├── SearchCell.tsx
│   │   └── ReadOnlyCell.tsx
│   ├── filters/              # Column filter components
│   ├── context-menu/         # Right-click menu
│   └── dnd/                  # Drag and drop
├── hooks/
│   ├── useTableHooks.ts      # CustomTable hooks
│   ├── useEditTableHooks.tsx # EditCustomTable hooks
│   ├── useTableScroll.ts     # Auto height calculation
│   ├── useResizeHandler.ts   # Column resize
│   ├── useContextMenu.tsx    # Right-click menu
│   ├── useFullScreen.tsx     # Fullscreen mode
│   └── useTableExportExcel.tsx # Export functionality
└── utils/
    ├── aggerate.ts           # Summary calculations
    ├── excel.ts              # Excel export helpers
    └── filter.ts             # Filter utilities
```

