import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import { Checkbox, Form, type CheckboxProps } from 'antd';
import type { Rule } from 'antd/es/form';
import type { FormItemProps } from 'antd/lib';
import { useMemo } from 'react';

type FormCheckboxProps = CheckboxProps &
	FormItemProps & {
		checkboxMapping?: {
			checked: string | number | boolean | object;
			unchecked: string | number | boolean | object;
		};
	};

export const FormCheckbox = ({
	name,
	label,
	title,
	required,
	rules,
	checkboxMapping,
	...props
}: FormCheckboxProps) => {
	const { t, m } = useAppTranslate();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	return (
		<Form.Item
			valuePropName="checked"
			name={name}
			label={label}
			rules={mappedRule}
			validateTrigger={['onChange', 'onBlur']}
			getValueFromEvent={(e) =>
				e.target.checked ? checkboxMapping?.checked : checkboxMapping?.unchecked
			}
			getValueProps={(value) => ({ checked: value === checkboxMapping?.checked })}
		>
			<Checkbox {...props}>{t(title || '')}</Checkbox>
		</Form.Item>
	);
};
