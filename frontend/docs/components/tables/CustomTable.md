# CustomTable Component

A feature-rich, read-only table component built on top of Ant Design Table with additional functionalities including column filtering, sorting, pagination, row selection, column resizing, drag-and-drop column reordering, context menu, and Excel export.

## Table of Contents

- [Import](#import)
- [Basic Usage](#basic-usage)
- [Props Reference](#props-reference)
- [Column Configuration](#column-configuration)
- [Table State Management](#table-state-management)
- [Features](#features)
  - [Pagination](#pagination)
  - [Row Selection](#row-selection)
  - [Sorting](#sorting)
  - [Column Filtering](#column-filtering)
  - [Column Resizing](#column-resizing)
  - [Column Grouping](#column-grouping)
  - [Tree Data](#tree-data)
  - [Summary Footer](#summary-footer)
  - [Context Menu](#context-menu)
  - [Excel Export](#excel-export)
- [Examples](#examples)

---

## Import

```tsx
import CustomTable from '@/components/custom-table/CustomTable';
import type { TableColumn, TableData, TableState } from '@/types';
```

---

## Basic Usage

```tsx
import React from 'react';
import CustomTable from '@/components/custom-table/CustomTable';
import type { TableColumn, TableData } from '@/types';

interface UserData {
  name: string;
  age: number;
  email: string;
}

const MyPage: React.FC = () => {
  const columns: TableColumn<UserData>[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      key: 'age',
      title: 'Age',
      dataIndex: 'age',
      width: 80,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: 200,
    },
  ];

  const data: TableData<UserData>[] = [
    { key: 0, name: 'John', age: 32, email: 'john@example.com' },
    { key: 1, name: 'Jane', age: 28, email: 'jane@example.com' },
  ];

  return (
    <CustomTable<UserData>
      columns={columns}
      data={data}
      tableState={{
        pagination: { total: 2, current: 1, pageSize: 15 },
      }}
    />
  );
};
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<T>[]` | **Required** | Column definitions for the table |
| `data` | `TableData<T>[]` | **Required** | Data source for the table |
| `tableState` | `TableState<T>` | `DEFAULT_TABLE_STATE` | State object containing pagination, rowSelection, and sort |
| `tableFilterForm` | `FormInstance` | - | Ant Design form instance for column filters |
| `headerOffset` | `number` | `290` | Offset in pixels for calculating table height |
| `loading` | `boolean` | `false` | Show loading spinner |
| `autoPagination` | `boolean` | `false` | Enable client-side auto pagination |
| `noFooter` | `boolean` | `false` | Hide the total items count footer |
| `scroll` | `{ x: number; y: number }` | Auto-calculated | Custom scroll dimensions |
| `isTree` | `boolean` | `false` | Enable tree data mode with expandable rows |
| `isSelectStrict` | `boolean` | - | Strict mode for tree selection (don't auto-select children) |
| `virtual` | `boolean` | `false` | Enable virtual scrolling for large datasets |
| `rowSelectionType` | `'radio' \| 'checkbox'` | `'checkbox'` | Type of row selection |
| `exportFileName` | `string` | `'data'` | Default filename for Excel export |
| `contextMenu` | `object` | - | Context menu configuration |
| `onSelectChange` | `function` | - | Callback when row selection changes |
| `onPaginationChange` | `function` | - | Callback when pagination changes |
| `onSortChange` | `function` | - | Callback when sort changes |
| `onRowClick` | `function` | - | Callback when a row is clicked |
| `onRowDoubleClick` | `function` | - | Callback when a row is double-clicked |
| `onFilterTableChange` | `function` | - | Callback when column filters change |
| `onScrollChange` | `function` | - | Callback when scroll reaches bottom (infinite scroll) |
| `getCheckboxProps` | `function` | - | Function to customize checkbox properties per row |

---

## Column Configuration

The `TableColumn<T>` type extends Ant Design's column type with additional properties:

```tsx
interface TableColumn<T> {
  // Standard Ant Design properties
  key?: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  sorter?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  
  // Custom properties
  valueType?: 'number' | 'string' | 'date' | 'datetime' | 'amount';
  resizable?: boolean;          // Enable column resizing (default: true)
  draggable?: boolean;          // Enable column reordering (default: true)
  summary?: AGGERATE_TYPE | (() => ReactNode);  // Footer summary
  filterProps?: Partial<FilterTableProps>;      // Column filter configuration
  excelProps?: Partial<ExcelProps>;             // Excel export configuration
  children?: TableColumn<T>[];                   // Nested columns for grouping
}
```

### Filter Properties

```tsx
interface FilterTableProps {
  showFilter: boolean;                    // Show filter input in header
  filterType: TABLE_FILTER_TYPE;          // TEXT, SELECT, NUMBER, DATEPICKER
  filterName: string;                     // Field name for filter value
  filterNumberType?: 'number' | 'amount'; // For NUMBER type
  filterInitialValue?: any;               // Initial filter value
  filterOptions?: { label: string; value: string }[]; // For SELECT type
}
```

### Excel Export Properties

```tsx
interface ExcelProps {
  exportType: 'string' | 'number' | 'date' | 'boolean' | 'auto';
  exportFormat?: string;    // e.g., '#,##0.00' for numbers, 'DD/MM/YYYY' for dates
  hideInExport: boolean;    // Exclude column from export
}
```

---

## Table State Management

The `TableState<T>` object manages pagination, selection, and sorting:

```tsx
interface TableState<T> {
  pagination?: {
    total: number;
    current: number;
    pageSize: number;
  };
  rowSelection?: TableData<T>[];
  sort?: {
    sortField: string | undefined;
    sortType: 'ASC' | 'DESC' | undefined;
  };
}
```

---

## Features

### Pagination

Enable server-side pagination:

```tsx
const [pagination, setPagination] = useState({
  total: 100,
  current: 1,
  pageSize: 15,
});

<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{ pagination }}
  onPaginationChange={(current, pageSize) => {
    setPagination(prev => ({ ...prev, current, pageSize }));
    // Fetch new data from server
  }}
/>
```

Enable client-side auto pagination:

```tsx
<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{}}
  autoPagination={true}
/>
```

### Row Selection

```tsx
const [selectedRows, setSelectedRows] = useState<TableData<UserData>[]>([]);

<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{
    rowSelection: selectedRows,
  }}
  onSelectChange={(keys, rows) => {
    setSelectedRows(rows);
  }}
  // Optional: Disable specific rows
  getCheckboxProps={(record) => ({
    disabled: record.status === 'LOCKED',
  })}
/>
```

### Sorting

```tsx
const [sort, setSort] = useState<{ sortField?: string; sortType?: 'ASC' | 'DESC' }>();

const columns: TableColumn<UserData>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: true,  // Enable sorting for this column
    width: 150,
  },
];

<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{ sort }}
  onSortChange={(sortField, sortType) => {
    setSort({ sortField, sortType });
    // Refetch data with new sort
  }}
/>
```

### Column Filtering

```tsx
import { Form } from 'antd';
import { TABLE_FILTER_TYPE, type DynamicFilterDto } from '@/types';

const [tableFilterForm] = Form.useForm();

const columns: TableColumn<UserData>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    width: 150,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.TEXT,
      filterName: 'name',
    },
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    width: 100,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.SELECT,
      filterName: 'status',
      filterInitialValue: '',
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Y' },
        { label: 'Inactive', value: 'N' },
      ],
    },
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    width: 80,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.NUMBER,
      filterName: 'age',
      filterNumberType: 'number',
    },
  },
  {
    key: 'createdDate',
    title: 'Created Date',
    dataIndex: 'createdDate',
    width: 120,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.DATEPICKER,
      filterName: 'createdDate',
    },
  },
];

function handleFilterChange(filters: DynamicFilterDto[]) {
  console.log('Filters:', filters);
  // Each filter contains: { field, operator, value, valueType }
}

<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{}}
  tableFilterForm={tableFilterForm}
  onFilterTableChange={handleFilterChange}
/>
```

### Column Grouping

Create grouped headers with nested columns:

```tsx
const columns: TableColumn<Invoice>[] = [
  {
    title: 'Invoice Number',
    dataIndex: 'invoiceNo',
    width: 100,
  },
  {
    title: 'Customer',
    children: [
      {
        title: 'Code',
        dataIndex: 'customerCode',
        width: 80,
      },
      {
        title: 'Name',
        dataIndex: 'customerName',
        width: 150,
      },
    ],
  },
  {
    title: 'Amount',
    children: [
      {
        title: 'Subtotal',
        dataIndex: 'subtotal',
        width: 100,
        align: 'right',
      },
      {
        title: 'VAT',
        dataIndex: 'vat',
        width: 80,
        align: 'right',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        width: 100,
        align: 'right',
      },
    ],
  },
];
```

### Tree Data

Display hierarchical data with expandable rows:

```tsx
interface ProgramNode {
  pgmId: string;
  pgmName: string;
  children?: ProgramNode[];
}

// Build tree structure from flat data
const buildTree = (nodes: ProgramNode[]): ProgramNode[] => {
  const map = new Map<string, ProgramNode>();
  const tree: ProgramNode[] = [];

  nodes.forEach((node) => map.set(node.pgmId, { ...node }));

  nodes.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(map.get(node.pgmId)!);
    } else {
      tree.push(map.get(node.pgmId)!);
    }
  });

  return tree;
};

<CustomTable<ProgramNode>
  columns={columns}
  data={buildTree(programList)}
  tableState={{ rowSelection: selectedRows }}
  isTree={true}
  isSelectStrict={true}  // Don't auto-select children
  onSelectChange={handleSelectChange}
/>
```

### Summary Footer

Add aggregation summaries to the table footer:

```tsx
import { AGGERATE_TYPE } from '@/types';

const columns: TableColumn<Invoice>[] = [
  {
    title: 'Customer Name',
    dataIndex: 'customerName',
    width: 150,
    summary: () => <>Total</>,  // Custom summary content
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    width: 100,
    align: 'right',
    valueType: 'amount',
    summary: AGGERATE_TYPE.SUM,  // Built-in aggregation
  },
  {
    title: 'VAT',
    dataIndex: 'vat',
    width: 80,
    align: 'right',
    valueType: 'amount',
    summary: AGGERATE_TYPE.SUM,
  },
  {
    title: 'Count',
    dataIndex: 'itemCount',
    width: 80,
    summary: AGGERATE_TYPE.COUNT,
  },
];

// Available aggregation types:
// AGGERATE_TYPE.SUM - Sum of values
// AGGERATE_TYPE.MAX - Maximum value
// AGGERATE_TYPE.MIN - Minimum value
// AGGERATE_TYPE.COUNT - Count of rows
// AGGERATE_TYPE.UNIQUE_COUNT - Count of unique values
```

### Context Menu

The table includes a built-in context menu with these features:
- **Copy Row**: Copy selected row data to clipboard
- **Export to Excel**: Export visible data to Excel file
- **Fullscreen**: Toggle fullscreen mode

You can customize context menu behavior:

```tsx
<CustomTable<UserData>
  columns={columns}
  data={data}
  tableState={{}}
  exportFileName="users_export"
  contextMenu={{
    onRefresh: (filterForm) => {
      filterForm?.resetFields();
      refetchData();
    },
    onExport: (dataSource, columns, summary) => {
      // Custom export logic
    },
    onFullScreen: (toggleFullScreen) => {
      toggleFullScreen();
    },
  }}
/>
```

### Excel Export

Configure Excel export per column:

```tsx
const columns: TableColumn<Invoice>[] = [
  {
    title: 'Invoice Number',
    dataIndex: 'invoiceNo',
    width: 100,
    excelProps: {
      exportType: 'string',  // Treat as text in Excel
    },
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    width: 100,
    excelProps: {
      exportType: 'number',
      exportFormat: '#,##0.00',  // Number format
    },
  },
  {
    title: 'Created Date',
    dataIndex: 'createdDate',
    width: 120,
    excelProps: {
      exportType: 'date',
      exportFormat: 'DD/MM/YYYY',
    },
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    width: 100,
    excelProps: {
      hideInExport: true,  // Exclude from export
    },
  },
];
```

---

## Examples

### Complete Page Example

```tsx
import React, { useState } from 'react';
import { Flex, Form, Button, Tag } from 'antd';
import CustomTable from '@/components/custom-table/CustomTable';
import { FormSearchContainer, FormInput, FormSelect } from '@/components/form';
import { TABLE_FILTER_TYPE, type DynamicFilterDto, type TableColumn, type TableData } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UserInfo {
  usrId: string;
  usrNm: string;
  email: string;
  status: string;
  createdDate: string;
}

const UserListPage: React.FC = () => {
  const [filterForm] = Form.useForm();
  const [tableFilterForm] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<TableData<UserInfo>[]>([]);
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 15 });
  const [sort, setSort] = useState<{ sortField?: string; sortType?: 'ASC' | 'DESC' }>();
  const [filters, setFilters] = useState({});

  // Fetch data with React Query
  const { data: userList, isLoading } = useQuery({
    queryKey: ['users', pagination, sort, filters],
    queryFn: () => fetchUsers({ ...filters, ...pagination, ...sort }),
  });

  const columns: TableColumn<UserInfo>[] = [
    {
      key: 'usrId',
      title: 'User ID',
      dataIndex: 'usrId',
      width: 100,
      sorter: true,
      filterProps: {
        showFilter: true,
        filterType: TABLE_FILTER_TYPE.TEXT,
        filterName: 'usrId',
      },
      render: (value) => (
        <Button type="link" onClick={() => handleViewUser(value)}>
          {value}
        </Button>
      ),
    },
    {
      key: 'usrNm',
      title: 'Full Name',
      dataIndex: 'usrNm',
      width: 150,
      sorter: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      filterProps: {
        showFilter: true,
        filterType: TABLE_FILTER_TYPE.SELECT,
        filterName: 'status',
        filterOptions: [
          { label: 'All', value: '' },
          { label: 'Active', value: 'Y' },
          { label: 'Inactive', value: 'N' },
        ],
      },
      render: (value) => (
        <Tag color={value === 'Y' ? 'success' : 'default'}>
          {value === 'Y' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  const handleFilterChange = (filterValue: DynamicFilterDto[]) => {
    setFilters(prev => ({ ...prev, filters: filterValue }));
  };

  return (
    <Flex vertical gap={8}>
      {/* Search Form */}
      <FormSearchContainer
        form={filterForm}
        onRefresh={() => filterForm.resetFields()}
        onSearch={() => setFilters(filterForm.getFieldsValue())}
      >
        <Flex gap={16}>
          <FormInput name="usrId" label="User ID" width={200} />
          <FormInput name="usrNm" label="User Name" width={200} />
          <FormSelect
            name="status"
            label="Status"
            width={120}
            options={[
              { label: 'All', value: '' },
              { label: 'Active', value: 'Y' },
              { label: 'Inactive', value: 'N' },
            ]}
          />
        </Flex>
      </FormSearchContainer>

      {/* Table */}
      <CustomTable<UserInfo>
        columns={columns}
        data={userList?.data?.map((item, index) => ({ ...item, key: index })) || []}
        loading={isLoading}
        tableFilterForm={tableFilterForm}
        onFilterTableChange={handleFilterChange}
        tableState={{
          pagination: { ...pagination, total: userList?.total || 0 },
          rowSelection: selectedRows,
        }}
        onPaginationChange={(current, pageSize) => {
          setPagination(prev => ({ ...prev, current, pageSize }));
        }}
        onSortChange={(sortField, sortType) => {
          setSort({ sortField, sortType });
        }}
        onSelectChange={(keys, rows) => {
          setSelectedRows(rows);
        }}
        exportFileName="user_list"
      />
    </Flex>
  );
};

export default UserListPage;
```

---

## Related Components

- [EditCustomTable](./EditCustomTable.md) - Editable table with form integration
- [FormSearchContainer](./FormSearchContainer.md) - Search form wrapper

---

## Best Practices

1. **Always define `width`** for each column to ensure proper table rendering
2. **Use `key` property** matching `dataIndex` for consistent behavior
3. **Set appropriate `headerOffset`** based on your page layout (default: 290px)
4. **Use `virtual` prop** for large datasets (1000+ rows)
5. **Disable `resizable` and `draggable`** for fixed columns
6. **Use `ellipsis: true`** for potentially long text content

