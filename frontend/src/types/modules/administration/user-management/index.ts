import type { DynamicFilterDto } from '@/types/api';

export type UserListFilterForm = {
	coId: string;
	usrId: string;
	usrNm: string;
	useFlg: string;
	filters: DynamicFilterDto[];
};
