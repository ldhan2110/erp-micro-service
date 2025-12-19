/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterTypeMenu } from './FilterTypeMenu';
import { FormInput, FormSelect } from '@/components/form';
import { FILTER_TYPE } from '@/constants';
import type { FilterTableProps } from '@/types';
import { FilterDate } from './FilterDate';
import { Form } from 'antd';
import { FilterNumber } from './FilterNumber';

type FilterHeaderProps = FilterTableProps & {
	onFilterTableChange: (changedValues: any, allValues: any) => void;
};

export const FilterHeader = ({
	showFilter,
	filterName,
	filterType,
	filterInitialValue,
	filterOptions,
	filterNumberType,
	onFilterTableChange,
}: FilterHeaderProps) => {
	function renderFilter() {
		switch (filterType) {
			case 'DATEPICKER':
				return (
					<FilterDate
						name={filterName}
						initialValue={filterInitialValue}
						style={{ fontWeight: 'normal', textAlign: 'left' }}
						onClick={(event) => event.stopPropagation()}
						onChange={onFilterTableChange}
						filterType={filterType}
						filterName={filterName}
					/>
				);
			case 'SELECT':
				return (
					<FormSelect
						name={filterName}
						options={filterOptions}
						initialValue={filterInitialValue}
						style={{ fontWeight: 'normal', textAlign: 'left' }}
						onClick={(event) => event.stopPropagation()}
					/>
				);
			case 'NUMBER':
				return (
					<FilterNumber
						name={filterName}
						initialValue={filterInitialValue}
						style={{ fontWeight: 'normal', textAlign: 'left' }}
						onClick={(event) => event.stopPropagation()}
						onChange={onFilterTableChange as any}
						filterType={filterType}
						filterName={filterName}
						filterNumberType={filterNumberType}
					/>
				);
			default:
				return (
					<FormInput
						name={filterName}
						prefix={
							<FilterTypeMenu
								filterType={filterType}
								filterName={filterName}
								onFilterTableChange={onFilterTableChange}
							/>
						}
						initialValue={filterInitialValue}
						allowClear
						style={{ fontWeight: 'normal', width: '100%' }}
						onClick={(event) => event.stopPropagation()}
					/>
				);
		}
	}

	return (
		showFilter && (
			<>
				<Form.Item name={`${filterName}Operator`} initialValue={FILTER_TYPE.DEFAULT.key} hidden>
					<input type="hidden" />
				</Form.Item>
				{renderFilter()}
			</>
		)
	);
};
