declare function assignDeep(target: any, source: any): any;
interface ICatSelectConfigService {
    getConfig(name: string, options?: any): any;
}
/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigService
 * @module cat.service.selectConfig
 *
 * @constructor
 */
declare class CatSelectConfigService implements ICatSelectConfigService {
    private configs;
    constructor(configs: any);
    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigService
     *
     * @description
     *
     * @param {String} name the name of the config to retreive
     * @param {Object} [options] Optional options to use as default values
     * @returns {*} the named config object (with applied defaults) or undefined
     */
    getConfig(name: any, options: any): any;
}
interface ICatSelectConfigServiceProvider extends IServiceProvider {
    config(name: string, config?: any): any;
}
/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigServiceProvider
 * @module cat.service.selectConfig
 *
 * @description
 *
 * @constructor
 */
declare class CatSelectConfigServiceProvider implements ICatSelectConfigServiceProvider {
    private configs;
    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigServiceProvider
     *
     * @description
     *
     * @param {String} name the name of the config to save or retrieve
     * @param {Object} [config] The config to save for the given name or undefined to receive the config
     * @returns {*} the named config object
     */
    config(name: any, config: any): any;
    $get: (() => CatSelectConfigService)[];
}
