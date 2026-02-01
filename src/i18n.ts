import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';
import it from './locales/it/translation.json';
import ar from './locales/ar/translation.json';
import nl from './locales/nl/translation.json';
import es from './locales/es/translation.json';
import ru from './locales/ru/translation.json';
import zh from './locales/zh/translation.json';
import el from './locales/el/translation.json';
import fa from './locales/fa/translation.json';
import pt from './locales/pt/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            de: { translation: de },
            it: { translation: it },
            ar: { translation: ar },
            nl: { translation: nl },
            es: { translation: es },
            ru: { translation: ru },
            zh: { translation: zh },
            el: { translation: el },
            fa: { translation: fa },
            pt: { translation: pt },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
