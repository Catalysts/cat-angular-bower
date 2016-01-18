interface ICatI18nMessageSourceService {
    getMessages(locale: string): IPromise<any>;
    getMessage(key: string, locale?: string): IPromise<string>;
    hasMessage(key: string, locale?: string): IPromise<boolean>;
}
/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nMessageSourceService
 * @module cat.service.i18n
 * @service
 *
 * @description
 * A service to retrieve message templates for a given key and locale
 *
 * @param {object} $q DOCTODO
 * @param {object} catI18nLocaleService DOCTODO
 * @param {string} CAT_I18N_DEFAULT_LOCALE DOCTODO
 * @constructor
 */
declare class CatI18nMessageSourceService implements ICatI18nMessageSourceService {
    private $q;
    private catI18nLocaleService;
    private CAT_I18N_DEFAULT_LOCALE;
    constructor($q: IQService, catI18nLocaleService: ICatI18nLocaleService, CAT_I18N_DEFAULT_LOCALE: string);
    private _getLocale(locale);
    private _getMessages(locale);
    /**
     * @ngdoc function
     * @name getMessages
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message bundle for a given locale
     *
     * @param {String} [locale] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message bundle
     */
    getMessages(locale: any): IPromise<any>;
    /**
     * @ngdoc function
     * @name getMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message for a given key and locale
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message
     */
    getMessage(key: any, locale: any): IPromise<any>;
    /**
     * @ngdoc function
     * @name hasMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which checks whether or not a message for a given key and locale exists
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be available
     * @returns {Promise} a promise holding <code>TRUE</code> if the key can be resolved for the given locale
     */
    hasMessage(key: any, locale: any): IPromise<boolean>;
}
