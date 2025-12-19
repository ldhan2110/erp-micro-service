import React, { type ReactNode } from 'react';
import type { ColumnTitle } from 'antd/es/table/interface';

interface ColumnHeaderProps<T> {
	title: ColumnTitle<T>;
	required?: boolean;
}

export const ColumnHeader = <T,>({ title, required = false }: ColumnHeaderProps<T>) => {
	if (required) {
		return (
			<span>
				{title as ReactNode} <span style={{ color: 'red' }}>*</span>
			</span>
		);
	}
	return title as ReactNode;
};

export default React.memo(ColumnHeader) as typeof ColumnHeader;
