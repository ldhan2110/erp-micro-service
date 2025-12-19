import { DEFAULT_PAGINATION } from '@/constants';
import { authService } from '@/services/auth/authJwtService';
import type { MasterCodeListFilterForm, Pagination, Sort, SubCodeDto, TableData } from '@/types';
import type { FormInstance } from 'antd';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MasterCodeManagementStoreState {
	search: {
		filter: Partial<MasterCodeListFilterForm>;
		pagination: Pagination;
		sort: Partial<Sort>;
	};
	selectMstCd: string | null;
	selectedRows: TableData<SubCodeDto>[];
	clearSearch: (form: FormInstance) => void;
	setSelectedMstCd: (mstCd: string | null) => void;
	setSelectedRows: (data: TableData<SubCodeDto>[]) => void;
	setFilter: (filter: Partial<MasterCodeListFilterForm>) => void;
	setSort: (sort: Partial<Sort>) => void;
	setPagination: (current: number, pageSize: number) => void;
}

const INITIAL_SEARCH_STATE = {
	filter: {
		useFlg: '',
		coId: authService.getCurrentUser()?.userInfo.coId,
	},
	sort: {},
	pagination: DEFAULT_PAGINATION,
};

const INITIAL_STATE = {
	search: INITIAL_SEARCH_STATE,
	selectedRows: [],
	selectMstCd: null,
};

export const useMasterCodeManagementStore = create(
	devtools<MasterCodeManagementStoreState>((set) => ({
		...INITIAL_STATE,
		clearSearch: (form: FormInstance) => {
			// IMPORTANT: Need to set timeout because the form is running asynchrous
			setTimeout(() => {
				form.resetFields();
			}, 0);
			set({ search: INITIAL_SEARCH_STATE });
		},
		setFilter: (filter: Partial<MasterCodeListFilterForm>) => {
			set((state) => ({
				search: { ...state.search, filter: { ...state.search.filter, ...filter } },
			}));
		},
		setSelectedRows: (rows) => {
			set(() => ({
				selectedRows: rows,
			}));
		},
		setSelectedMstCd: (mstCd) => {
			set(() => ({
				selectMstCd: mstCd,
			}));
		},
		setSort: (sort: Partial<Sort>) => {
			set((state) => ({
				search: { ...state.search, sort },
			}));
		},
		setPagination: (current: number, pageSize: number) => {
			set((state) => ({
				search: {
					...state.search,
					pagination: {
						current,
						pageSize,
					},
				},
			}));
		},
	})),
);
