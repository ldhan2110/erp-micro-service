import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import appStore from '@/stores/AppStore';
import { DatePicker, Form, type FormItemProps } from 'antd';
import type { Rule } from 'antd/es/form';
import type { DatePickerProps } from 'antd/lib';
import React from 'react';
import dayjs from 'dayjs';

type FormDatePickerProps = DatePickerProps & FormItemProps;

export const FormDatePicker = ({
	name,
	label,
	required,
	rules,
	width,
	placeholder,
	showTime,
	initialValue,
	...props
}: FormDatePickerProps) => {
	const { t, m } = useAppTranslate();
	const { dateFormat } = appStore.state;

	const mappedRule: Rule[] = React.useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

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
			<DatePicker
				style={{ width: width || '100%' }}
				placeholder={t(
					(placeholder as string) || !showTime ? dateFormat.split(' ')[0] : dateFormat,
				)}
				format={!showTime ? dateFormat.split(' ')[0] : dateFormat}
				showTime={showTime ? { defaultValue: dayjs('00:00:00', dateFormat.split(' ')[1]) } : false}
				{...props}
			/>
		</Form.Item>
	);
};
