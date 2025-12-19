/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import appStore from '@/stores/AppStore';
import type { EditProps } from '@/types';
import { Form, TimePicker, type TimePickerProps } from 'antd';
import type { FormListFieldData, Rule } from 'antd/es/form';
import React from 'react';
import dayjs from 'dayjs';

type TimePickerCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	name: any[] | string;
	field: FormListFieldData;
	tableFormName?: string;
} & Omit<TimePickerProps, 'name' | 'onChange'>;

export const TimePickerCell = <T,>({
	cellKey,
	name,
	rules,
	required,
	placeholder,
	field,
	initialValue,
	tableFormName,
	shouldUpdate,
	overrideEditProps,
	onChange,
	...props
}: TimePickerCellProps<T>) => {
	const { t, m } = useAppTranslate();
	const form = Form.useFormInstance();
	const { dateFormat } = appStore.state;

	// Extract time format from dateFormat and remove seconds (e.g., "DD/MM/YYYY HH:mm:ss" -> "HH:mm")
	const extractedTimeFormat = dateFormat.split(' ')[1] || 'HH:mm';
	const timeFormat = extractedTimeFormat.replace(':ss', '') || 'HH:mm';

	const toDayjs = React.useCallback(
		(value: any) => {
			if (!value) return value;
			if (dayjs.isDayjs(value)) return value;
			const parsed = dayjs(value, timeFormat, true);
			return parsed.isValid() ? parsed : dayjs(value);
		},
		[timeFormat],
	);

	const mappedRule: Rule[] = React.useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	return (
		<Form.Item shouldUpdate={(prev, curr) => shouldUpdate?.(prev, curr, name[0]) ?? false}>
			{!shouldUpdate ? (
				<Form.Item
					{...field}
					name={name}
					rules={mappedRule}
					validateTrigger={['onChange', 'onBlur']}
					key={cellKey}
					initialValue={toDayjs(initialValue)}
					getValueProps={(value) => ({ value: toDayjs(value) })}
				>
					<TimePicker
						style={{ width: '100%' }}
						placeholder={t(placeholder as string) || 'HH:mm'}
						format={timeFormat}
						needConfirm={false}
						onChange={(date, dateString) => {
							onChange?.(date, dateString, form, name);
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
							initialValue={toDayjs(initialValue)}
							getValueProps={(value) => ({ value: toDayjs(value) })}
						>
							<TimePicker
								style={{ width: '100%' }}
								placeholder={t(placeholder as string) || 'HH:mm'}
								format={timeFormat}
								needConfirm={false}
								onChange={(date, dateString) => {
									onChange?.(date, dateString, form, name);
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


