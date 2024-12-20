import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationFr from './fr/translation.json';
import translationPt from './pt/translation.json';
import translationAr from './ar/translation.json';
import translationSw from './sw/translation.json';
import translationEs from './es/translation.json';
import translationRo from './ro/translation.json';

/// Use the navigator language to set the default language
const language = navigator.language || navigator.userLanguage;

console.log({language});


i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: translationEn },
            fr: { translation: translationFr },
            pt: { translation: translationPt },
            ar: { translation: translationAr },
            sw: { translation: translationSw },
            es: { translation: translationEs },
            ro: { translation: translationRo },
        },
        /// Set the default language, if isn't one, set it to English
        lng: language.split('-')[0] || 'en',
        /// Fallback language, if the translation isn't found in the current language, it will use the translation from the fallback language
        fallbackLng: 'en',
        interpolation: {
            /// Escape the HTML tags
            escapeValue: false,
        },
    });

export default i18n;