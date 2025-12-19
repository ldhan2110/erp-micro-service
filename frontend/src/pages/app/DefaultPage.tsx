// PGM_ID: ADM_001 - What's news page ?
import React, { useState } from 'react';
import { Button, Flex, Form, Space, Tag } from 'antd';
import CustomTable from '../../components/custom-table/CustomTable';
import {
	AddButton,
	DeleteButton,
	RefreshButton,
	SaveButton,
	UploadButton,
} from '@/components/buttons';
import { useShowMessage } from '@/hooks';
import { MESSAGE_CODES } from '@/constants';
import {
	FormCheckbox,
	FormDatePicker,
	FormFieldset,
	FormInput,
	FormMultiSelect,
	FormRadioGroup,
	FormRangeNumberInput,
	FormRichEditor,
	FormSearchContainer,
	FormSelect,
	FormTextArea,
	FormTimePicker,
} from '@/components/form';
import { FormNumberInput } from '@/components/form/FormNumberInput';
import { observer } from 'mobx-react-lite';
import {
	AGGERATE_TYPE,
	EDIT_TYPE,
	TABLE_FILTER_TYPE,
	type CustomRuleObject,
	type DynamicFilterDto,
	type EditTableHandler,
	type TableColumn,
	type TableData,
} from '@/types';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import { isEqual } from 'lodash';
import { formatNumberAmount } from '@/utils/helper';
import { CountrySearchModal, FormCountrySearch } from '@/components/modules/common';
import appStore from '@/stores/AppStore';
import { ROUTE_KEYS } from '@/utils/routes';
import { downloadFileAndSave } from '@/services/api/common';

const data: DataType[] = [
	{
		name: 'John Brown',
		age: 32,
		countryCode: 'US',
		countryName: 'United States',
		salary: 60000,
		vatAmount: 6000,
		address: 'New York No. 1 Lake Park dnsauosoahduhfsahfusahfosafhaofhdsioafsdafdsafsdfsafsdafa',
		tags: ['LEAD', 'SUB-LEAD'],
		role: 'PM',
		activeYn: 'Y',
	},
	{
		name: 'Jim Green',
		age: 42,
		countryCode: 'US',
		countryName: 'United States',
		salary: 60000,
		vatAmount: 6000,
		address: 'London No. 1 Lake Park',
		tags: ['LEAD', 'SUB-LEAD'],
		role: 'PM',
		activeYn: 'Y',
	},
	{
		name: 'Anh Le',
		age: 32,
		countryCode: 'VN',
		countryName: 'Viet Nam',
		salary: 60000,
		vatAmount: 6000,
		address: 'Sydney No. 1 Lake Park',
		tags: ['WD', 'DEVOPS'],
		role: 'DEV',
		activeYn: 'N',
	},
];

const invoiceData: Invoice[] = [
	{
		invoiceNo: 'INV-2025-001',
		invoiceStatus: 'Pending',
		customerName: 'ABC Trading Co.',
		customerNumber: 'CUST-1001',
		invoiceAmount: 5000.0,
		invoiceVatAmount: 500.0,
		invoicePayAmount: 5500.0,
		invoiceDate: '2025-10-01',
		invoiceDueDate: '2025-10-31',
	},
	{
		invoiceNo: 'INV-2025-002',
		invoiceStatus: 'Paid',
		customerName: 'Global Solutions Ltd.',
		customerNumber: 'CUST-1002',
		invoiceAmount: 12000.0,
		invoiceVatAmount: 1200.0,
		invoicePayAmount: 13200.0,
		invoiceDate: '2025-09-15',
		invoiceDueDate: '2025-10-15',
	},
	{
		invoiceNo: 'INV-2025-003',
		invoiceStatus: 'Overdue',
		customerName: 'Sunrise Electronics',
		customerNumber: 'CUST-1003',
		invoiceAmount: 7500.0,
		invoiceVatAmount: 750.0,
		invoicePayAmount: 8250.0,
		invoiceDate: '2025-08-20',
		invoiceDueDate: '2025-09-20',
	},
	{
		invoiceNo: 'INV-2025-004',
		invoiceStatus: 'Cancelled',
		customerName: 'Bright Future Corp.',
		customerNumber: 'CUST-1004',
		invoiceAmount: 3000.0,
		invoiceVatAmount: 300.0,
		invoicePayAmount: 3300.0,
		invoiceDate: '2025-10-05',
		invoiceDueDate: '2025-11-05',
	},
	{
		invoiceNo: 'INV-2025-005',
		invoiceStatus: 'Pending',
		customerName: 'NextGen Textiles',
		customerNumber: 'CUST-1005',
		invoiceAmount: 9800.0,
		invoiceVatAmount: 980.0,
		invoicePayAmount: 10780.0,
		invoiceDate: '2025-10-10',
		invoiceDueDate: '2025-11-10',
	},
];

interface DataType {
	name: string;
	age: number;
	countryCode: string;
	countryName: string;
	salary: number;
	vatAmount: number;
	receivableAmount?: number;
	startDate?: string;
	endDate?: string;
	address: string;
	tags: string[];
	role: string;
	activeYn: string;
	checkInTime?: string;
}

interface Invoice {
	invoiceNo: string;
	invoiceStatus: string;
	customerName: string;
	customerNumber: string;
	invoiceAmount: number;
	invoiceVatAmount: number;
	invoicePayAmount: number;
	invoiceDate: string;
	invoiceDueDate: string;
}

interface MyFormValue {
	username: string;
	password: string;
	status: string;
	remark: string;
	sellSoulYn: boolean;
	countryCode: string;
}

interface ContractFormValue {
	ctrtTp: string;
	salary: number;
	quantity: number;
}

interface SearchFormValue {
	userId: string;
	username: string;
	office: string;
	status: string;
}

const groupColumns: TableColumn<Invoice>[] = [
	{
		title: 'Invoice Number',
		dataIndex: 'invoiceNo',
		key: 'invoiceNo',
		width: 50,
		fixed: 'left',
		resizable: false,
		draggable: false,
		excelProps: {
			exportType: 'string',
		},
	},
	{
		title: 'Invoice Status',
		dataIndex: 'invoiceStatus',
		key: 'invoiceStatus',
		width: 50,
		fixed: 'left',
		render: (text: string) => {
			let color: string = '';
			switch (text) {
				case 'Paid':
					color = 'success';
					break;
				case 'Pending':
					color = 'warning';
					break;
				case 'Overdue':
					color = 'error';
					break;
				default:
					color = 'default';
			}
			return <Tag color={color}>{text.toUpperCase()}</Tag>;
		},
	},
	{
		title: 'Customer',
		children: [
			{
				title: 'Code',
				dataIndex: 'customerNumber',
				width: 50,
				excelProps: {
					exportType: 'string',
				},
			},
			{
				title: 'Name',
				dataIndex: 'customerName',
				width: 50,
				summary: () => <>Total</>,
			},
		],
	},
	{
		title: 'Invoice',
		children: [
			{
				title: 'Incurred Amount',
				dataIndex: 'invoiceAmount',
				valueType: 'amount',
				width: 50,
				align: 'right',
				summary: AGGERATE_TYPE.SUM,
				excelProps: {
					exportType: 'number',
					exportFormat: '#,##0.00',
				},
				render: (value: number) => formatNumberAmount(value),
			},
			{
				title: 'VAT',
				dataIndex: 'invoiceVatAmount',
				valueType: 'amount',
				width: 50,
				align: 'right',
				summary: AGGERATE_TYPE.SUM,
				excelProps: {
					exportType: 'number',
					exportFormat: '#,##0.00',
				},
				render: (value: number) => formatNumberAmount(value),
			},
			{
				title: 'Total Amount',
				dataIndex: 'invoicePayAmount',
				valueType: 'amount',
				width: 50,
				align: 'right',
				summary: AGGERATE_TYPE.MIN,
				excelProps: {
					exportType: 'number',
					exportFormat: '#,##0.00',
				},
				render: (value: number) => formatNumberAmount(value),
			},
		],
	},
];

const columns: TableColumn<DataType>[] = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		width: 100,
		fixed: 'left',
		filterProps: {
			showFilter: true,
			filterType: TABLE_FILTER_TYPE.TEXT,
			filterName: 'name',
		},
		excelProps: {
			exportType: 'string',
			hideInExport: true,
		},
		render: (text: string) => <a>{text}</a>,
	},
	{
		title: 'Age',
		dataIndex: 'age',
		key: 'age',
		width: 50,
		resizable: true,
		filterProps: {
			showFilter: true,
			filterType: TABLE_FILTER_TYPE.NUMBER,
			filterName: 'age',
			filterNumberType: 'amount',
		},
		excelProps: {
			exportType: 'number',
			exportFormat: '#,##0',
		},
	},
	{
		title: 'Address',
		dataIndex: 'address',
		key: 'address',
		width: 100,
		filterProps: {
			showFilter: true,
			filterType: TABLE_FILTER_TYPE.DATEPICKER,
			filterName: 'address',
		},
	},
	{
		title: 'Tags',
		key: 'tags',
		dataIndex: 'tags',
		width: 100,
		filterProps: {
			showFilter: true,
			filterType: TABLE_FILTER_TYPE.SELECT,
			filterName: 'tags',
			filterOptions: [
				{ label: 'Lead', value: 'LEAD' },
				{ label: 'Sub-Lead', value: 'SUBLEAD' },
			],
		},
		render: (_, { tags }) => (
			<>
				{tags.map((tag) => {
					let color = tag.length > 5 ? 'geekblue' : 'green';
					if (tag === 'loser') {
						color = 'volcano';
					}
					return (
						<Tag color={color} key={tag}>
							{tag.toUpperCase()}
						</Tag>
					);
				})}
			</>
		),
	},
	{
		title: 'Role',
		key: 'role',
		dataIndex: 'role',
		width: 150,
		render: (text) => (
			<>
				<Tag color={'blue'}>{text.toUpperCase()}</Tag>
			</>
		),
	},
	{
		title: 'Action',
		key: 'action',
		width: 100,
		fixed: 'right',
		render: (_, record) => (
			<Space size="middle">
				<a>Invite {record.name}</a>
				<a>Delete</a>
			</Space>
		),
	},
];

type DefaultPageProps = {
	params?: { content: string };
};

const DefaultPage: React.FC = observer(({ params }: DefaultPageProps) => {
	const [selectionRows, setSelectionRows] = useState<TableData<DataType>[]>([]);
	const [pagination] = useState({
		total: 0,
		current: 1,
		pageSize: 15,
	});
	const [userInfoData, setUserInfoData] = React.useState<DataType[]>(data);
	const [myForm] = Form.useForm<MyFormValue>();
	const [contractForm] = Form.useForm<ContractFormValue>();
	const [searchForm] = Form.useForm<SearchFormValue>();
	const [tableFilterForm] = Form.useForm();
	const [tableForm] = Form.useForm();
	const {
		showConfirmMessage,
		showErrorMessage,
		showWarningMessage,
		showInfoMessage,
		showSuccessMessage,
	} = useShowMessage();

	React.useEffect(() => {
		console.log(params?.content);
	}, [params]);

	// Refs
	const editTableHandlerRef = React.useRef<EditTableHandler<DataType> | null>(null);

	function onFormSubmit(values: MyFormValue) {
		console.log(values);
	}

	function onContractFormSubmit(values: ContractFormValue) {
		console.log(values);
	}

	function onFormRefresh() {
		searchForm.resetFields();
	}

	async function onFormSearch() {
		try {
			await searchForm.validateFields();
			console.log(searchForm.getFieldsValue());
		} catch {
			return;
		}
	}

	const initFormVal: MyFormValue = {
		sellSoulYn: true,
		remark: 'Hello World',
		status: 'Y',
		username: 'admin',
		password: '@Gfa123',
		countryCode: 'VN',
	};

	function reloadOptionBasedOnRole(role: string) {
		switch (role) {
			case 'PM':
				return [
					{ label: 'Leader', value: 'LEAD' },
					{ label: 'Sub-Lead', value: 'SUB-LEAD' },
				];
			case 'QC':
				return [
					{ label: 'Quality Control', value: 'QC' },
					{ label: 'Quality Assurance', value: 'QA' },
				];
			case 'DEV':
				return [
					{ label: 'Web-Developer', value: 'WD' },
					{ label: 'DevOps', value: 'DEVOPS' },
				];
		}
	}

	const editColumns: TableColumn<DataType>[] = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			editType: EDIT_TYPE.INPUT,
			width: 100,
			sorter: true,
			showHeaderMenu: true,
			resizable: true,
			draggable: false,
			editProps: {
				required: true,
				maxLength: 10,
				placeholder: 'Enter Username',
				shouldUpdate: (prev, curr, rowIndex) => {
					return !isEqual(prev['user'][rowIndex], curr['user'][rowIndex]);
				},
				overrideEditProps(curVal, rowIdx) {
					const dataTable = (curVal['user'] || []) as TableData<DataType>[];
					return {
						disabled: dataTable[rowIdx].activeYn === 'N',
					};
				},
			},
		},
		{
			title: 'Age',
			dataIndex: 'age',
			key: 'age',
			width: 100,
			align: 'right',
			summary: AGGERATE_TYPE.SUM,
			editType: EDIT_TYPE.INPUT_NUMER,
			editProps: {
				maxLength: 10,
				placeholder: 'Enter Age',
				numberType: 'amount',
				shouldUpdate: (prev, curr, rowIndex) => {
					return !isEqual(prev['user'][rowIndex], curr['user'][rowIndex]);
				},
				overrideEditProps(curVal, rowIndex) {
					const dataTable = (curVal['user'] || []) as TableData<DataType>[];
					return {
						disabled: dataTable[rowIndex].activeYn === 'N',
						rules: [],
					};
				},
			},
		},
		{
			title: 'Check-in Time',
			dataIndex: 'checkInTime',
			key: 'checkInTime',
			width: 140,
			editType: EDIT_TYPE.TIMEPICKER,
			editProps: {
				placeholder: 'Enter Check-in Time',
			},
		},
		{
			title: 'Country',
			children: [
				{
					title: 'Code',
					dataIndex: 'countryCode',
					key: 'countryCode',
					width: 100,
					editType: EDIT_TYPE.SEARCH,
					editProps: {
						placeholder: 'Search Country',
						searchModal: <CountrySearchModal />,
						onSearchSelect: (record, rowIdx, form) => {
							form.setFieldValue(['user', rowIdx, 'countryName'], record['countryName']);
							console.log(record, rowIdx, form);
						},
					},
				},
				{
					title: 'Name',
					dataIndex: 'countryName',
					key: 'countryName',
					width: 100,
					editProps: {
						shouldUpdate: (prev, curr, rowIndex) => {
							return !isEqual(prev['user'][rowIndex], curr['user'][rowIndex]);
						},
					},
				},
			],
		},
		{
			title: 'Start Date',
			dataIndex: 'startDate',
			key: 'startDate',
			width: 150,
			editType: EDIT_TYPE.DATEPICKER,
			editProps: {
				placeholder: 'Enter Start Date',
				rules: [
					({ getFieldValue }) => ({
						validator(ruleObject: CustomRuleObject, value) {
							const fields = ruleObject.field?.split('.') ?? [];
							const formName = fields[0];
							const rowKey = fields[1];
							const endDate =
								formName && rowKey ? getFieldValue([formName, rowKey, 'endDate']) : undefined;
							if (!value || !endDate || !value.isBefore(endDate)) {
								return Promise.reject(new Error('Start date must be before end date!'));
							}
							return Promise.resolve();
						},
					}),
				],
				onChange: (_value, _event, form, name) => {
					form.validateFields([['user', name[0], 'endDate']]);
				},
			},
			excelProps: {
				exportType: 'date',
				exportFormat: 'DD/MM/YYYY',
			},
		},
		{
			title: 'End Date',
			dataIndex: 'endDate',
			key: 'endDate',
			width: 150,
			editType: EDIT_TYPE.DATEPICKER,
			editProps: {
				placeholder: 'Enter End Date',
				rules: [
					({ getFieldValue }) => ({
						validator(ruleObject: CustomRuleObject, value) {
							const fields = ruleObject.field?.split('.') ?? [];
							const formName = fields[0];
							const rowKey = fields[1];
							const startDate =
								formName && rowKey ? getFieldValue([formName, rowKey, 'startDate']) : undefined;
							if (!value || !startDate || value.isBefore(startDate)) {
								return Promise.reject(new Error('End date must be after start date!'));
							}
							return Promise.resolve();
						},
					}),
				],
				onChange: (_value, _event, form, name) => {
					form.validateFields([['user', name[0], 'startDate']]);
				},
			},
			excelProps: {
				exportType: 'date',
				exportFormat: 'DD/MM/YYYY',
			},
		},
		{
			title: 'Salary',
			dataIndex: 'salary',
			key: 'salary',
			width: 100,
			valueType: 'amount',
			align: 'right',
			summary: AGGERATE_TYPE.SUM,
			editType: EDIT_TYPE.INPUT_NUMER,
			editProps: {
				required: true,
				maxLength: 10,
				placeholder: 'Enter Age',
				numberType: 'amount',
				onChange(_value, _event, form, name) {
					const receivableAmount =
						(form.getFieldValue(['user', name[0], 'salary']) ?? 0) -
						(form.getFieldValue(['user', name[0], 'vatAmount']) ?? 0);
					form.setFieldValue(['user', name[0], 'receivableAmount'], receivableAmount);
				},
			},
		},
		{
			title: 'VAT Amount',
			dataIndex: 'vatAmount',
			key: 'vatAmount',
			width: 100,
			valueType: 'amount',
			align: 'right',
			summary: AGGERATE_TYPE.SUM,
			editType: EDIT_TYPE.INPUT_NUMER,
			editProps: {
				required: true,
				maxLength: 10,
				placeholder: 'Enter VAT',
				numberType: 'amount',
				onChange(_value, _event, form, name) {
					const receivableAmount =
						(form.getFieldValue(['user', name[0], 'salary']) ?? 0) -
						(form.getFieldValue(['user', name[0], 'vatAmount']) ?? 0);
					form.setFieldValue(['user', name[0], 'receivableAmount'], receivableAmount);
				},
			},
		},
		{
			title: 'Receivable Amount',
			dataIndex: 'receivableAmount',
			key: 'receivableAmount',
			valueType: 'amount',
			width: 125,
			align: 'right',
			summary: AGGERATE_TYPE.SUM,
			editType: EDIT_TYPE.INPUT_NUMER,
			editProps: {
				disabled: true,
				numberType: 'amount',
			},
		},
		{
			title: 'Address',
			dataIndex: 'address',
			key: 'address',
			width: 250,
			editType: EDIT_TYPE.INPUT,
		},
		{
			title: 'Tags',
			key: 'tags',
			dataIndex: 'tags',
			width: 200,
			editType: EDIT_TYPE.MULTI_SELECT,
			editProps: {
				required: true,
				placeholder: 'Enter Tag',
				options: [
					{ label: 'cool', value: 'cool' },
					{ label: 'teacher', value: 'teacher' },
					{ label: 'loser', value: 'loser' },
					{ label: 'developer', value: 'developer' },
				],
				shouldUpdate: (prev, curr, rowIndex) => {
					return !isEqual(prev['user'][rowIndex], curr['user'][rowIndex]);
				},
				overrideEditProps(curVal, rowIndex) {
					const dataTable = (curVal['user'] || []) as TableData<DataType>[];
					return {
						disabled: dataTable[rowIndex].role == null,
						options: reloadOptionBasedOnRole(dataTable[rowIndex].role),
					};
				},
			},
		},
		{
			title: 'Role',
			key: 'role',
			dataIndex: 'role',
			width: 150,
			editType: EDIT_TYPE.SELECT,
			editProps: {
				required: true,
				placeholder: 'Enter Role',
				options: [
					{ label: 'Project Manager', value: 'PM' },
					{ label: 'Quality Control', value: 'QC' },
					{ label: 'Developer', value: 'DEV' },
				],
				onChange(_value, _event, form, name) {
					form.setFieldValue(['user', name[0], 'tags'], []); // Clear tags when role changes
				},
			},
		},
		{
			title: 'Active',
			align: 'center',
			key: 'activeYn',
			dataIndex: 'activeYn',
			width: 50,
			editType: EDIT_TYPE.CHECKBOX,
			editProps: {
				checkboxMapping: {
					checked: 'Y',
					unchecked: 'N',
				},
			},
		},
	];

	// Edit Tables Methods
	async function handleGetTableData() {
		const values = await tableForm.validateFields();
		console.log('Table Data:', values);
	}

	function handleAddRow() {
		editTableHandlerRef.current?.onAddRow?.({ activeYn: 'N' });
	}

	function handleDeleteRow() {
		console.log('Selected Rows:', selectionRows);
		if (selectionRows.length === 0) {
			showWarningMessage(MESSAGE_CODES.COM000005);
		} else {
			editTableHandlerRef.current?.onRemoveRow?.(selectionRows.map((item) => item.key) as number[]);
			showSuccessMessage(MESSAGE_CODES.COM000007);
			setSelectionRows([]);
		}
	}

	function handleSelectChange(
		_selectedRowKeys: React.Key[],
		selectedRows: TableData<DataType>[],
	): void {
		setSelectionRows(selectedRows);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	function handleFilterChange(filterValue: DynamicFilterDto[]) {
		console.log(filterValue);
		setUserInfoData(
			data.filter((item) => {
				return Object.entries(filterValue).every(([key, value]) => {
					if (value.value === undefined || value.value === null || value.value === '') return true; // ignore empty filter

					const field = item[key as keyof DataType];

					// handle array (e.g., tags)
					if (Array.isArray(field)) {
						return field.some((v) => String(v).toLowerCase().includes(String(value).toLowerCase()));
					}

					// handle string/number
					return String(field).toLowerCase().includes(String(value).toLowerCase());
				});
			}),
		);
	}

	function handleOpenNewTab() {
		appStore.openNewTabByKey(ROUTE_KEYS.MAIN, {
			label: 'MAIN-2021',
			params: {
				content: 'this is the config param',
			},
		});
	}

	return (
		<div className="p-4">
			<Flex vertical gap={8}>
				<Flex gap={4}>
					<Button onClick={() => showConfirmMessage(MESSAGE_CODES.COM000001)}>Show Confirm</Button>
					<Button onClick={() => showErrorMessage(MESSAGE_CODES.COM000001)}>Show Error</Button>
					<Button onClick={() => showInfoMessage(MESSAGE_CODES.COM000001)}>Show Info</Button>
					<Button onClick={() => showWarningMessage(MESSAGE_CODES.COM000001)}>Show Warning</Button>
					<Button onClick={() => showSuccessMessage(MESSAGE_CODES.COM000001)}>Show Success</Button>
				</Flex>

				<Flex gap={4}>
					<Button type="primary">Submit</Button>
					<Button>Click me</Button>
					<Button danger>Cancel</Button>
					<AddButton>Add Row</AddButton>
					<DeleteButton>Delete Row</DeleteButton>
					<SaveButton />
					<RefreshButton />
					<UploadButton title="Click to Upload" />
					<Button type="primary" onClick={handleOpenNewTab}>
						Open New Tab
					</Button>
					<Button onClick={async () => {
						await downloadFileAndSave('FILE202511210003')
					}}>Dowload File</Button>
				</Flex>

				<Flex gap={8}>
					<Form form={myForm} layout="vertical" initialValues={initFormVal} onFinish={onFormSubmit}>
						<FormFieldset title="User Information">
							<Flex gap={8} vertical>
								<Flex gap={4}>
									<FormInput name="username" label={'Username'} max={20} required />
									<FormInput name="password" label={'Password'} type="password" max={20} required />
									<FormCountrySearch />
									<FormSelect
										name="status"
										label={'Status'}
										required
										width={150}
										options={[
											{ label: 'Active', value: 'Y' },
											{ label: 'Inactive', value: 'N' },
										]}
									/>
								</Flex>
								<FormRangeNumberInput
									name="range"
									label="Cost"
									type="amount"
									precision={2}
									placeholder={['From', 'To'] as [string, string]}
								/>
								<FormTextArea name="remark" label="Remark" />
								<FormCheckbox name="sellSoulYn" title="I agree to sell my soul to LBU" />
								<Flex gap={4} align="end">
									<Button type="primary" htmlType="submit">
										Submit Form
									</Button>
								</Flex>
							</Flex>
						</FormFieldset>
					</Form>
					<Form form={contractForm} layout="vertical" onFinish={onContractFormSubmit}>
						<FormFieldset title="Contract Information">
							<Flex vertical gap={8}>
								<FormRadioGroup
									name="ctrtTp"
									options={[
										{ label: 'Exempted', value: 'EXP' },
										{ label: 'Probation', value: 'PRB' },
										{ label: 'Global Service Desk', value: 'GSD' },
									]}
								/>
								<Flex gap={8}>
									<FormNumberInput name="salary" label="Salary" required type="amount" />
									<FormNumberInput
										name="quantity"
										label="Quantity"
										required
										type="number"
										max={100}
									/>
								</Flex>
								<Flex gap={8}>
									<FormMultiSelect
										name="apprSts"
										label="Approval Status"
										options={[
											{ label: 'Exempted', value: 'EXP' },
											{ label: 'Probation', value: 'PRB' },
											{ label: 'Global Service Desk', value: 'GSD' },
										]}
									/>
									<FormMultiSelect
										name="businessTpCd"
										allowSelectAll
										label="Business Type"
										options={[
											{ label: 'Private Contract', value: 'PCT' },
											{ label: 'Complex Business', value: 'CBS' },
											{ label: 'SOC', value: 'SOC' },
										]}
									/>
									<FormTimePicker name="time" label={'Time'} width={150} placeholder="HH:mm" />
								</Flex>
								<Flex gap={8}>
									<FormDatePicker name="efcDt" label="Effective Date" />
									<FormDatePicker name="pkcUpDt" label="Pick-up Date" showTime />
								</Flex>
								<FormRichEditor name="richEditor" width={970} minHeight={20} height={100} buttonType='full' />
								<Flex gap={4} align="end">
									<Button type="primary" htmlType="submit">
										Submit Form
									</Button>
								</Flex>
							</Flex>
						</FormFieldset>
					</Form>
				</Flex>

				

				<Flex>
					<FormSearchContainer
						form={searchForm}
						onRefresh={onFormRefresh}
						onSearch={onFormSearch}
						collapsible
						collapsedSections={[1, 2, 3]}
					>
						<Flex gap={8} vertical>
							<Flex gap={16}>
								<FormInput name="userId" label={'User ID'} max={20} width={250} />
								<FormInput name="username" label={'User Name'} max={20} width={250} />
								<FormInput name="office" label={'Office'} max={20} width={250} />
								<FormSelect
									name="status"
									label={'Status'}
									width={150}
									options={[
										{ label: 'Active', value: 'Y' },
										{ label: 'Inactive', value: 'N' },
									]}
								/>
							</Flex>
						</Flex>
						<Flex gap={8} vertical>
							<Flex gap={16}>
								<FormInput name="userId" label={'User ID'} max={20} width={250} />
								<FormInput name="username" label={'User Name'} max={20} width={250} />
								<FormInput name="office" label={'Office'} max={20} width={250} />
								<FormSelect
									name="status"
									label={'Status'}
									width={150}
									options={[
										{ label: 'Active', value: 'Y' },
										{ label: 'Inactive', value: 'N' },
									]}
								/>
							</Flex>
						</Flex>
						<Flex gap={8} vertical>
							<Flex gap={16}>
								<FormInput name="userId" label={'User ID'} max={20} width={250} />
								<FormInput name="username" label={'User Name'} max={20} width={250} />
								<FormInput name="office" label={'Office'} max={20} width={250} />
								<FormSelect
									name="status"
									label={'Status'}
									width={150}
									options={[
										{ label: 'Active', value: 'Y' },
										{ label: 'Inactive', value: 'N' },
									]}
								/>
							</Flex>
						</Flex>
						<Flex gap={8} vertical>
							<Flex gap={16}>
								<FormInput name="userId" label={'User ID'} max={20} width={250} />
								<FormInput name="username" label={'User Name'} max={20} width={250} />
								<FormInput name="office" label={'Office'} max={20} width={250} />
								<FormSelect
									name="status"
									label={'Status'}
									width={150}
									options={[
										{ label: 'Active', value: 'Y' },
										{ label: 'Inactive', value: 'N' },
									]}
								/>
							</Flex>
						</Flex>
					</FormSearchContainer>
				</Flex>

				{/* Basic Table */}
				<CustomTable<DataType>
					columns={columns}
					tableFilterForm={tableFilterForm}
					onFilterTableChange={handleFilterChange}
					data={userInfoData.map((item, index) => ({ ...item, key: index }))}
					tableState={{
						pagination,
					}}
				/>

				{/* Editable Table */}
				<Flex justify="end" gap={8}>
					<Button type="primary" onClick={handleGetTableData}>
						Get Table Data
					</Button>
					<AddButton onClick={handleAddRow}>Add User</AddButton>
					<DeleteButton onClick={handleDeleteRow}>Delete User</DeleteButton>
				</Flex>
				<EditCustomTable<DataType>
					form={tableForm}
					columns={editColumns}
					formTableName={'user'}
					data={data.map((item, index) => ({ ...item, key: index }))}
					ref={editTableHandlerRef}
					tableState={{
						rowSelection: selectionRows,
						pagination,
					}}
					onSelectChange={handleSelectChange}
					//noFooter
				/>

				{/* Advanced Table with Header Groups */}
				<CustomTable<Invoice>
					columns={groupColumns}
					data={invoiceData.map((item, index) => ({ ...item, key: index }))}
					tableState={{
						pagination,
					}}
				/>
			</Flex>
		</div >
	);
});

export default DefaultPage;
