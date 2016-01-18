interface ICatI18nLocaleService {
    getLanguageOfLocale(locale?: string): string | void;
    getCurrentLocale(): string;
    getDefaultLocale(): string;
}
/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nLocaleService
 * @module cat.service.i18n
 */
declare class CatI18nLocaleService implements ICatI18nLocaleService {
    private $locale;
    private CAT_I18N_DEFAULT_LOCALE;
    constructor($locale: ILocaleService, CAT_I18N_DEFAULT_LOCALE: string);
    getLanguageOfLocale(locale: any): any;
    getCurrentLocale(): string;
    getDefaultLocale(): string;
}
