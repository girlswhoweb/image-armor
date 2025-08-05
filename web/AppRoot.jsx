import { AppProvider } from "@shopify/polaris";
import enTranslations from "./translations/en.json";
import App from "./App";
import { I18nContext, I18nManager, useI18n } from "@shopify/react-i18n";
import './App.css';

function TranslationProvider(props) {
  // Get from the localstorage first 
  const localStorageLocale = localStorage.getItem("supr-language");
  const locale = localStorageLocale || new URLSearchParams(location.search).get("locale")?.split("-")?.[0] || "en";
  const i18nManager = new I18nManager({
    locale,
    onError(err) {
      console.error(err.message);
    },
  });
  return (
    <I18nContext.Provider value={i18nManager}>
      <AppRoot />
    </I18nContext.Provider>
  );
}

export function AppRoot(props) {
  const [i18n] = useI18n({
    id: 'Polaris',
    fallback: enTranslations,
    translations: async function(locale) {
      try {
        const dictionary = await import(`./translations/${locale}.json`);
        return dictionary.default;
      } catch (error) {
        // console.log("error", error);
      }
    },
  })

  return (
    <AppProvider i18n={i18n.translations.slice().reverse()}>
        <App />
    </AppProvider>
  );
}

export default TranslationProvider;
