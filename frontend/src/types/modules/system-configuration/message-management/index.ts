import type { DynamicFilterDto } from '@/types/api';

// Re-export types from auto-generated API types
export type {
	ComMsgDto,
	ComMsgTransDto,
	ComMsgListDto,
	SearchComMsgDto,
} from '@/types/api';

// Search/Filter form (local form state - not from API)
export type MessageListFilterForm = {
	coId?: string;
	msgId?: string;
	dfltMsgVal?: string;
	mdlNm?: string;
	msgTpVal?: string;
	filters?: DynamicFilterDto[];
};
