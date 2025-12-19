/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from '@/services/auth/authJwtService';
import appStore from '../stores/AppStore';
import { DateFormat, type Loose, type MenuTree, type ProgramTree } from '../types';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);

// Helper function to generate a unique ID with format DDMMYYXXXXXX
export const generateId = (): string => {
	const now = new Date();

	// Get Day, Month, Year
	const day = now.getDate().toString().padStart(2, '0');
	const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() trả về 0-11
	const year = now.getFullYear().toString().slice(-2); // Lấy 2 ký tự cuối của năm

	// Generate 6 random characters from A-Z and 0-9
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomChars = '';
	for (let i = 0; i < 6; i++) {
		randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	// Kết hợp theo format DDMMYYXXXXXX
	return `${day}${month}${year}${randomChars}`;
};

export function formatDate(dateString: string, isShowTime?: boolean): string {
	if (!dateString) {
		return '';
	}

	const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
	if (dateOnlyMatch && !isShowTime) {
		const [year, month, day] = dateOnlyMatch.slice(1);
		const format = appStore.state.dateFormat;

		switch (format) {
			case DateFormat.YYYY_MM_DD_HH_MM_SS:
				return `${year}/${month}/${day}`;
			case DateFormat.MM_DD_YYYY_HH_MM_SS:
				return `${month}/${day}/${year}`;
			case DateFormat.DD_MM_YYYY_HH_MM_SS:
				return `${day}/${month}/${year}`;
			default:
				return `${year}/${month}/${day}`;
		}
	}

	// 1) trim and replace the first space between date & time with 'T'
	let normalized = dateString.trim().replace(' ', 'T');

	// 2) trim microseconds -> milliseconds (e.g. .509338 -> .509)
	normalized = normalized.replace(/(\.\d{3})\d+/, '$1');

	// 3) normalize timezone formats:
	//    +0700  -> +07:00
	//    +07    -> +07:00
	normalized = normalized.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'); // +0700 -> +07:00
	normalized = normalized.replace(/([+-]\d{2})$/, '$1:00'); // +07 -> +07:00

	const currentCompanyTimeZone = authService.getCurrentUser()?.userInfo.coTmz || 'UTC';

	const date = new Date(normalized);
	if (isNaN(date.getTime())) return '';

	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: currentCompanyTimeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).formatToParts(date);

	if (isNaN(date.getTime())) {
		return '';
	}

	const year = parts.find((p) => p.type === 'year')?.value ?? '';
	const month = parts.find((p) => p.type === 'month')?.value ?? '';
	const day = parts.find((p) => p.type === 'day')?.value ?? '';
	const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
	const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
	const second = parts.find((p) => p.type === 'second')?.value ?? '';

	const format = appStore.state.dateFormat;

	switch (format) {
		case DateFormat.YYYY_MM_DD_HH_MM_SS:
			return `${year}/${month}/${day} ${isShowTime ? `${hour}:${minute}:${second}` : ''}`;
		case DateFormat.MM_DD_YYYY_HH_MM_SS:
			return `${month}/${day}/${year} ${isShowTime ? `${hour}:${minute}:${second}` : ''}`;
		case DateFormat.DD_MM_YYYY_HH_MM_SS:
			return `${day}/${month}/${year} ${isShowTime ? `${hour}:${minute}:${second}` : ''}`;
		default:
			throw new Error(`Unsupported format: ${format}`);
	}
}

export function formatNumberAmount(value: string | number, precision?: number) {
	if (!value) return '';
	const [intPart, decPart = ''] = String(value).split('.');
	const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	if (precision !== undefined) {
		return (
			withCommas +
			(precision > 0 ? '.' + (decPart + '0'.repeat(precision)).slice(0, precision) : '')
		);
	}

	// Always show 2 decimals
	return `${withCommas}.${(decPart + '0'.repeat(2)).slice(0, 2)}`;
}

export function parserNumberAmount(value: string | undefined) {
	if (!value) return '';

	// remove commas
	let cleaned = value.replace(/,/g, '');

	// allow only first dot
	const firstDot = cleaned.indexOf('.');
	if (firstDot !== -1) {
		cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, ''); // remove extra dots
	}

	// cut decimals > 2
	const [intPart, decPart = ''] = cleaned.split('.');
	return decPart ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
}

export function convertToDBColumn(input: string) {
	return input ? input.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase() : input;
}

export function buildMenuProgramTree(nodes: ProgramTree[]): ProgramTree[] {
	const map = new Map<string, ProgramTree>();
	const tree: ProgramTree[] = [];

	// 1. Map all nodes
	nodes.forEach((node) => map.set(node.pgmId!, { ...node }));

	// 2. Build tree
	nodes.forEach((node) => {
		const parentId = node.prntPgmId;
		if (parentId && map.has(parentId)) {
			const parent = map.get(parentId)!;
			// Only create children array if parent has children
			if (!parent.children) parent.children = [];
			parent.children.push(map.get(node.pgmId!)!);
		} else {
			tree.push(map.get(node.pgmId!)!);
		}
	});

	const cleanTree = (arr: ProgramTree[]): MenuTree[] =>
		arr.map(({ children, key, icon, pgmNm }) => ({
			key,
			icon,
			label: pgmNm!,
			...(children?.length ? { children: cleanTree(children || []) } : {}),
		}));

	return cleanTree(tree);
}

export const getAllChildNodes = (node: ProgramTree): ProgramTree[] => {
	if (!node.children) return [node];
	return [node, ...node.children.flatMap(getAllChildNodes)];
};

export function deepEqual<T>(
	a: Loose<T>,
	b: Loose<T> | undefined,
	options: { strict?: boolean } = { strict: false },
): boolean {
	if (a === b) return true;

	// Handle null or non-objects
	if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
		return false;
	}

	// Handle arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((item, index) => deepEqual(item, b[index], options));
	}

	// If one is array and the other isn’t
	if (Array.isArray(a) !== Array.isArray(b)) return false;

	// Handle plain objects
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	// In strict mode, both must have the same keys
	if (options.strict && keysA.length !== keysB.length) return false;

	// In loose mode, only check keysA are present in b
	for (const key of keysA) {
		if (!(key in b)) {
			if (options.strict) return false;
			else continue;
		}
		if (!deepEqual(a[key], b[key], options)) return false;
	}

	return true;
}

export function removeNonSerializable(obj: any): any {
	if (obj === null || typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj.map(removeNonSerializable);
	}

	const clean: Record<string, any> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'function') continue;
		if (value instanceof Element) continue; // DOM
		if (value && value.constructor && value.constructor.name === 'FiberNode') continue;
		clean[key] = removeNonSerializable(value);
	}
	return clean;
}

// Convert Dayjs | Timestamp tz string into YYYY-MM-DD
export function convertDate(date: dayjs.Dayjs | string) {
	if (!date) return '';

	// If it's a Day.js object, format directly
	if (dayjs.isDayjs(date)) {
		return date.format('YYYY-MM-DD');
	}

	// If it's a string, parse as local time to avoid -1 day issue
	return dayjs(date.replace?.('Z', '')).format('YYYY-MM-DD');
}
