import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import { Form, Select, type FormItemProps, type SelectProps } from 'antd';
import type { Rule } from 'antd/es/form';
import type { DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';

type FormSelectProps = SelectProps &
	FormItemProps & {
		width?: number | string;
	};

export const FormSelect = ({
	name,
	label,
	required,
	placeholder,
	rules,
	width,
	initialValue,
	...props
}: FormSelectProps) => {
	const { t, m } = useAppTranslate();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [rules, required, m]);

	function handleFilter(input: string, option: DefaultOptionType | undefined) {
		return ((option?.label || '') as string).toLowerCase().includes(input.toLowerCase());
	}

	return (
		<Form.Item
			name={name}
			label={t(label as string)}
			required={required}
			validateTrigger="onBlur"
			rules={mappedRule}
			initialValue={initialValue}
			style={{ width: width || '100%' }}
		>
			<Select
				style={{ width: width || '100%' }}
				allowClear
				showSearch
				filterOption={handleFilter}
				placeholder={t((placeholder as string) || 'Select value')}
				{...props}
			/>
		</Form.Item>
	);
};
