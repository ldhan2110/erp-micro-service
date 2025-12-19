import React, { type ReactElement } from 'react';
import { EDIT_TYPE, type EditProps } from '@/types';
import type { FormListFieldData } from 'antd';
import {
	CheckBoxCell,
	InputCell,
	InputNumberCell,
	MultiSelectCell,
	SelectCell,
	DatePickerCell,
	TimePickerCell,
	SearchCell,
	ReadOnlyCell,
	type SearchCellProps,
} from './cell';

interface EditableCellProps<T> {
	editType?: EDIT_TYPE;
	field: FormListFieldData;
	cellKey: string;
	name: (string | number)[];
	tableFormName: string;
	editProps?: Partial<EditProps<T>>;
	text: string | ReactElement;
	record: T;
}

export const EditableCell = React.memo(
	<T,>({ editType, field, cellKey, name, tableFormName, editProps }: EditableCellProps<T>) => {
		const commonProps = {
			field,
			cellKey,
			name,
			tableFormName,
			...editProps,
		};

		switch (editType) {
			case EDIT_TYPE.INPUT:
				return <InputCell {...commonProps} />;
			case EDIT_TYPE.INPUT_NUMER:
				return <InputNumberCell {...commonProps} />;
			case EDIT_TYPE.MULTI_SELECT:
				return <MultiSelectCell {...commonProps} />;
			case EDIT_TYPE.SELECT:
				return <SelectCell {...commonProps} />;
			case EDIT_TYPE.CHECKBOX:
				return (
					<CheckBoxCell
						{...commonProps}
						checkboxMapping={editProps?.checkboxMapping ?? { checked: true, unchecked: false }}
					/>
				);
			case EDIT_TYPE.DATEPICKER:
				return <DatePickerCell {...commonProps} />;
			case EDIT_TYPE.TIMEPICKER:
				return <TimePickerCell {...commonProps} />;
			case EDIT_TYPE.SEARCH:
				return <SearchCell {...(commonProps as SearchCellProps<T>)} />;
			default:
				return <ReadOnlyCell fieldName={name} {...commonProps} />;
		}
	},
) as <T>(props: EditableCellProps<T>) => ReactElement | null;
