# Column Configuration Guide

This guide provides detailed examples for configuring columns in `CustomTable` and `EditCustomTable` components.

## Table of Contents

- [Basic Column Structure](#basic-column-structure)
- [Value Types](#value-types)
- [Filter Configuration](#filter-configuration)
- [Sort Configuration](#sort-configuration)
- [Summary/Aggregation](#summaryaggregation)
- [Excel Export](#excel-export)
- [Column Features](#column-features)
- [Custom Rendering](#custom-rendering)
- [Grouped Columns](#grouped-columns)
- [Edit Type Examples](#edit-type-examples)
- [Copy-Paste Examples](#copy-paste-examples)

---

## Basic Column Structure

Every column requires these essential properties:

```tsx
const column: TableColumn<DataType> = {
  key: 'fieldName',        // Unique identifier
  title: 'Display Title',  // Column header text
  dataIndex: 'fieldName',  // Field name in data object
  width: 150,              // Column width in pixels (required!)
};
```

---

## Value Types

The `valueType` property affects formatting in summaries:

```tsx
// String (default)
{ valueType: 'string' }

// Number - plain numbers
{ valueType: 'number' }

// Amount - formatted with thousand separators
{ valueType: 'amount' }

// Date - date only
{ valueType: 'date' }

// DateTime - date with time
{ valueType: 'datetime' }
```

---

## Filter Configuration

### Text Filter

```tsx
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
}
```

### Select Filter

```tsx
{
  key: 'status',
  title: 'Status',
  dataIndex: 'status',
  width: 100,
  filterProps: {
    showFilter: true,
    filterType: TABLE_FILTER_TYPE.SELECT,
    filterName: 'status',
    filterInitialValue: '',  // Default selection
    filterOptions: [
      { label: 'All', value: '' },
      { label: 'Active', value: 'Y' },
      { label: 'Inactive', value: 'N' },
      { label: 'Pending', value: 'P' },
    ],
  },
}
```

### Number Filter

```tsx
{
  key: 'amount',
  title: 'Amount',
  dataIndex: 'amount',
  width: 120,
  align: 'right',
  filterProps: {
    showFilter: true,
    filterType: TABLE_FILTER_TYPE.NUMBER,
    filterName: 'amount',
    filterNumberType: 'amount',  // 'amount' or 'number'
  },
}
```

### Date Filter

```tsx
{
  key: 'createdDate',
  title: 'Created Date',
  dataIndex: 'createdDate',
  width: 130,
  filterProps: {
    showFilter: true,
    filterType: TABLE_FILTER_TYPE.DATEPICKER,
    filterName: 'createdDate',
  },
}
```

---

## Sort Configuration

Enable server-side sorting:

```tsx
{
  key: 'name',
  title: 'Name',
  dataIndex: 'name',
  width: 150,
  sorter: true,  // Enables sort button in header
}
```

Handle sort changes:

```tsx
<CustomTable
  columns={columns}
  data={data}
  tableState={{ sort }}
  onSortChange={(sortField, sortType) => {
    // sortField: column dataIndex
    // sortType: 'ASC' | 'DESC' | undefined
    setSort({ sortField, sortType });
    refetchData();
  }}
/>
```

---

## Summary/Aggregation

### Built-in Aggregations

```tsx
import { AGGERATE_TYPE } from '@/types';

// Sum of all values
{ summary: AGGERATE_TYPE.SUM }

// Maximum value
{ summary: AGGERATE_TYPE.MAX }

// Minimum value
{ summary: AGGERATE_TYPE.MIN }

// Count of rows
{ summary: AGGERATE_TYPE.COUNT }

// Count of unique values
{ summary: AGGERATE_TYPE.UNIQUE_COUNT }
```

### Custom Summary Content

```tsx
{
  key: 'description',
  title: 'Description',
  dataIndex: 'description',
  width: 200,
  summary: () => (
    <span style={{ fontWeight: 'bold' }}>Grand Total:</span>
  ),
}
```

### Complete Summary Example

```tsx
const columns: TableColumn<Invoice>[] = [
  {
    key: 'invoiceNo',
    title: 'Invoice No',
    dataIndex: 'invoiceNo',
    width: 120,
    // No summary - cell will be empty
  },
  {
    key: 'customerName',
    title: 'Customer',
    dataIndex: 'customerName',
    width: 200,
    summary: () => <>Total</>,  // Label
  },
  {
    key: 'quantity',
    title: 'Qty',
    dataIndex: 'quantity',
    width: 80,
    align: 'right',
    summary: AGGERATE_TYPE.SUM,  // Sum of quantities
  },
  {
    key: 'amount',
    title: 'Amount',
    dataIndex: 'amount',
    width: 120,
    align: 'right',
    valueType: 'amount',  // Format as currency
    summary: AGGERATE_TYPE.SUM,
  },
];
```

---

## Excel Export

### String Export

```tsx
{
  key: 'code',
  title: 'Code',
  dataIndex: 'code',
  width: 100,
  excelProps: {
    exportType: 'string',  // Preserve leading zeros, treat as text
  },
}
```

### Number Export with Format

```tsx
{
  key: 'amount',
  title: 'Amount',
  dataIndex: 'amount',
  width: 120,
  excelProps: {
    exportType: 'number',
    exportFormat: '#,##0.00',  // Excel number format
  },
}

// Integer format
{
  excelProps: {
    exportType: 'number',
    exportFormat: '#,##0',
  },
}

// Percentage
{
  excelProps: {
    exportType: 'number',
    exportFormat: '0.00%',
  },
}
```

### Date Export

```tsx
{
  key: 'createdDate',
  title: 'Created Date',
  dataIndex: 'createdDate',
  width: 120,
  excelProps: {
    exportType: 'date',
    exportFormat: 'DD/MM/YYYY',
  },
}

// DateTime format
{
  excelProps: {
    exportType: 'date',
    exportFormat: 'DD/MM/YYYY HH:mm:ss',
  },
}
```

### Hide from Export

```tsx
{
  key: 'actions',
  title: 'Actions',
  dataIndex: 'actions',
  width: 100,
  excelProps: {
    hideInExport: true,  // Column won't appear in exported file
  },
}
```

---

## Column Features

### Fixed Columns

```tsx
// Fixed to left (typically for key identifiers)
{
  key: 'code',
  title: 'Code',
  dataIndex: 'code',
  width: 100,
  fixed: 'left',
  resizable: false,  // Recommended for fixed columns
  draggable: false,
}

// Fixed to right (typically for actions)
{
  key: 'actions',
  title: 'Actions',
  dataIndex: 'actions',
  width: 100,
  fixed: 'right',
  resizable: false,
  draggable: false,
}
```

### Column Alignment

```tsx
// Left aligned (default)
{ align: 'left' }

// Center aligned (for status, checkboxes)
{ align: 'center' }

// Right aligned (for numbers, amounts)
{ align: 'right' }
```

### Text Overflow

```tsx
{
  key: 'description',
  title: 'Description',
  dataIndex: 'description',
  width: 200,
  ellipsis: true,  // Show "..." for overflow text
}
```

### Resizable & Draggable

```tsx
// Enable column resize (drag column border)
{ resizable: true }  // Default is true

// Enable column reorder (drag & drop)
{ draggable: true }  // Default is true

// Disable both (recommended for fixed columns)
{
  fixed: 'left',
  resizable: false,
  draggable: false,
}
```

---

## Custom Rendering

### Link Button

```tsx
{
  key: 'userId',
  title: 'User ID',
  dataIndex: 'userId',
  width: 120,
  render: (value, record) => (
    <Button type="link" onClick={() => handleViewUser(record.userId)}>
      {value}
    </Button>
  ),
}
```

### Status Tag

```tsx
{
  key: 'status',
  title: 'Status',
  dataIndex: 'status',
  width: 100,
  align: 'center',
  render: (value: string) => {
    const colorMap: Record<string, string> = {
      'Y': 'success',
      'N': 'default',
      'P': 'warning',
      'E': 'error',
    };
    const labelMap: Record<string, string> = {
      'Y': 'Active',
      'N': 'Inactive',
      'P': 'Pending',
      'E': 'Error',
    };
    return <Tag color={colorMap[value]}>{labelMap[value]}</Tag>;
  },
}
```

### Formatted Amount

```tsx
import { formatNumberAmount } from '@/utils/helper';

{
  key: 'amount',
  title: 'Amount',
  dataIndex: 'amount',
  width: 120,
  align: 'right',
  render: (value: number) => formatNumberAmount(value),  // 1,234,567.89
}
```

### Formatted Date

```tsx
import { formatDate } from '@/utils/helper';

{
  key: 'createdDate',
  title: 'Created Date',
  dataIndex: 'createdDate',
  width: 120,
  render: (value) => formatDate(value),  // DD/MM/YYYY
}

// With time
{
  render: (value) => formatDate(value, true),  // DD/MM/YYYY HH:mm:ss
}
```

### Multiple Tags

```tsx
{
  key: 'tags',
  title: 'Tags',
  dataIndex: 'tags',
  width: 200,
  render: (_, record) => (
    <>
      {record.tags?.map((tag) => (
        <Tag color="blue" key={tag}>
          {tag}
        </Tag>
      ))}
    </>
  ),
}
```

### Icons

```tsx
import { FolderFilled, FileOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

{
  key: 'type',
  title: 'Type',
  dataIndex: 'type',
  width: 100,
  render: (value, record) => (
    <span>
      {record.isFolder ? (
        <FolderFilled style={{ marginRight: 8, color: '#faad14' }} />
      ) : (
        <FileOutlined style={{ marginRight: 8 }} />
      )}
      {value}
    </span>
  ),
}

// Boolean icons
{
  key: 'verified',
  title: 'Verified',
  dataIndex: 'verified',
  width: 80,
  align: 'center',
  render: (value: boolean) =>
    value ? (
      <CheckCircleFilled style={{ color: '#52c41a' }} />
    ) : (
      <CloseCircleFilled style={{ color: '#ff4d4f' }} />
    ),
}
```

### Action Buttons

```tsx
import { Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

{
  key: 'actions',
  title: 'Actions',
  dataIndex: 'actions',
  width: 150,
  fixed: 'right',
  excelProps: { hideInExport: true },
  render: (_, record) => (
    <Space>
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => handleView(record)}
      />
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => handleEdit(record)}
      />
      <Popconfirm
        title="Delete this item?"
        onConfirm={() => handleDelete(record)}
      >
        <Button type="text" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </Space>
  ),
}
```

---

## Grouped Columns

Create hierarchical column headers:

```tsx
const columns: TableColumn<Order>[] = [
  {
    key: 'orderNo',
    title: 'Order No',
    dataIndex: 'orderNo',
    width: 120,
    fixed: 'left',
  },
  {
    title: 'Customer Information',  // Group header
    children: [
      {
        key: 'customerCode',
        title: 'Code',
        dataIndex: 'customerCode',
        width: 100,
      },
      {
        key: 'customerName',
        title: 'Name',
        dataIndex: 'customerName',
        width: 200,
        summary: () => <>Total</>,
      },
    ],
  },
  {
    title: 'Order Amount',  // Group header
    children: [
      {
        key: 'subtotal',
        title: 'Subtotal',
        dataIndex: 'subtotal',
        width: 120,
        align: 'right',
        valueType: 'amount',
        summary: AGGERATE_TYPE.SUM,
        render: (v) => formatNumberAmount(v),
      },
      {
        key: 'tax',
        title: 'Tax',
        dataIndex: 'tax',
        width: 100,
        align: 'right',
        valueType: 'amount',
        summary: AGGERATE_TYPE.SUM,
        render: (v) => formatNumberAmount(v),
      },
      {
        key: 'total',
        title: 'Total',
        dataIndex: 'total',
        width: 120,
        align: 'right',
        valueType: 'amount',
        summary: AGGERATE_TYPE.SUM,
        render: (v) => formatNumberAmount(v),
      },
    ],
  },
  {
    title: 'Dates',
    children: [
      {
        key: 'orderDate',
        title: 'Order Date',
        dataIndex: 'orderDate',
        width: 120,
        render: (v) => formatDate(v),
      },
      {
        key: 'deliveryDate',
        title: 'Delivery Date',
        dataIndex: 'deliveryDate',
        width: 120,
        render: (v) => formatDate(v),
      },
    ],
  },
];
```

---

## Edit Type Examples

Complete examples for each edit type in `EditCustomTable`:

### INPUT - Text Input

```tsx
{
  key: 'name',
  title: 'Name',
  dataIndex: 'name',
  width: 150,
  editType: EDIT_TYPE.INPUT,
  editProps: {
    required: true,
    maxLength: 100,
    placeholder: 'Enter name',
    rules: [
      { pattern: /^[a-zA-Z\s]+$/, message: 'Letters only' },
    ],
  },
}
```

### INPUT_NUMER - Number Input

```tsx
// Amount with decimals (1,234.56)
{
  key: 'salary',
  title: 'Salary',
  dataIndex: 'salary',
  width: 120,
  align: 'right',
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    required: true,
    numberType: 'amount',
    placeholder: 'Enter salary',
  },
}

// Plain integer
{
  key: 'quantity',
  title: 'Quantity',
  dataIndex: 'quantity',
  width: 80,
  align: 'right',
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    numberType: 'number',
    maxLength: 5,
  },
}
```

### SELECT - Dropdown

```tsx
{
  key: 'department',
  title: 'Department',
  dataIndex: 'department',
  width: 150,
  editType: EDIT_TYPE.SELECT,
  editProps: {
    required: true,
    placeholder: 'Select department',
    options: [
      { label: 'Human Resources', value: 'HR' },
      { label: 'Information Technology', value: 'IT' },
      { label: 'Finance', value: 'FIN' },
      { label: 'Operations', value: 'OPS' },
    ],
    onChange: (value, option, form, name) => {
      console.log('Selected:', value, option);
    },
  },
}
```

### MULTI_SELECT - Multiple Selection

```tsx
{
  key: 'skills',
  title: 'Skills',
  dataIndex: 'skills',
  width: 250,
  editType: EDIT_TYPE.MULTI_SELECT,
  editProps: {
    placeholder: 'Select skills',
    options: [
      { label: 'React', value: 'REACT' },
      { label: 'TypeScript', value: 'TS' },
      { label: 'Node.js', value: 'NODE' },
      { label: 'Python', value: 'PY' },
      { label: 'Java', value: 'JAVA' },
    ],
  },
}
```

### CHECKBOX - Toggle

```tsx
{
  key: 'activeYn',
  title: 'Active',
  dataIndex: 'activeYn',
  width: 70,
  align: 'center',
  editType: EDIT_TYPE.CHECKBOX,
  editProps: {
    checkboxMapping: {
      checked: 'Y',
      unchecked: 'N',
    },
  },
}
```

### DATEPICKER - Date Selection

```tsx
{
  key: 'startDate',
  title: 'Start Date',
  dataIndex: 'startDate',
  width: 150,
  editType: EDIT_TYPE.DATEPICKER,
  editProps: {
    required: true,
    placeholder: 'Select date',
  },
  excelProps: {
    exportType: 'date',
    exportFormat: 'DD/MM/YYYY',
  },
}
```

### SEARCH - Search Modal

```tsx
{
  key: 'countryCode',
  title: 'Country',
  dataIndex: 'countryCode',
  width: 120,
  editType: EDIT_TYPE.SEARCH,
  editProps: {
    placeholder: 'Search country',
    searchModal: <CountrySearchModal />,
    onSearchSelect: (record, rowIdx, form) => {
      form.setFieldValue(['items', rowIdx, 'countryName'], record.countryName);
    },
  },
}
```

---

## Copy-Paste Examples

Ready-to-use column configurations:

### User List Columns

```tsx
const userColumns: TableColumn<User>[] = [
  {
    key: 'userId',
    title: 'User ID',
    dataIndex: 'userId',
    width: 100,
    sorter: true,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.TEXT,
      filterName: 'userId',
    },
    render: (value) => (
      <Button type="link" onClick={() => handleView(value)}>
        {value}
      </Button>
    ),
  },
  {
    key: 'userName',
    title: 'User Name',
    dataIndex: 'userName',
    width: 150,
    sorter: true,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.TEXT,
      filterName: 'userName',
    },
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
  {
    key: 'createdDate',
    title: 'Created Date',
    dataIndex: 'createdDate',
    width: 120,
    sorter: true,
    excelProps: { exportType: 'date' },
    render: (value) => formatDate(value, true),
  },
  {
    key: 'createdBy',
    title: 'Created By',
    dataIndex: 'createdBy',
    width: 100,
  },
];
```

### Invoice/Order Columns

```tsx
const invoiceColumns: TableColumn<Invoice>[] = [
  {
    key: 'invoiceNo',
    title: 'Invoice No',
    dataIndex: 'invoiceNo',
    width: 120,
    fixed: 'left',
    sorter: true,
    excelProps: { exportType: 'string' },
    render: (value) => (
      <Button type="link" onClick={() => handleView(value)}>
        {value}
      </Button>
    ),
  },
  {
    key: 'customerName',
    title: 'Customer',
    dataIndex: 'customerName',
    width: 200,
    ellipsis: true,
    summary: () => <>Total</>,
  },
  {
    key: 'invoiceDate',
    title: 'Invoice Date',
    dataIndex: 'invoiceDate',
    width: 120,
    sorter: true,
    filterProps: {
      showFilter: true,
      filterType: TABLE_FILTER_TYPE.DATEPICKER,
      filterName: 'invoiceDate',
    },
    excelProps: { exportType: 'date', exportFormat: 'DD/MM/YYYY' },
    render: (value) => formatDate(value),
  },
  {
    key: 'amount',
    title: 'Amount',
    dataIndex: 'amount',
    width: 130,
    align: 'right',
    valueType: 'amount',
    summary: AGGERATE_TYPE.SUM,
    excelProps: { exportType: 'number', exportFormat: '#,##0.00' },
    render: (value) => formatNumberAmount(value),
  },
  {
    key: 'vat',
    title: 'VAT',
    dataIndex: 'vat',
    width: 100,
    align: 'right',
    valueType: 'amount',
    summary: AGGERATE_TYPE.SUM,
    excelProps: { exportType: 'number', exportFormat: '#,##0.00' },
    render: (value) => formatNumberAmount(value),
  },
  {
    key: 'total',
    title: 'Total',
    dataIndex: 'total',
    width: 130,
    align: 'right',
    valueType: 'amount',
    summary: AGGERATE_TYPE.SUM,
    excelProps: { exportType: 'number', exportFormat: '#,##0.00' },
    render: (value) => formatNumberAmount(value),
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
        { label: 'Paid', value: 'PAID' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Overdue', value: 'OVERDUE' },
      ],
    },
    render: (value) => {
      const colors: Record<string, string> = {
        PAID: 'success',
        PENDING: 'warning',
        OVERDUE: 'error',
      };
      return <Tag color={colors[value]}>{value}</Tag>;
    },
  },
];
```

### Editable Line Items

```tsx
const editableItemColumns: TableColumn<LineItem>[] = [
  {
    key: 'itemCode',
    title: 'Item Code',
    dataIndex: 'itemCode',
    width: 120,
    editType: EDIT_TYPE.INPUT,
    editProps: {
      required: true,
      maxLength: 20,
      placeholder: 'Enter code',
    },
  },
  {
    key: 'description',
    title: 'Description',
    dataIndex: 'description',
    width: 250,
    editType: EDIT_TYPE.INPUT,
    editProps: {
      maxLength: 200,
      placeholder: 'Enter description',
    },
    summary: () => <>Total</>,
  },
  {
    key: 'quantity',
    title: 'Qty',
    dataIndex: 'quantity',
    width: 80,
    align: 'right',
    editType: EDIT_TYPE.INPUT_NUMER,
    editProps: {
      required: true,
      numberType: 'number',
      onChange: (value, _, form, name) => {
        const unitPrice = form.getFieldValue(['items', name[0], 'unitPrice']) || 0;
        form.setFieldValue(['items', name[0], 'amount'], value * unitPrice);
      },
    },
    summary: AGGERATE_TYPE.SUM,
  },
  {
    key: 'unitPrice',
    title: 'Unit Price',
    dataIndex: 'unitPrice',
    width: 120,
    align: 'right',
    valueType: 'amount',
    editType: EDIT_TYPE.INPUT_NUMER,
    editProps: {
      required: true,
      numberType: 'amount',
      onChange: (value, _, form, name) => {
        const qty = form.getFieldValue(['items', name[0], 'quantity']) || 0;
        form.setFieldValue(['items', name[0], 'amount'], value * qty);
      },
    },
  },
  {
    key: 'amount',
    title: 'Amount',
    dataIndex: 'amount',
    width: 130,
    align: 'right',
    valueType: 'amount',
    editType: EDIT_TYPE.INPUT_NUMER,
    editProps: {
      disabled: true,
      numberType: 'amount',
    },
    summary: AGGERATE_TYPE.SUM,
  },
  {
    key: 'remark',
    title: 'Remark',
    dataIndex: 'remark',
    width: 150,
    editType: EDIT_TYPE.INPUT,
  },
];
```

