import type { DynamicFilterDto } from '@/types/api';

export type MasterCodeListFilterForm = {
	coId: string;
	mstCd: string;
	mstNm: string;
	useFlg: string;
	filters: DynamicFilterDto[];
};
