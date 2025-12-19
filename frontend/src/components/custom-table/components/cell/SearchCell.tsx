/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate, useToggle } from '@/hooks';
import type { EditProps, SearchModalProps, TableData } from '@/types';
import { SearchOutlined } from '@ant-design/icons';
import { Form, Input, type InputProps } from 'antd';
import type { FormListFieldData, Rule } from 'antd/es/form';
import type { FormInstance } from 'antd/lib';
import React from 'react';

export type SearchCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	name: any[] | string;
	field: FormListFieldData;
	tableFormName?: string;
	searchModal: React.ReactElement<SearchModalProps<T>>;
	onSearchSelect: (
		record: TableData<T>,
		rowIdx: number,
		form: FormInstance,
		name: string[],
	) => void;
} & Omit<InputProps, 'name' | 'onChange'>;

export const SearchCell = <T,>({
	cellKey,
	name,
	rules,
	required,
	placeholder,
	field,
	initialValue,
	tableFormName,
	searchModal,
	shouldUpdate,
	overrideEditProps,
	onChange,
	onSearchSelect,
	...props
}: SearchCellProps<T>) => {
	const { t, m } = useAppTranslate();
	const { isToggle, toggle } = useToggle(false);
	const form = Form.useFormInstance();

	const mappedRule: Rule[] = React.useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	function handleSearchSelect(record: TableData<T>) {
		form.setFieldValue([tableFormName, ...name], record[name[1] as keyof T]);
		onSearchSelect(record, name[0], form, name as string[]);
	}

	return (
		<>
			<Form.Item shouldUpdate={(prev, curr) => shouldUpdate?.(prev, curr, name[0]) ?? false}>
				{!shouldUpdate ? (
					<Form.Item
						{...field}
						name={name}
						rules={mappedRule}
						validateTrigger={['onChange', 'onBlur']}
						key={cellKey}
						initialValue={initialValue}
					>
						<Input
							placeholder={t(placeholder as string)}
							onChange={(event) => {
								onChange?.(event.target.value, event, form, name);
							}}
							suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={toggle} />}
							{...props}
						/>
					</Form.Item>
				) : (
					({ getFieldsValue, getFieldValue, setFields }) => {
						const {
							disabled: overrideDisabled,
							clearValueDisable,
							...restOverrideProps
						} = overrideEditProps?.(getFieldsValue(), name[0], form, name) ?? {};

						if (overrideDisabled) {
							setTimeout(() => {
								setFields([
									{
										name: [tableFormName, ...(Array.isArray(name) ? name : [name])],
										value: clearValueDisable
											? null
											: getFieldValue([tableFormName, ...(Array.isArray(name) ? name : [name])]),
										errors: [],
									}, // clears error + border
								]);
							}, 0);
						}

						return (
							<Form.Item
								{...field}
								name={name}
								rules={overrideDisabled ? [] : mappedRule}
								validateTrigger={['onChange', 'onBlur']}
								key={cellKey}
								initialValue={initialValue}
							>
								<Input
									placeholder={t(placeholder as string)}
									{...props}
									onChange={(event) => {
										onChange?.(event.target.value, event, form, name);
									}}
									suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={toggle} />}
									disabled={overrideDisabled}
									{...(restOverrideProps as any)}
								/>
							</Form.Item>
						);
					}
				)}
			</Form.Item>

			{/* Render Modals */}
			{React.cloneElement(searchModal, {
				open: isToggle,
				fieldName: name[1],
				fieldValue: form.getFieldValue([tableFormName, ...name]),
				onCancel: toggle,
				onSelect: handleSearchSelect,
			})}
		</>
	);
};
