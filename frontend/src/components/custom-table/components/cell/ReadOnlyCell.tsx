/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EditProps } from '@/types';
import { Form } from 'antd';
import type { FormListFieldData } from 'antd/es/form';

type ReadOnlyCellProps<T> = Partial<EditProps<T>> & {
	cellKey: string;
	fieldName: any[] | string;
	field: FormListFieldData;
	tableFormName?: string;
};

export const ReadOnlyCell = <T,>({
	cellKey,
	fieldName,
	field,
	initialValue,
	tableFormName,
	shouldUpdate,
}: ReadOnlyCellProps<T>) => {
	const form = Form.useFormInstance();

	const fullPath = Array.isArray(fieldName)
		? [tableFormName, ...fieldName]
		: [tableFormName, fieldName];

	return (
		<Form.Item
			shouldUpdate={
				shouldUpdate
					? (prev, curr) =>
							shouldUpdate(prev, curr, Array.isArray(fieldName) ? fieldName[0] : fieldName)
					: false
			}
			noStyle
		>
			{() => {
				const value = form.getFieldValue(fullPath);
				return (
					<Form.Item {...field} key={cellKey} initialValue={initialValue} noStyle>
						<span>{value}</span>
					</Form.Item>
				);
			}}
		</Form.Item>
	);
};
