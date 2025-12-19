import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import { Form, Input } from 'antd';
import type { Rule } from 'antd/es/form';
import type { FormItemProps, InputProps } from 'antd/lib';
import { useMemo } from 'react';

type FormInputProps = InputProps & FormItemProps;

export const FormInput = ({
	name,
	label,
	type,
	required,
	placeholder,
	maxLength,
	rules,
	initialValue,
	width,
	...props
}: FormInputProps) => {
	const { t, m } = useAppTranslate();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	function renderInput() {
		switch (type) {
			case 'password':
				return (
					<Input.Password
						placeholder={t(placeholder || 'Input text')}
						maxLength={maxLength}
						{...props}
					/>
				);
			default:
				return (
					<Input placeholder={t(placeholder || 'Input text')} maxLength={maxLength} {...props} />
				);
		}
	}

	return (
		<Form.Item
			name={name}
			label={label}
			required={required}
			validateTrigger="onBlur"
			rules={mappedRule}
			initialValue={initialValue}
			style={{
				width: width || '100%',
			}}
		>
			{renderInput()}
		</Form.Item>
	);
};
