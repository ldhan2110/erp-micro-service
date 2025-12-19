# EditCustomTable Component

An editable table component with full form integration, supporting inline editing with various cell types including input, select, datepicker, checkbox, and search modal. Built on top of Ant Design Table with Form.List for seamless data manipulation.

## Table of Contents

- [Import](#import)
- [Basic Usage](#basic-usage)
- [Props Reference](#props-reference)
- [Edit Types](#edit-types)
- [Edit Props Configuration](#edit-props-configuration)
- [Table Handler Methods](#table-handler-methods)
- [Cell Types](#cell-types)
  - [Input Cell](#input-cell)
  - [Input Number Cell](#input-number-cell)
  - [Select Cell](#select-cell)
  - [Multi-Select Cell](#multi-select-cell)
  - [Checkbox Cell](#checkbox-cell)
  - [DatePicker Cell](#datepicker-cell)
  - [Search Cell](#search-cell)
  - [Read-Only Cell](#read-only-cell)
- [Advanced Features](#advanced-features)
  - [Conditional Cell Properties](#conditional-cell-properties)
  - [Cell Change Handlers](#cell-change-handlers)
  - [Cross-Cell Validation](#cross-cell-validation)
  - [Summary Footer](#summary-footer)
- [Examples](#examples)

---

## Import

```tsx
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import { Form } from 'antd';
import type { 
  TableColumn, 
  TableData, 
  EditTableHandler, 
  EDIT_TYPE 
} from '@/types';
```

---

## Basic Usage

```tsx
import React, { useRef, useState } from 'react';
import { Button, Flex, Form } from 'antd';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import { EDIT_TYPE, type EditTableHandler, type TableColumn, type TableData } from '@/types';

interface Employee {
  name: string;
  age: number;
  department: string;
  active: string;
}

const EmployeePage: React.FC = () => {
  const [tableForm] = Form.useForm();
  const tableRef = useRef<EditTableHandler<Employee>>(null);
  const [selectedRows, setSelectedRows] = useState<TableData<Employee>[]>([]);

  const initialData: Employee[] = [
    { name: 'John', age: 32, department: 'IT', active: 'Y' },
    { name: 'Jane', age: 28, department: 'HR', active: 'Y' },
  ];

  const columns: TableColumn<Employee>[] = [
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
    },
    {
      key: 'age',
      title: 'Age',
      dataIndex: 'age',
      width: 100,
      align: 'right',
      editType: EDIT_TYPE.INPUT_NUMER,
      editProps: {
        numberType: 'number',
        placeholder: 'Enter age',
      },
    },
    {
      key: 'department',
      title: 'Department',
      dataIndex: 'department',
      width: 150,
      editType: EDIT_TYPE.SELECT,
      editProps: {
        required: true,
        options: [
          { label: 'IT', value: 'IT' },
          { label: 'HR', value: 'HR' },
          { label: 'Finance', value: 'FIN' },
        ],
      },
    },
    {
      key: 'active',
      title: 'Active',
      dataIndex: 'active',
      width: 80,
      align: 'center',
      editType: EDIT_TYPE.CHECKBOX,
      editProps: {
        checkboxMapping: {
          checked: 'Y',
          unchecked: 'N',
        },
      },
    },
  ];

  const handleAddRow = () => {
    tableRef.current?.onAddRow({ active: 'Y' });
  };

  const handleDeleteRows = () => {
    const keys = selectedRows.map(row => row.key) as number[];
    tableRef.current?.onRemoveRow(keys);
    setSelectedRows([]);
  };

  const handleSave = async () => {
    try {
      const values = await tableForm.validateFields();
      const deletedRows = tableRef.current?.getDeletedRows() || [];
      console.log('Table Data:', values.employees);
      console.log('Deleted Rows:', deletedRows);
      // Submit to API
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Flex vertical gap={8}>
      <Flex justify="end" gap={8}>
        <Button onClick={handleAddRow}>Add Row</Button>
        <Button danger onClick={handleDeleteRows}>Delete</Button>
        <Button type="primary" onClick={handleSave}>Save</Button>
      </Flex>
      
      <EditCustomTable<Employee>
        ref={tableRef}
        form={tableForm}
        formTableName="employees"
        columns={columns}
        data={initialData.map((item, idx) => ({ ...item, key: idx }))}
        tableState={{
          rowSelection: selectedRows,
        }}
        onSelectChange={(keys, rows) => setSelectedRows(rows)}
      />
    </Flex>
  );
};
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ref` | `React.Ref<EditTableHandler<T>>` | - | Ref to access table handler methods |
| `form` | `FormInstance` | **Required** | Ant Design form instance |
| `formTableName` | `string` | **Required** | Form field name for the table data array |
| `columns` | `TableColumn<T>[]` | **Required** | Column definitions with edit configuration |
| `data` | `TableData<T>[]` | **Required** | Initial data for the table |
| `tableState` | `TableState<T>` | `DEFAULT_TABLE_STATE` | State object for pagination and selection |
| `headerOffset` | `number` | `290` | Offset in pixels for calculating table height |
| `loading` | `boolean` | `false` | Show loading spinner |
| `autoPagination` | `boolean` | `false` | Enable client-side auto pagination |
| `noFooter` | `boolean` | `false` | Hide the total items count footer |
| `exportFileName` | `string` | `'data'` | Default filename for Excel export |
| `contextMenu` | `object` | - | Context menu configuration |
| `onSelectChange` | `function` | - | Callback when row selection changes |
| `onPaginationChange` | `function` | - | Callback when pagination changes |
| `onSortChange` | `function` | - | Callback when sort changes |
| `onTableDataChange` | `function` | - | Callback when any cell value changes |
| `getCheckboxProps` | `function` | - | Function to customize checkbox properties per row |

---

## Edit Types

Available edit types from `EDIT_TYPE` enum:

| Type | Description | Cell Component |
|------|-------------|----------------|
| `EDIT_TYPE.INPUT` | Text input | `InputCell` |
| `EDIT_TYPE.INPUT_NUMER` | Number input with formatting | `InputNumberCell` |
| `EDIT_TYPE.SELECT` | Single select dropdown | `SelectCell` |
| `EDIT_TYPE.MULTI_SELECT` | Multi-select dropdown | `MultiSelectCell` |
| `EDIT_TYPE.CHECKBOX` | Checkbox with value mapping | `CheckBoxCell` |
| `EDIT_TYPE.DATEPICKER` | Date picker | `DatePickerCell` |
| `EDIT_TYPE.SEARCH` | Input with search modal | `SearchCell` |
| `undefined` | Read-only display | `ReadOnlyCell` |

---

## Edit Props Configuration

The `editProps` object configures cell behavior:

```tsx
interface EditProps<T> {
  // Common Properties
  required: boolean;           // Show required indicator, add validation
  placeholder: string;         // Placeholder text
  disabled: boolean;           // Disable the cell
  clearValueDisable?: boolean; // Clear value when disabled
  initialValue?: any;          // Initial cell value
  rules?: Rule[];              // Ant Design form validation rules

  // Dynamic Cell Properties
  shouldUpdate?: (prevVal, curVal, rowIndex) => boolean;  // Trigger re-render
  overrideEditProps?: (curVal, rowIndex, form, name) => Partial<EditProps<T>>; // Override props dynamically
  onChange?: (value, options, form, name) => void;  // Handle value changes

  // Input & Input Number
  maxLength: number;                  // Max character length
  numberType: 'amount' | 'number';    // Number formatting type

  // Select
  options: DefaultOptionType[];       // Select options

  // Checkbox
  checkboxMapping?: {
    checked: string | number | boolean;
    unchecked: string | number | boolean;
  };

  // Search
  searchModal: React.ReactElement;    // Search modal component
  onSearchSelect: (record, rowIdx, form, name) => void;  // Handle selection
}
```

---

## Table Handler Methods

Access these methods via the `ref`:

```tsx
const tableRef = useRef<EditTableHandler<Employee>>(null);

// Add a new row at the end
tableRef.current?.onAddRow({ name: '', active: 'Y' });

// Add a new row at specific index
tableRef.current?.onAddRow({ name: '' }, 0);

// Insert row above specific index
tableRef.current?.insertAbove({ name: '' }, 2);

// Insert row below specific index
tableRef.current?.insertBelow({ name: '' }, 2);

// Remove single row by key
tableRef.current?.onRemoveRow(rowKey);

// Remove multiple rows by keys
tableRef.current?.onRemoveRow([key1, key2, key3]);

// Get all deleted rows (for sending delete requests to API)
const deletedRows = tableRef.current?.getDeletedRows();

// Reset deleted rows tracking
tableRef.current?.resetDeletedRows();

// Duplicate existing rows
tableRef.current?.duplicateRow(selectedRows);
```

---

## Cell Types

### Input Cell

Basic text input:

```tsx
{
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

### Input Number Cell

Formatted number input:

```tsx
{
  title: 'Salary',
  dataIndex: 'salary',
  width: 120,
  align: 'right',
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    required: true,
    numberType: 'amount',  // Formats with thousand separators: 1,234,567.89
    placeholder: 'Enter salary',
  },
}

{
  title: 'Quantity',
  dataIndex: 'qty',
  width: 80,
  align: 'right',
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    numberType: 'number',  // Plain number without decimals
    maxLength: 5,
  },
}
```

### Select Cell

Single selection dropdown:

```tsx
{
  title: 'Department',
  dataIndex: 'deptCd',
  width: 150,
  editType: EDIT_TYPE.SELECT,
  editProps: {
    required: true,
    placeholder: 'Select department',
    options: [
      { label: 'Human Resources', value: 'HR' },
      { label: 'Information Technology', value: 'IT' },
      { label: 'Finance', value: 'FIN' },
    ],
    onChange: (value, option, form, name) => {
      // Clear related field when department changes
      form.setFieldValue(['employees', name[0], 'position'], null);
    },
  },
}
```

### Multi-Select Cell

Multiple selection dropdown:

```tsx
{
  title: 'Skills',
  dataIndex: 'skills',
  width: 200,
  editType: EDIT_TYPE.MULTI_SELECT,
  editProps: {
    required: true,
    placeholder: 'Select skills',
    options: [
      { label: 'React', value: 'REACT' },
      { label: 'TypeScript', value: 'TS' },
      { label: 'Node.js', value: 'NODE' },
      { label: 'Python', value: 'PY' },
    ],
  },
}
```

### Checkbox Cell

Boolean checkbox with value mapping:

```tsx
{
  title: 'Active',
  dataIndex: 'activeYn',
  width: 70,
  align: 'center',
  editType: EDIT_TYPE.CHECKBOX,
  editProps: {
    checkboxMapping: {
      checked: 'Y',     // Value when checked
      unchecked: 'N',   // Value when unchecked
    },
  },
}

// Can also map to boolean or numbers
{
  editProps: {
    checkboxMapping: {
      checked: true,
      unchecked: false,
    },
  },
}
```

### DatePicker Cell

Date selection:

```tsx
{
  title: 'Start Date',
  dataIndex: 'startDate',
  width: 150,
  editType: EDIT_TYPE.DATEPICKER,
  editProps: {
    placeholder: 'Select date',
    rules: [
      ({ getFieldValue }) => ({
        validator(ruleObject, value) {
          const fields = ruleObject.field?.split('.') ?? [];
          const rowKey = fields[1];
          const endDate = getFieldValue(['employees', rowKey, 'endDate']);
          
          if (value && endDate && value.isAfter(endDate)) {
            return Promise.reject('Start date must be before end date');
          }
          return Promise.resolve();
        },
      }),
    ],
    onChange: (value, event, form, name) => {
      // Trigger validation on related field
      form.validateFields([['employees', name[0], 'endDate']]);
    },
  },
  excelProps: {
    exportType: 'date',
    exportFormat: 'DD/MM/YYYY',
  },
}
```

### Search Cell

Input with search modal popup:

```tsx
import { CountrySearchModal } from '@/components/modules/common';

{
  title: 'Country Code',
  dataIndex: 'countryCode',
  width: 100,
  editType: EDIT_TYPE.SEARCH,
  editProps: {
    placeholder: 'Search country',
    searchModal: <CountrySearchModal />,
    onSearchSelect: (record, rowIdx, form) => {
      // Auto-fill related fields from selected record
      form.setFieldValue(['employees', rowIdx, 'countryName'], record.countryName);
      form.setFieldValue(['employees', rowIdx, 'currency'], record.currency);
    },
  },
}
```

The search modal component should accept these props:

```tsx
interface SearchModalProps<T> {
  open: boolean;
  fieldName: string;
  fieldValue: any;
  onCancel: () => void;
  onSelect: (record: T) => void;
}
```

### Read-Only Cell

When no `editType` is specified, the cell displays as read-only:

```tsx
{
  title: 'Country Name',
  dataIndex: 'countryName',
  width: 150,
  // No editType - renders as read-only text
  editProps: {
    shouldUpdate: (prev, curr, rowIndex) => {
      return prev['employees'][rowIndex]?.countryCode !== curr['employees'][rowIndex]?.countryCode;
    },
  },
}
```

---

## Advanced Features

### Conditional Cell Properties

Use `shouldUpdate` and `overrideEditProps` to dynamically change cell behavior:

```tsx
{
  title: 'Name',
  dataIndex: 'name',
  width: 150,
  editType: EDIT_TYPE.INPUT,
  editProps: {
    required: true,
    placeholder: 'Enter name',
    
    // Trigger re-render when row data changes
    shouldUpdate: (prevVal, curVal, rowIndex) => {
      const prevRow = prevVal['employees']?.[rowIndex];
      const curRow = curVal['employees']?.[rowIndex];
      return prevRow?.status !== curRow?.status;
    },
    
    // Dynamically override props based on current data
    overrideEditProps: (curVal, rowIndex, form, name) => {
      const tableData = curVal['employees'] || [];
      const row = tableData[rowIndex];
      
      return {
        // Disable input if status is 'LOCKED'
        disabled: row?.status === 'LOCKED',
        // Clear value when disabled
        clearValueDisable: true,
        // Remove required validation when disabled
        rules: row?.status === 'LOCKED' ? [] : undefined,
      };
    },
  },
}
```

### Cell Change Handlers

Handle cell value changes to update related fields:

```tsx
{
  title: 'Unit Price',
  dataIndex: 'unitPrice',
  width: 120,
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    numberType: 'amount',
    onChange: (value, event, form, name) => {
      const rowIndex = name[0];
      const quantity = form.getFieldValue(['items', rowIndex, 'quantity']) || 0;
      const totalAmount = value * quantity;
      form.setFieldValue(['items', rowIndex, 'totalAmount'], totalAmount);
    },
  },
}

{
  title: 'Quantity',
  dataIndex: 'quantity',
  width: 80,
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    numberType: 'number',
    onChange: (value, event, form, name) => {
      const rowIndex = name[0];
      const unitPrice = form.getFieldValue(['items', rowIndex, 'unitPrice']) || 0;
      const totalAmount = unitPrice * value;
      form.setFieldValue(['items', rowIndex, 'totalAmount'], totalAmount);
    },
  },
}

{
  title: 'Total Amount',
  dataIndex: 'totalAmount',
  width: 120,
  editType: EDIT_TYPE.INPUT_NUMER,
  editProps: {
    disabled: true,  // Read-only calculated field
    numberType: 'amount',
  },
}
```

### Cascading Dropdowns

Update dependent dropdown options based on selection:

```tsx
const getDepartmentOptions = (companyCode: string) => {
  switch (companyCode) {
    case 'HQ':
      return [
        { label: 'Management', value: 'MGT' },
        { label: 'Finance', value: 'FIN' },
      ];
    case 'BRANCH':
      return [
        { label: 'Sales', value: 'SLS' },
        { label: 'Support', value: 'SUP' },
      ];
    default:
      return [];
  }
};

const columns: TableColumn<Employee>[] = [
  {
    title: 'Company',
    dataIndex: 'companyCd',
    editType: EDIT_TYPE.SELECT,
    editProps: {
      options: [
        { label: 'Headquarters', value: 'HQ' },
        { label: 'Branch Office', value: 'BRANCH' },
      ],
      onChange: (value, option, form, name) => {
        // Clear department when company changes
        form.setFieldValue(['employees', name[0], 'deptCd'], null);
      },
    },
  },
  {
    title: 'Department',
    dataIndex: 'deptCd',
    editType: EDIT_TYPE.SELECT,
    editProps: {
      placeholder: 'Select department',
      shouldUpdate: (prev, curr, rowIndex) => {
        return prev['employees']?.[rowIndex]?.companyCd !== curr['employees']?.[rowIndex]?.companyCd;
      },
      overrideEditProps: (curVal, rowIndex) => {
        const companyCd = curVal['employees']?.[rowIndex]?.companyCd;
        return {
          disabled: !companyCd,
          options: getDepartmentOptions(companyCd),
        };
      },
    },
  },
];
```

### Cross-Cell Validation

Validate cells that depend on each other:

```tsx
{
  title: 'Start Date',
  dataIndex: 'startDate',
  editType: EDIT_TYPE.DATEPICKER,
  editProps: {
    rules: [
      ({ getFieldValue }) => ({
        validator(ruleObject, value) {
          const fields = ruleObject.field?.split('.') ?? [];
          const formName = fields[0];
          const rowKey = fields[1];
          const endDate = getFieldValue([formName, rowKey, 'endDate']);
          
          if (!value || !endDate || value.isBefore(endDate)) {
            return Promise.resolve();
          }
          return Promise.reject('Start date must be before end date');
        },
      }),
    ],
    onChange: (value, event, form, name) => {
      // Re-validate end date when start date changes
      form.validateFields([['employees', name[0], 'endDate']]);
    },
  },
}

{
  title: 'End Date',
  dataIndex: 'endDate',
  editType: EDIT_TYPE.DATEPICKER,
  editProps: {
    rules: [
      ({ getFieldValue }) => ({
        validator(ruleObject, value) {
          const fields = ruleObject.field?.split('.') ?? [];
          const formName = fields[0];
          const rowKey = fields[1];
          const startDate = getFieldValue([formName, rowKey, 'startDate']);
          
          if (!value || !startDate || value.isAfter(startDate)) {
            return Promise.resolve();
          }
          return Promise.reject('End date must be after start date');
        },
      }),
    ],
    onChange: (value, event, form, name) => {
      // Re-validate start date when end date changes
      form.validateFields([['employees', name[0], 'startDate']]);
    },
  },
}
```

### Summary Footer

Add aggregation summaries to editable tables:

```tsx
import { AGGERATE_TYPE } from '@/types';

const columns: TableColumn<Invoice>[] = [
  {
    title: 'Description',
    dataIndex: 'description',
    width: 200,
    editType: EDIT_TYPE.INPUT,
    summary: () => <>Total</>,  // Custom label
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    width: 120,
    align: 'right',
    valueType: 'amount',          // Format summary as amount
    editType: EDIT_TYPE.INPUT_NUMER,
    editProps: {
      numberType: 'amount',
    },
    summary: AGGERATE_TYPE.SUM,   // Auto-sum column values
  },
  {
    title: 'VAT',
    dataIndex: 'vat',
    width: 100,
    align: 'right',
    valueType: 'amount',
    editType: EDIT_TYPE.INPUT_NUMER,
    editProps: {
      numberType: 'amount',
    },
    summary: AGGERATE_TYPE.SUM,
  },
];
```

---

## Examples

### Complete CRUD Page Example

```tsx
import React, { useRef, useState } from 'react';
import { Button, Flex, Form, message, Space } from 'antd';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import { AddButton, DeleteButton, SaveButton } from '@/components/buttons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AGGERATE_TYPE,
  EDIT_TYPE,
  type EditTableHandler,
  type TableColumn,
  type TableData,
} from '@/types';

interface ContractItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  remark: string;
}

const ContractItemPage: React.FC = () => {
  const [tableForm] = Form.useForm();
  const tableRef = useRef<EditTableHandler<ContractItem>>(null);
  const [selectedRows, setSelectedRows] = useState<TableData<ContractItem>[]>([]);

  // Fetch initial data
  const { data: items, isLoading } = useQuery({
    queryKey: ['contract-items'],
    queryFn: fetchContractItems,
  });

  // Save mutation
  const { mutate: saveItems, isPending: isSaving } = useMutation({
    mutationFn: async (data: { items: ContractItem[]; deleted: ContractItem[] }) => {
      // API call to save
      return saveContractItems(data);
    },
    onSuccess: () => {
      message.success('Saved successfully');
      tableRef.current?.resetDeletedRows();
    },
    onError: () => {
      message.error('Failed to save');
    },
  });

  const columns: TableColumn<ContractItem>[] = [
    {
      key: 'itemCode',
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 120,
      resizable: false,
      draggable: false,
      editType: EDIT_TYPE.INPUT,
      editProps: {
        required: true,
        maxLength: 20,
        placeholder: 'Enter code',
      },
    },
    {
      key: 'itemName',
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 200,
      editType: EDIT_TYPE.INPUT,
      editProps: {
        required: true,
        maxLength: 100,
        placeholder: 'Enter name',
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
          form.setFieldValue(['items', name[0], 'totalAmount'], value * unitPrice);
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
          form.setFieldValue(['items', name[0], 'totalAmount'], value * qty);
        },
      },
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      dataIndex: 'totalAmount',
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
      width: 200,
      editType: EDIT_TYPE.INPUT,
      editProps: {
        maxLength: 200,
      },
    },
  ];

  const handleAddRow = () => {
    tableRef.current?.onAddRow({
      itemCode: '',
      itemName: '',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0,
      remark: '',
    });
  };

  const handleDeleteRows = () => {
    if (selectedRows.length === 0) {
      message.warning('Please select rows to delete');
      return;
    }
    const keys = selectedRows.map(row => row.key) as number[];
    tableRef.current?.onRemoveRow(keys);
    setSelectedRows([]);
  };

  const handleDuplicateRows = () => {
    if (selectedRows.length === 0) {
      message.warning('Please select rows to duplicate');
      return;
    }
    tableRef.current?.duplicateRow(selectedRows);
    setSelectedRows([]);
  };

  const handleSave = async () => {
    try {
      const values = await tableForm.validateFields();
      const deletedRows = tableRef.current?.getDeletedRows() || [];
      
      await saveItems({
        items: values.items.filter((item: ContractItem & { procFlag: string }) => 
          item.procFlag !== 'S'  // Only send changed rows
        ),
        deleted: deletedRows,
      });
    } catch (error) {
      message.error('Please fix validation errors');
    }
  };

  return (
    <Flex vertical gap={8}>
      <Flex justify="end" gap={8}>
        <Button onClick={handleDuplicateRows}>Duplicate</Button>
        <AddButton onClick={handleAddRow}>Add Item</AddButton>
        <DeleteButton onClick={handleDeleteRows}>Delete</DeleteButton>
        <SaveButton loading={isSaving} onClick={handleSave}>Save</SaveButton>
      </Flex>

      <EditCustomTable<ContractItem>
        ref={tableRef}
        form={tableForm}
        formTableName="items"
        columns={columns}
        data={items?.map((item, idx) => ({ ...item, key: idx })) || []}
        loading={isLoading}
        tableState={{
          rowSelection: selectedRows,
        }}
        onSelectChange={(keys, rows) => setSelectedRows(rows)}
        onTableDataChange={(changedRow) => {
          console.log('Row changed:', changedRow);
        }}
        exportFileName="contract_items"
      />
    </Flex>
  );
};

export default ContractItemPage;
```

---

## Understanding procFlag

Each row automatically gets a `procFlag` property to track its state:

| Value | Meaning | Description |
|-------|---------|-------------|
| `'S'` | Saved | Original row, unchanged |
| `'I'` | Inserted | Newly added row |
| `'U'` | Updated | Original row that was modified |
| `'D'` | Deleted | Row marked for deletion |

Use this when sending data to your API:

```tsx
const handleSave = async () => {
  const values = await tableForm.validateFields();
  const deletedRows = tableRef.current?.getDeletedRows() || [];

  // Separate by operation type
  const toInsert = values.items.filter(row => row.procFlag === 'I');
  const toUpdate = values.items.filter(row => row.procFlag === 'U');
  const toDelete = deletedRows;  // Already filtered, have procFlag = 'D'

  // Send to API
  await api.saveContractItems({
    insert: toInsert,
    update: toUpdate,
    delete: toDelete,
  });
  
  // Reset tracking after successful save
  tableRef.current?.resetDeletedRows();
};
```

---

## Related Components

- [CustomTable](./CustomTable.md) - Read-only table component
- [Search Modals](./SearchModals.md) - Search modal components for SEARCH cell type

---

## Best Practices

1. **Always validate before saving**: Use `await tableForm.validateFields()` before processing data
2. **Track deleted rows**: Call `getDeletedRows()` to get rows removed from the table
3. **Reset after save**: Call `resetDeletedRows()` after successful API save
4. **Use proper number types**: Choose `'amount'` for currency, `'number'` for quantities
5. **Implement cascading updates**: Use `onChange` to update related fields
6. **Add cross-field validation**: Use custom rules with `getFieldValue` for dependent validations
7. **Use `shouldUpdate` wisely**: Only re-render when necessary to maintain performance

