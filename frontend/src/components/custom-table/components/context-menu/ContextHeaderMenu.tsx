/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, Checkbox, type MenuProps } from 'antd';
import { useAppTranslate } from '@/hooks';
import {
	EyeOutlined,
	EyeInvisibleOutlined,
	SortAscendingOutlined,
	SortDescendingOutlined,
	ClearOutlined,
	PushpinOutlined,
	PushpinFilled,
	ReloadOutlined,
} from '@ant-design/icons';
import type { TableColumn } from '@/types';
import { SORT } from '@/types';
import React from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';

type ContextHeaderMenuProps<T> = {
	isOpen: boolean;
	position: {
		x: number;
		y: number;
	};
	column: TableColumn<T> | null;
	columns: TableColumn<T>[];
	allColumns?: TableColumn<T>[];
	onColumnVisibilityChange?: (dataIndex: string, visible: boolean) => void;
	onColumnReorder?: (nextAllColumns: TableColumn<T>[]) => void;
	onResetToDefault?: () => void;
	onSortChange?: (sortField: string | undefined, sortType: SORT | undefined) => void;
	onFreezeChange?: (dataIndex: string, fixed: 'left' | 'right' | false) => void;
	currentSort?: {
		sortField: string | undefined;
		sortType: SORT | undefined;
	};
	hideMenu: () => void;
};

const getColumnId = (col: TableColumn<any>): string => {
	const base = (col.key ?? col.dataIndex ?? col.title ?? '') as string | number;
	return String(base);
};

const SortableRow = ({
	id,
	isVisible,
	label,
	onToggle,
	depth = 0,
	disableToggle = false,
	containerStyles,
	onLabelClick,
}: {
	id: string;
	isVisible: boolean;
	label: React.ReactNode;
	onToggle: () => void;
	depth?: number;
	disableToggle?: boolean;
	containerStyles?: React.CSSProperties;
	onLabelClick?: () => void;
}) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
		paddingLeft: depth * 16,
		...containerStyles,
	};

	return (
		<div
			ref={setNodeRef}
			className="ct-column-row"
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				padding: '4px 8px',
				borderRadius: 6,
				cursor: 'default',
				background: 'transparent',
				...style,
			}}
			onMouseDown={(e) => {
				// prevent Dropdown/Menu from stealing focus/closing during drag
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				// Avoid double-toggle: if the click originated inside the AntD Checkbox (including label/title),
				// let Checkbox handle it via onChange/label behavior.
				const target = e.target as HTMLElement | null;
				const clickedCheckbox = !!target?.closest?.('.ant-checkbox-wrapper');

				if (disableToggle) {
					onLabelClick?.();
					return;
				}
				if (clickedCheckbox) return;
				onToggle();
			}}
		>
			<span
				{...attributes}
				{...listeners}
				style={{
					cursor: 'grab',
					color: '#999',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
				}}
				onMouseDown={(e) => {
					// only handle triggers drag
					e.stopPropagation();
				}}
			>
				<HolderOutlined />
			</span>
			<Checkbox
				checked={isVisible}
				disabled={disableToggle}
				onChange={(e) => {
					e.stopPropagation();
					if (!disableToggle) onToggle();
				}}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				{/* Let AntD handle label clicks (clicking the title toggles the checkbox). */}
				<span
					style={{ userSelect: 'none' }}
					onClick={(e) => {
						// Keep the dropdown open.
						e.stopPropagation();
						if (disableToggle) onLabelClick?.();
					}}
				>
					{label}
				</span>
			</Checkbox>
		</div>
	);
};

const ReorderableShowHideList = <T,>({
	allColumnsTree,
	visibleLeafSet,
	onToggleLeaf,
	onReorder,
}: {
	allColumnsTree: TableColumn<T>[];
	visibleLeafSet: Set<string>;
	onToggleLeaf: (dataIndex: string, nextVisible: boolean) => void;
	onReorder: (nextAllColumns: TableColumn<T>[]) => void;
}) => {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 3 },
		}),
	);

	const rootIds = React.useMemo(() => allColumnsTree.map((c) => getColumnId(c)), [allColumnsTree]);

	const handleRootDragEnd = React.useCallback(
		({ active, over }: DragEndEvent) => {
			if (!over || active.id === over.id) return;
			const oldIndex = allColumnsTree.findIndex((c) => getColumnId(c) === String(active.id));
			const newIndex = allColumnsTree.findIndex((c) => getColumnId(c) === String(over.id));
			if (oldIndex < 0 || newIndex < 0) return;
			onReorder(arrayMove(allColumnsTree, oldIndex, newIndex));
		},
		[allColumnsTree, onReorder],
	);

	const reorderChildrenInGroup = React.useCallback(
		(groupId: string, activeId: string, overId: string) => {
			const visit = (nodes: TableColumn<T>[]): TableColumn<T>[] => {
				return nodes.map((node) => {
					const nodeId = getColumnId(node);
					if (nodeId === groupId && node.children && node.children.length > 0) {
						const children = node.children;
						const oldIndex = children.findIndex((c) => getColumnId(c) === activeId);
						const newIndex = children.findIndex((c) => getColumnId(c) === overId);
						if (oldIndex < 0 || newIndex < 0) return node;
						return { ...node, children: arrayMove(children, oldIndex, newIndex) };
					}
					if (node.children && node.children.length > 0) {
						return { ...node, children: visit(node.children) };
					}
					return node;
				});
			};
			return visit(allColumnsTree);
		},
		[allColumnsTree],
	);

	const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());
	const toggleGroupCollapsed = React.useCallback((groupId: string) => {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(groupId)) next.delete(groupId);
			else next.add(groupId);
			return next;
		});
	}, []);

	const renderNode = (node: TableColumn<T>, depth: number) => {
		const nodeId = getColumnId(node);
		const hasChildren = !!(node.children && node.children.length > 0);

		if (hasChildren) {
			const childIds = node.children!.map((c) => getColumnId(c));
			const isCollapsed = collapsedGroups.has(nodeId);
			return (
				<div key={`group_${nodeId}`}>
					<SortableRow
						id={nodeId}
						isVisible={node.children!.some(
							(c) => 'dataIndex' in c && !!c.dataIndex && visibleLeafSet.has(c.dataIndex as string),
						)}
						label={node.title as any}
						onToggle={() => {
							// group toggle not supported (avoid accidental bulk show/hide)
						}}
						disableToggle
						depth={depth}
						containerStyles={{ fontWeight: 600 }}
						onLabelClick={() => toggleGroupCollapsed(nodeId)}
					/>
					<div style={{ marginTop: 2, display: isCollapsed ? 'none' : 'block' }}>
						<SortableContext items={childIds} strategy={verticalListSortingStrategy}>
							{node.children!.map((child) => renderNode(child, depth + 1))}
						</SortableContext>
					</div>
				</div>
			);
		}

		const dataIndex = node.dataIndex as string | undefined;
		if (!dataIndex) return null;
		const isVisible = visibleLeafSet.has(dataIndex);
		return (
			<SortableRow
				key={`col_${nodeId}`}
				id={nodeId}
				isVisible={isVisible}
				label={node.title as any}
				depth={depth}
				onToggle={() => onToggleLeaf(dataIndex, !isVisible)}
			/>
		);
	};

	const handleNestedDragEnd = React.useCallback(
		({ active, over }: DragEndEvent) => {
			if (!over || active.id === over.id) return;
			// Determine whether this is a child reorder by checking if both ids exist in some group children.
			// If so, reorder within that group; otherwise let root handler take it.
			const findGroupIdContainingBoth = (nodes: TableColumn<T>[]): string | null => {
				for (const node of nodes) {
					if (node.children && node.children.length > 0) {
						const ids = node.children.map((c) => getColumnId(c));
						if (ids.includes(String(active.id)) && ids.includes(String(over.id))) {
							return getColumnId(node);
						}
						const nested = findGroupIdContainingBoth(node.children);
						if (nested) return nested;
					}
				}
				return null;
			};
			const groupId = findGroupIdContainingBoth(allColumnsTree);
			if (groupId) {
				onReorder(reorderChildrenInGroup(groupId, String(active.id), String(over.id)));
				return;
			}
			handleRootDragEnd({ active, over } as any);
		},
		[allColumnsTree, handleRootDragEnd, onReorder, reorderChildrenInGroup],
	);

	return (
		<div
			// Keep this submenu compact; also prevents AntD hover background from
			// looking like it highlights the whole list area.
			style={{ width: 165, maxHeight: 320, overflow: 'auto', padding: 6 }}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			<DndContext
				sensors={sensors}
				modifiers={[restrictToVerticalAxis]}
				collisionDetection={closestCenter}
				onDragEnd={handleNestedDragEnd}
			>
				<SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
					{allColumnsTree.map((node) => renderNode(node, 0))}
				</SortableContext>
			</DndContext>
		</div>
	);
};

export const ContextHeaderMenu = <T,>({
	isOpen,
	position,
	column,
	columns,
	allColumns,
	currentSort,
	onColumnVisibilityChange,
	onColumnReorder,
	onResetToDefault,
	onSortChange,
	onFreezeChange,
	hideMenu,
}: ContextHeaderMenuProps<T>) => {
	const { t } = useAppTranslate();

	const collectVisibleLeafSet = React.useCallback((cols: TableColumn<T>[]): Set<string> => {
		const result = new Set<string>();
		const visit = (nodes: TableColumn<T>[]) => {
			nodes.forEach((c) => {
				if (c.children && c.children.length > 0) visit(c.children);
				else if (c.dataIndex) result.add(c.dataIndex as string);
			});
		};
		visit(cols);
		return result;
	}, []);

	const visibleLeafSet = React.useMemo(() => collectVisibleLeafSet(columns), [collectVisibleLeafSet, columns]);
	const baseAllColumnsTree = React.useMemo(
		() => (allColumns && allColumns.length > 0 ? allColumns : columns),
		[allColumns, columns],
	);

	// Keep a stable columns tree for the submenu so reorders don't "snap back" if the parent updates later.
	const [availableAllColumnsTree, setAvailableAllColumnsTree] =
		React.useState<TableColumn<T>[]>(baseAllColumnsTree);
	const isReorderingRef = React.useRef(false);

	React.useEffect(() => {
		if (isReorderingRef.current) {
			isReorderingRef.current = false;
			return;
		}
		setAvailableAllColumnsTree(baseAllColumnsTree);
	}, [baseAllColumnsTree]);

	if (!column || !column.dataIndex) return null;

	const columnDataIndex = column.dataIndex as string;
	const isColumnVisible = columns.some((col) => {
		if (col.children) {
			return col.children.some((child) => {
				return 'dataIndex' in child && (child.dataIndex as string) === columnDataIndex;
			});
		}
		return 'dataIndex' in col && (col.dataIndex as string) === columnDataIndex;
	});

	const isCurrentlySorted =
		currentSort?.sortField === columnDataIndex && currentSort?.sortType !== undefined;
	const isFrozen = column.fixed === 'left' || column.fixed === 'right';

	const menuItems: MenuProps['items'] = [
		{
			key: 'show_hide_columns',
			label: t('Show/Hide Columns'),
			icon: isColumnVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />,
			children: [
				{
					key: 'column_reorder_and_visibility',
					className: 'ct-column-visibility-item',
					style: { padding: 0, background: 'transparent' },
					label: (
						<>
							{/* Override AntD Menu hover background + add per-row hover */}
							<style>
								{`
									.ant-dropdown-menu-item.ct-column-visibility-item:hover,
									.ant-dropdown-menu-item.ct-column-visibility-item:active {
										background: transparent !important;
									}
									.ct-column-row:hover {
										background: rgba(0, 0, 0, 0.04);
									}
									.ct-column-row:active {
										background: rgba(0, 0, 0, 0.06);
									}
								`}
							</style>
							<ReorderableShowHideList
								allColumnsTree={availableAllColumnsTree}
								visibleLeafSet={visibleLeafSet}
								onToggleLeaf={(dataIndex, nextVisible) => {
									onColumnVisibilityChange?.(dataIndex, nextVisible);
								}}
								onReorder={(nextAllColumns) => {
									isReorderingRef.current = true;
									setAvailableAllColumnsTree(nextAllColumns);
									onColumnReorder?.(nextAllColumns);
								}}
							/>
						</>
					),
				},
			],
		},
		{ type: 'divider' },
		{
			key: 'sort_asc',
			label: t('Sort A-Z'),
			icon: <SortAscendingOutlined />,
			disabled: !column.sorter,
		},
		{
			key: 'sort_desc',
			label: t('Sort Z-A'),
			icon: <SortDescendingOutlined />,
			disabled: !column.sorter,
		},
		{
			key: 'unsort',
			label: t('Unsort'),
			icon: <ClearOutlined />,
			disabled: !isCurrentlySorted,
		},
		{ type: 'divider' },
		{
			key: 'freeze_left',
			label: t('Freeze Left'),
			icon: <PushpinOutlined />,
			disabled: column.fixed === 'left',
		},
		{
			key: 'freeze_right',
			label: t('Freeze Right'),
			icon: <PushpinOutlined />,
			disabled: column.fixed === 'right',
		},
		{
			key: 'unfreeze',
			label: t('Unfreeze'),
			icon: <PushpinFilled />,
			disabled: !isFrozen,
		},
		{ type: 'divider' },
		{
			key: 'reset_to_default',
			label: t('Reset to Default'),
			icon: <ReloadOutlined />,
		},
	];

	const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
		// Ignore clicks on custom submenu content
		if (key.toString() === 'column_reorder_and_visibility') {
			domEvent?.stopPropagation();
			domEvent?.preventDefault();
			return;
		}

		switch (key) {
			case 'sort_asc':
				onSortChange?.(columnDataIndex, SORT.ASC);
				break;
			case 'sort_desc':
				onSortChange?.(columnDataIndex, SORT.DESC);
				break;
			case 'unsort':
				onSortChange?.(undefined, undefined);
				break;
			case 'freeze_left':
				onFreezeChange?.(columnDataIndex, 'left');
				break;
			case 'freeze_right':
				onFreezeChange?.(columnDataIndex, 'right');
				break;
			case 'unfreeze':
				onFreezeChange?.(columnDataIndex, false);
				break;
			case 'reset_to_default':
				onResetToDefault?.();
				break;
		}
		hideMenu();
	};

	return (
		<Dropdown
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					hideMenu();
				}
			}}
			menu={{
				items: menuItems,
				onClick: handleMenuClick,
			}}
			trigger={['click']}
			placement="bottomLeft"
		>
			<div
				style={{
					position: 'fixed',
					top: position.y,
					left: position.x,
					width: 1,
					height: 1,
					zIndex: 9999,
				}}
			/>
		</Dropdown>
	);
};
