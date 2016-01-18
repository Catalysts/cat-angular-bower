/**
 * Created by tscheinecker on 21.10.2014.
 */
interface ICatI18nService {
    translate(key: string, parameters?: any, locale?: string): IPromise<string>;
    canTranslate(key: string, locale?: string): IPromise<boolean>;
}
declare class CatI18nService implements ICatI18nService {
    private $q;
    private $log;
    private catI18nMessageSourceService;
    private catI18nMessageParameterResolver;
    constructor($q: IQService, $log: ILogService, catI18nMessageSourceService: ICatI18nMessageSourceService, catI18nMessageParameterResolver: (string, any) => string);
    /**
     * @name catI18nService#translate
     * @function
     *
     * @description
     * Tries to resolve the given key to a message of the given locale. The messages are retrieved from the
     * {@link catI18nMessageSourceService} and then passed through {@link catI18nMessageParameterResolver}.
     *
     * @param {String} key the key of the message to be translated
     * @param {Object|Array} [parameters] message parameters usable in the resolved message
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale to use for translation
     * @returns {promise} Returns a promise of the translated key
     */
    translate(key: any, parameters: any, locale: any): IPromise<{}>;
    /**
     * @name catI18nService#canTranslate
     * @function
     *
     * @description
     * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
     * This is useful when you are dealing with an object that might or might not be a promise, or if
     * the promise comes from a source that can't be trusted.
     *
     * @param {String} key the key of the message to be translated
     * @param {String} [locale] the locale to use for translation
     * @returns {promise} Returns a promise which resolves to true when a message for the given key exists for the
     * specified locale
     */
    canTranslate(key: any, locale: any): IPromise<boolean>;
}
