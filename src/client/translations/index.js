import { addLocaleData } from 'react-intl';
import _ from 'lodash';
import { setUsedLocale } from '../app/appActions';
import { getLocale } from '../reducers';

export const availableLocalesToReactIntl = {};
export const rtlLocales = [];

export const getBrowserLocale = () => {
  let detectedLocale;
  if (typeof navigator !== 'undefined') {
    detectedLocale =
      navigator.userLanguage ||
      navigator.language ||
      (navigator.languages && navigator.languages[0] ? navigator.languages[0] : undefined);
  }
  if (detectedLocale) {
    return detectedLocale.slice(0, 2);
  }
  return undefined;
};

export const getLocaleDirection = locale => (rtlLocales.includes(locale) ? 'rtl' : 'ltr');

export const getAvailableLocale = appLocale => {
  const locale = appLocale || 'auto';

  if (appLocale === 'auto') {
    return getBrowserLocale() || 'en';
  }

  return _.get(availableLocalesToReactIntl, locale, 'en');
};

export const getTranslationsByLocale = appLocale => {
  const allTranslations = _.keys(availableLocalesToReactIntl);

  if (appLocale === 'auto') {
    const browserLocale = getBrowserLocale();
    return _.findKey(availableLocalesToReactIntl, locale => locale === browserLocale) || 'default';
  }

  return _.get(allTranslations, _.indexOf(allTranslations, appLocale), 'default');
};

export const loadTranslations = async store => {
  const state = store.getState();
  const locale = getLocale(state);
  const availableLocale = getAvailableLocale(locale);
  const translationsLocale = getTranslationsByLocale(locale);
  const localeDataPromise = await import(`react-intl/locale-data/${availableLocale}`);
  const translationsPromise = await import(`../locales/${translationsLocale}.json`);
  const [localeData, translations] = await Promise.all([localeDataPromise, translationsPromise]);
  addLocaleData(localeData);
  global.translations = translations;
  store.dispatch(setUsedLocale(availableLocale));
};
