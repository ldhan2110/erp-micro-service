/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, type InputNumberProps } from 'antd';
import type { FormItemProps } from 'antd/lib';
import { FILTER_TYPE } from '@/constants';
import { FilterTypeMenu } from './FilterTypeMenu';
import { FormNumberInput } from '@/components/form/FormNumberInput';
import { RangeNumberInput, type RangeNumberInputProps } from '@/components/input';
import React, { useState } from 'react';
import { formatNumberAmount, parserNumberAmount } from '@/utils/helper';
import type { RangeValue } from '@/types';

type FilterNumberProps = FormItemProps &
	Omit<InputNumberProps, 'onChange'> &
	Omit<RangeNumberInputProps, 'onChange'> & {
		filterName: string;
		filterType: string;
		filterNumberType: 'number' | 'amount';
		onChange: (changedValues: any, allValues: any) => void;
	};

export const FilterNumber = ({
	name,
	filterNumberType = 'number',
	initialValue,
	filterName,
	filterType,
	onChange,
}: FilterNumberProps) => {
	const [range, setRange] = useState<RangeValue>([null, null]);
	const form = Form.useFormInstance();
	const filterOperator = Form.useWatch(`${name}Operator`, form);

	React.useEffect(() => {
		setRange([null, null]);
	}, [filterOperator]);

	const customProps = React.useMemo(() => {
		switch (filterNumberType) {
			case 'amount':
				return {
					formatter: formatNumberAmount,
					parser: parserNumberAmount,
				} as any;
			default:
				return {};
		}
	}, [filterNumberType]);

	function handleRangeChange(newValue: RangeValue) {
		setRange(newValue);
		const [min, max] = newValue;
		form.setFieldsValue({
			[name]: min,
			[`${name}To`]: max,
		});
		onChange(
			{
				[name]: min,
				[`${name}To`]: max,
			},
			form.getFieldsValue(),
		);
	}

	return (
		<>
			{filterOperator != FILTER_TYPE.BETWEEN.key ? (
				<FormNumberInput
					name={filterName}
					prefix={
						<FilterTypeMenu
							filterType={filterType}
							filterName={filterName}
							onFilterTableChange={onChange}
							defaultOperator={filterOperator}
						/>
					}
					initialValue={initialValue}
					className="clickable-prefix-input"
					style={{ fontWeight: 'normal', width: '100%' }}
					onClick={(event) => event.stopPropagation()}
					{...customProps}
				/>
			) : (
				<>
					<Form.Item name={name} initialValue={initialValue} hidden />
					<Form.Item name={`${name}To`} initialValue={initialValue} hidden />
					<RangeNumberInput
						value={range}
						onChange={handleRangeChange}
						placeholder={['From', 'To']}
						style={{ width: '100%', textAlign: 'right', fontWeight: 'normal' }}
						prefix={
							<FilterTypeMenu
								filterType={filterType}
								filterName={filterName}
								onFilterTableChange={onChange}
								defaultOperator={filterOperator}
							/>
						}
						{...customProps}
					/>
				</>
			)}
		</>
	);
};
