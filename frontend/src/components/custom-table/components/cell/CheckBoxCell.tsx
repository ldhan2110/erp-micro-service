/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate } from '@/hooks';
import type { EditProps } from '@/types';
import { Checkbox, Form } from 'antd';
import type { FormListFieldData, Rule } from 'antd/es/form';
import type { CheckboxProps } from 'antd/lib';
import React from 'react';

export type CheckBoxCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	name: any[] | string;
	field: FormListFieldData;
	allowSelectAll?: boolean;
	tableFormName?: string;
	checkboxMapping: {
		checked: string | number | boolean | object;
		unchecked: string | number | boolean | object;
	};
} & Omit<CheckboxProps, 'name' | 'onChange'>;

export const CheckBoxCell = <T,>({
	cellKey,
	name,
	rules,
	required,
	field,
	initialValue,
	checkboxMapping,
	tableFormName,
	shouldUpdate,
	overrideEditProps,
	onChange,
	...props
}: CheckBoxCellProps<T>) => {
	const { m } = useAppTranslate();
	const form = Form.useFormInstance();
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
					initialValue={initialValue}
					valuePropName="checked"
					getValueFromEvent={(e) =>
						e.target.checked ? checkboxMapping.checked : checkboxMapping.unchecked
					}
					getValueProps={(value) => ({ checked: value === checkboxMapping.checked })}
				>
					<Checkbox
						{...props}
						style={{ width: '100%' }}
						className="flex justify-center"
						onChange={(event) => {
							onChange?.(
								event.target.checked ? checkboxMapping.checked : checkboxMapping.unchecked,
								event,
								form,
								name,
							);
						}}
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
							rules={mappedRule}
							validateTrigger={['onChange', 'onBlur']}
							key={cellKey}
							initialValue={initialValue}
							valuePropName="checked"
							getValueFromEvent={(e) =>
								e.target.checked ? checkboxMapping.checked : checkboxMapping.unchecked
							}
							getValueProps={(value) => ({ checked: value === checkboxMapping.checked })}
						>
							<Checkbox
								{...props}
								style={{ width: '100%' }}
								className="flex justify-center"
								onChange={(event) => {
									onChange?.(
										event.target.checked ? checkboxMapping.checked : checkboxMapping.unchecked,
										event,
										form,
										name,
									);
								}}
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
