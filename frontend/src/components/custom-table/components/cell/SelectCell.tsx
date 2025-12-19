/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import type { EditProps } from '@/types';
import { Form, Select } from 'antd';
import type { FormListFieldData, Rule } from 'antd/es/form';
import type { DefaultOptionType, SelectProps } from 'antd/es/select';
import React from 'react';

type SelectCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	name: any[] | string;
	field: FormListFieldData;
	tableFormName?: string;
} & Omit<SelectProps, 'name' | 'onChange'>;

export const SelectCell = <T,>({
	cellKey,
	name,
	rules,
	required,
	placeholder,
	field,
	options,
	initialValue,
	tableFormName,
	shouldUpdate,
	overrideEditProps,
	onChange,
	...props
}: SelectCellProps<T>) => {
	const { t, m } = useAppTranslate();
	const form = Form.useFormInstance();
	const mappedRule: Rule[] = React.useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	function handleFilter(input: string, option: DefaultOptionType | undefined) {
		return ((option?.label || '') as string).toLowerCase().includes(input.toLowerCase());
	}

	return (
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
					<Select
						style={{ width: '100%' }}
						allowClear
						showSearch
						filterOption={handleFilter}
						placeholder={t((placeholder as string) || 'Select value')}
						options={options}
						onChange={(value, option) => {
							onChange?.(value, option, form, name);
						}}
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
							<Select
								style={{ width: '100%' }}
								allowClear
								showSearch
								filterOption={handleFilter}
								placeholder={t((placeholder as string) || 'Select value')}
								options={options}
								onChange={(value, option) => {
									onChange?.(value, option, form, name);
								}}
								{...props}
								disabled={overrideDisabled}
								{...(restOverrideProps as any)}
							/>
						</Form.Item>
					);
				}
			)}
		</Form.Item>
	);
};
