import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import { authService } from './services/auth/authJwtService';

// Loading translation files
import en from './locales/en.json';
import kr from './locales/kr.json';
import vn from './locales/vn.json';
import appStore from './stores/AppStore';
import type { TLang } from './types';

i18n
	.use(HttpBackend) // Loads translations from backend
	.use(initReactI18next) // Passes i18n instance to react-i18next
	.init({
		resources: {
			en: {
				translation: en,
			},
			kr: {
				translation: kr,
			},
			vn: {
				translation: vn,
			},
		},
		// backend: {
		// 	loadPath: `${import.meta.env.VITE_API_URL}/comMsg/getI18nMessages/{{lng}}`, // Path to translation files
		// 	requestOptions: {
		// 		method: 'GET',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${authService.getAccessToken()}`,
		// 			withCredentials: true,
		// 		},
		// 	},
		// },
		partialBundledLanguages: true,
		ns: ['translation', 'messages'], // Define namespaces
		lng: 'en', // Default language
		fallbackLng: 'en', // Fallback language
		interpolation: {
			escapeValue: false, // React already does escaping
		},
	});

// // Add static frontend resources (titles, labels, etc.)
// i18n.addResourceBundle('en', 'translation', en, true, true);
// i18n.addResourceBundle('kr', 'translation', kr, true, true);
// i18n.addResourceBundle('vn', 'translation', vn, true, true);


export async function loadBackendTranslations(lang: string) {
	try {
		const token = authService.getAccessToken();
		const res = await fetch(`${import.meta.env.VITE_API_URL}/comMsg/getI18nMessages/${lang}`, {
			method: "GET",
			headers: {
			  "Content-Type": "application/json",
			  "Authorization": `Bearer ${token}`,
			},
		});
		if (!res.ok) return;
		const backendTranslations = await res.json();
		i18n.addResources(lang, "messages", backendTranslations);
		appStore.setLang(lang as TLang);
	} catch (error) {
		console.error('Error loading backend translations:', error);
	}
}

export default i18n;
