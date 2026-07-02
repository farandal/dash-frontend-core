import { getDashIPCService, isElectron } from './dashIPCService';

/**
 * Unified text-to-speech entry point, routed by platform:
 * - Android (native/Capacitor): @capacitor-community/text-to-speech
 * - Electron: window.DashIPCService -> Python tts_service (unchanged)
 * - Web/other: no-op (not yet supported)
 *
 * Capacitor is deliberately accessed via `window.Capacitor` rather than a
 * static `import ... from '@capacitor/core'`: the Android build externalizes
 * @capacitor/core from the Rollup bundle (it's injected as a global by the
 * native bridge at runtime), so a static import resolves to a bare, unbundled
 * specifier that the WebView cannot load.
 */

interface CapacitorGlobal {
    isNativePlatform?: () => boolean;
    getPlatform?: () => string;
    Plugins?: {
        TextToSpeech?: {
            speak: (options: {
                text: string;
                lang?: string;
                rate?: number;
                pitch?: number;
                volume?: number;
            }) => Promise<unknown>;
        };
    };
}

const getCapacitor = (): CapacitorGlobal | undefined =>
    (window as unknown as { Capacitor?: CapacitorGlobal })?.Capacitor;

const getTextToSpeechPlugin = () => getCapacitor()?.Plugins?.TextToSpeech;

const LANG_LOCALE_MAP: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
};

// The Electron/Python path accepts short codes (gTTS); the Capacitor plugin
// expects BCP-47 locale tags, so only the Android branch needs this mapping.
const toLocale = (lang?: string): string => {
    if (!lang) return LANG_LOCALE_MAP.es;
    if (lang.includes('-')) return lang;
    return LANG_LOCALE_MAP[lang.toLowerCase()] || lang;
};

const isNativeAndroid = (): boolean => {
    const capacitor = getCapacitor();
    return !!capacitor?.isNativePlatform?.() && capacitor.getPlatform?.() === 'android';
};

export const speak = (text: string, lang?: string): void => {
    if (!text) return;

    if (isNativeAndroid()) {
        const textToSpeech = getTextToSpeechPlugin();
        if (!textToSpeech) {
            console.warn('Native Android TTS plugin not available on window.Capacitor.Plugins');
            return;
        }
        textToSpeech
            .speak({ text, lang: toLocale(lang), rate: 1.0, pitch: 1.0, volume: 1.0 })
            .catch((error) => {
                console.error('Native Android TTS failed:', error);
            });
        return;
    }

    if (isElectron()) {
        getDashIPCService()?.speak({ message: text, lang });
        return;
    }

    // Web/other: no-op (unchanged behavior)
};

export const speakAsync = async (text: string, lang?: string): Promise<void> => {
    if (!text) return;

    if (isNativeAndroid()) {
        const textToSpeech = getTextToSpeechPlugin();
        if (!textToSpeech) {
            console.warn('Native Android TTS plugin not available on window.Capacitor.Plugins');
            return;
        }
        await textToSpeech.speak({ text, lang: toLocale(lang), rate: 1.0, pitch: 1.0, volume: 1.0 });
        return;
    }

    if (isElectron()) {
        const ipc = getDashIPCService() as (ReturnType<typeof getDashIPCService> & {
            speakAsync?: (text: string, lang?: string) => Promise<unknown>;
        });
        if (ipc?.speakAsync) {
            await ipc.speakAsync(text, lang);
        } else {
            ipc?.speak({ message: text, lang });
        }
        return;
    }

    // Web/other: no-op (unchanged behavior)
};

export default { speak, speakAsync };
