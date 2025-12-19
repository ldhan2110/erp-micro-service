import { type TableColumn } from '@/types';

export const collectVisibleDataIndexes = <T,>(cols: TableColumn<T>[]): Set<string> => {
	const result = new Set<string>();
	const visit = (nodes: TableColumn<T>[]) => {
		nodes.forEach((col) => {
			if (col.children && col.children.length > 0) {
				visit(col.children);
			} else if (col.dataIndex) {
				result.add(col.dataIndex as string);
			}
		});
	};
	visit(cols);
	return result;
};

export const applyVisibility = <T,>(
	masterCols: TableColumn<T>[],
	visibleDataIndexes: Set<string>,
): TableColumn<T>[] => {
	const visit = (nodes: TableColumn<T>[]): TableColumn<T>[] => {
		return nodes
			.map((col) => {
				if (col.children && col.children.length > 0) {
					const nextChildren = visit(col.children);
					if (nextChildren.length === 0) return null;
					return { ...col, children: nextChildren };
				}
				if (!col.dataIndex) return null;
				return visibleDataIndexes.has(col.dataIndex as string) ? col : null;
			})
			.filter((x) => x !== null) as TableColumn<T>[];
	};
	return visit(masterCols);
};

