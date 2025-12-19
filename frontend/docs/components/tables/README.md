# Custom Table Components Documentation

Welcome to the Custom Table Components documentation. This guide will help developers understand and implement the table components in their pages.

## Overview

This project provides two main table components built on top of Ant Design Table:

| Component | Description | Use Case |
|-----------|-------------|----------|
| **CustomTable** | Read-only table with advanced features | Data display, reports, lists |
| **EditCustomTable** | Editable table with form integration | Data entry, CRUD operations |

## Documentation Index

### 📚 Core Documentation

1. **[CustomTable.md](./CustomTable.md)** - Complete guide for the read-only table component
   - Props reference
   - Pagination, sorting, filtering
   - Row selection
   - Tree data support
   - Context menu & export

2. **[EditCustomTable.md](./EditCustomTable.md)** - Complete guide for the editable table component
   - Form integration
   - Cell types (Input, Select, Checkbox, etc.)
   - Table handler methods
   - Validation patterns
   - CRUD operations

3. **[ColumnConfiguration.md](./ColumnConfiguration.md)** - Detailed column configuration guide
   - All column properties
   - Filter configurations
   - Summary/aggregation
   - Excel export settings
   - Copy-paste examples

4. **[QuickReference.md](./QuickReference.md)** - Quick lookup cheatsheet
   - Import statements
   - Common patterns
   - Props cheatsheet
   - File structure

---

## Quick Start

### Read-Only Table (CustomTable)

```tsx
import React, { useState } from 'react';
import { Form } from 'antd';
import CustomTable from '@/components/custom-table/CustomTable';
import type { TableColumn, TableData } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
}

const UserListPage = () => {
  const [selectedRows, setSelectedRows] = useState<TableData<User>[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 15,
  });

  const columns: TableColumn<User>[] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 100 },
    { key: 'name', title: 'Name', dataIndex: 'name', width: 150 },
    { key: 'email', title: 'Email', dataIndex: 'email', width: 200 },
  ];

  const data = [
    { id: '001', name: 'John', email: 'john@example.com' },
    { id: '002', name: 'Jane', email: 'jane@example.com' },
  ];

  return (
    <CustomTable<User>
      columns={columns}
      data={data.map((item, index) => ({ ...item, key: index }))}
      tableState={{
        pagination,
        rowSelection: selectedRows,
      }}
      onPaginationChange={(current, pageSize) => {
        setPagination(prev => ({ ...prev, current, pageSize }));
      }}
      onSelectChange={(keys, rows) => setSelectedRows(rows)}
    />
  );
};
```

### Editable Table (EditCustomTable)

```tsx
import React, { useRef, useState } from 'react';
import { Button, Form } from 'antd';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import { EDIT_TYPE, type EditTableHandler, type TableColumn, type TableData } from '@/types';

interface Item {
  name: string;
  quantity: number;
  active: string;
}

const ItemEditPage = () => {
  const [form] = Form.useForm();
  const tableRef = useRef<EditTableHandler<Item>>(null);
  const [selectedRows, setSelectedRows] = useState<TableData<Item>[]>([]);

  const columns: TableColumn<Item>[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      editType: EDIT_TYPE.INPUT,
      editProps: { required: true, placeholder: 'Enter name' },
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      align: 'right',
      editType: EDIT_TYPE.INPUT_NUMER,
      editProps: { numberType: 'number' },
    },
    {
      key: 'active',
      title: 'Active',
      dataIndex: 'active',
      width: 80,
      align: 'center',
      editType: EDIT_TYPE.CHECKBOX,
      editProps: { checkboxMapping: { checked: 'Y', unchecked: 'N' } },
    },
  ];

  const handleAdd = () => tableRef.current?.onAddRow({ active: 'Y' });

  const handleSave = async () => {
    const values = await form.validateFields();
    console.log('Data:', values.items);
  };

  return (
    <>
      <Button onClick={handleAdd}>Add</Button>
      <Button onClick={handleSave}>Save</Button>
      
      <EditCustomTable<Item>
        ref={tableRef}
        form={form}
        formTableName="items"
        columns={columns}
        data={[]}
        tableState={{ rowSelection: selectedRows }}
        onSelectChange={(_, rows) => setSelectedRows(rows)}
      />
    </>
  );
};
```

---

## Key Features

### CustomTable Features
- ✅ Server-side pagination
- ✅ Server-side sorting
- ✅ Column filtering (Text, Select, Number, Date)
- ✅ Row selection (checkbox/radio)
- ✅ Column resizing
- ✅ Column drag & drop reordering
- ✅ Column grouping (nested headers)
- ✅ Tree data with expandable rows
- ✅ Summary footer with aggregations
- ✅ Context menu (copy, export, fullscreen)
- ✅ Excel export
- ✅ Virtual scrolling for large datasets

### EditCustomTable Features
- ✅ Inline cell editing
- ✅ Multiple cell types (Input, Number, Select, etc.)
- ✅ Form validation integration
- ✅ Row add/insert/delete operations
- ✅ Track changes (procFlag: S/I/U/D)
- ✅ Deleted rows tracking
- ✅ Conditional cell properties
- ✅ Cross-cell validation
- ✅ Calculated fields
- ✅ Search modal integration
- ✅ Summary footer with live updates

---

## Real-World Examples

Check these existing pages in the codebase for reference:

| Page | Location | Features Demonstrated |
|------|----------|----------------------|
| **DefaultPage** | `src/pages/app/DefaultPage.tsx` | All table features, complete examples |
| **UserManagementPage** | `src/pages/app/administration/UserManagementPage.tsx` | CustomTable with filters, pagination, export |
| **ProgramTable** | `src/components/modules/administration/role-management/tables/ProgramTable.tsx` | Tree data table |

---

## Tips & Best Practices

### Performance
- Use `virtual={true}` for tables with 1000+ rows
- Set `headerOffset` correctly based on your page layout
- Use `shouldUpdate` sparingly in EditCustomTable

### Column Configuration
- Always specify `width` for every column
- Use `fixed: 'left'` for key identifier columns
- Disable `resizable` and `draggable` for fixed columns
- Use `ellipsis: true` for potentially long text

### Editable Tables
- Always validate with `form.validateFields()` before saving
- Use `getDeletedRows()` to track removed rows
- Call `resetDeletedRows()` after successful save
- Use `procFlag` to optimize API calls (only send changed rows)

### Data Preparation
- Always add `key` property to data items
- Use index as key for display-only tables
- Use unique identifier as key for editable tables

---

## Type Definitions

All types are exported from `@/types`:

```tsx
import type {
  // Column types
  TableColumn,
  TableData,
  TableState,
  
  // Edit table types
  EditTableHandler,
  EditProps,
  
  // Filter types
  DynamicFilterDto,
  FilterTableProps,
  
  // Excel types
  ExcelProps,
  
  // Pagination types
  Pagination,
  Sort,
} from '@/types';

import {
  EDIT_TYPE,          // Cell edit types
  TABLE_FILTER_TYPE,  // Filter types
  AGGERATE_TYPE,      // Summary types
  SORT,               // Sort direction
  TABLE_ACTIONS,      // Table action types
} from '@/types';
```

---

## Support

For questions or issues:
1. Check the detailed documentation in this folder
2. Look at existing page implementations
3. Review the source code in `src/components/custom-table/`

