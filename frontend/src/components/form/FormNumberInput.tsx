import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import { formatNumberAmount, parserNumberAmount } from '@/utils/helper';
import { Form, InputNumber } from 'antd';
import type { Rule } from 'antd/es/form';
import type { FormItemProps, InputNumberProps } from 'antd/lib';
import { useMemo } from 'react';

type FormNumberInputProps = InputNumberProps &
	FormItemProps & {
		type?: 'amount' | 'number';
	};

export const FormNumberInput = ({
	type = 'number',
	name,
	label,
	required,
	placeholder,
	maxLength,
	rules,
	width,
	initialValue,
	...props
}: FormNumberInputProps) => {
	const { t, m } = useAppTranslate();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	const customProps = useMemo(() => {
		switch (type) {
			case 'amount':
				return {
					formatter: formatNumberAmount,
					parser: parserNumberAmount,
					...props,
				} as InputNumberProps;
			default:
				return {
					...props,
				};
		}
	}, [type, props]);

	return (
		<Form.Item
			name={name}
			label={label}
			required={required}
			validateTrigger="onBlur"
			rules={mappedRule}
			initialValue={initialValue}
			style={{
				width: '100%',
			}}
		>
			<InputNumber
				style={{ width: width || '100%', textAlign: 'right' }}
				controls={false}
				placeholder={t(placeholder || 'Input number')}
				maxLength={maxLength}
				{...customProps}
			/>
		</Form.Item>
	);
};
