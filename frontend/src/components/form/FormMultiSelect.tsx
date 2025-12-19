import { ALL_OPTION, MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import { Form, Select, type FormItemProps, type SelectProps } from 'antd';
import type { Rule } from 'antd/es/form';
import type { DefaultOptionType } from 'antd/es/select';
import React, { useMemo } from 'react';

type FormSelectProps = SelectProps &
	FormItemProps & {
		width?: number | string;
		allowSelectAll?: boolean;
	};

export const FormMultiSelect = ({
	name,
	label,
	required,
	placeholder,
	rules,
	width,
	allowSelectAll = false,
	options,
	...props
}: FormSelectProps) => {
	const { t, m } = useAppTranslate();
	const [selectOptions, setSelectOptions] = React.useState<DefaultOptionType[]>([]);
	const form = Form.useFormInstance();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [rules, required, m]);

	React.useEffect(() => {
		function handleConfigOptions(options: DefaultOptionType[]) {
			if (allowSelectAll && options.length != 0) {
				return [ALL_OPTION, ...options];
			}
			return options;
		}
		setSelectOptions(handleConfigOptions(options || []));
	}, [options, allowSelectAll, t]);

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
		<Form.Item
			name={name}
			label={t(label as string)}
			required={required}
			validateTrigger="onBlur"
			rules={mappedRule}
			style={{ width: width || '100%' }}
		>
			<Select
				style={{ width: width || '100%' }}
				allowClear
				showSearch
				mode="multiple"
				maxTagCount="responsive"
				filterOption={handleFilter}
				placeholder={t((placeholder as string) || 'Select value')}
				options={selectOptions}
				onSelect={handleSelectOption}
				{...props}
			/>
		</Form.Item>
	);
};
