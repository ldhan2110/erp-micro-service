/* eslint-disable @typescript-eslint/no-explicit-any */
import { ALL_OPTION, MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import type { EditProps } from '@/types';
import { Form, Select } from 'antd';
import type { FormListFieldData, Rule } from 'antd/es/form';
import type { DefaultOptionType, SelectProps } from 'antd/es/select';
import React from 'react';

type MultiSelectCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	name: any[] | string;
	field: FormListFieldData;
	allowSelectAll?: boolean;
	tableFormName?: string;
} & Omit<SelectProps, 'name' | 'onChange'>;

export const MultiSelectCell = <T,>({
	cellKey,
	name,
	rules,
	required,
	placeholder,
	field,
	allowSelectAll,
	options,
	initialValue,
	tableFormName,
	shouldUpdate,
	overrideEditProps,
	onChange,
	...props
}: MultiSelectCellProps<T>) => {
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

	function handleSelectOption(value: string) {
		const selectedOptions: string[] = form.getFieldValue(name) ?? [];
		if (value == 'ALL') {
			form.setFieldValue(name, [ALL_OPTION.value]);
		} else if (
			!selectedOptions.includes(ALL_OPTION.value) &&
			selectedOptions.length === (options?.length ?? 0)
		) {
			form.setFieldValue(name, [ALL_OPTION.value]);
		} else if (selectedOptions.includes(ALL_OPTION.value)) {
			form.setFieldValue(
				name,
				(selectedOptions as Array<string>).filter((item) => item != ALL_OPTION.value),
			);
		}
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
						mode="multiple"
						maxTagCount="responsive"
						filterOption={handleFilter}
						placeholder={t((placeholder as string) || 'Select value')}
						options={
							allowSelectAll && (options ?? []).length != 0
								? [ALL_OPTION, ...(options || [])]
								: options
						}
						onSelect={handleSelectOption}
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
								mode="multiple"
								maxTagCount="responsive"
								filterOption={handleFilter}
								placeholder={t((placeholder as string) || 'Select value')}
								options={
									allowSelectAll && (options ?? []).length != 0
										? [ALL_OPTION, ...(options || [])]
										: options
								}
								onSelect={handleSelectOption}
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
