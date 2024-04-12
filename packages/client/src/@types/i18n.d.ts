import 'i18next';
import de from '../translations/de.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'de';
    resources: {
      de: typeof de;
    };
  }
}
