import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate, useToggle } from '@/hooks';
import type { SearchModalProps, TableData } from '@/types';
import { SearchOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import type { Rule } from 'antd/es/form';
import type { FormItemProps, InputProps } from 'antd/lib';
import React, { type ReactElement } from 'react';
import { useMemo } from 'react';

type FormSearchInputProps<T> = InputProps &
	FormItemProps & {
		searchModal: ReactElement<SearchModalProps<T>>;
		modalsProps: SearchModalProps<T>;
		onSelectCallback?: (record: TableData<T> | TableData<T>[]) => void;
	};

export const FormSearchInput = <T,>({
	name,
	label,
	required,
	placeholder,
	maxLength,
	rules,
	searchModal,
	modalsProps,
	onSelectCallback,
	...props
}: FormSearchInputProps<T>) => {
	const { t, m } = useAppTranslate();
	const { isToggle, toggle } = useToggle(false);
	const form = Form.useFormInstance();

	const mappedRule: Rule[] = useMemo(() => {
		if (required)
			return [{ required: true, message: m(MESSAGE_CODES.COM000002) }, ...(rules || [])];
		return rules || ([] as Rule[]);
	}, [required, rules, m]);

	function handleCloseModal() {
		toggle();
	}

	function handleSelect(record: TableData<T> | TableData<T>[]) {
		if (modalsProps.selectType == 'single') {
			record = record as TableData<T>;
			form.setFieldValue(name, record[name as keyof T]);
			onSelectCallback?.(record);
		}
	}

	return (
		<>
			<Form.Item
				name={name}
				label={label}
				required={required}
				validateTrigger="onBlur"
				rules={mappedRule}
			>
				<Input
					placeholder={t(placeholder || 'Input text')}
					maxLength={maxLength}
					{...props}
					suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={toggle} />}
				/>
			</Form.Item>

			{/* Render Modals */}
			{React.cloneElement(searchModal, {
				...modalsProps,
				open: isToggle,
				title: label as string,
				fieldName: name,
				fieldValue: form.getFieldValue(name),
				onSelect: handleSelect,
				onCancel: handleCloseModal,
			})}
		</>
	);
};
