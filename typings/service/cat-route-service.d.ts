import IStateProvider = angular.ui.IStateProvider;
interface ICatRouteService extends Array<string> {
}
interface ICatStateConfig {
    parent?: string;
}
interface ICatListAndDetailViewConfig extends ICatStateConfig {
    url?: string;
    list?: ICatListViewConfig;
    details?: ICatDetailViewConfig;
    viewData?: any;
    endpoint?: CatApiEndpointSettings;
}
interface ICatRouteServiceProvider extends IServiceProvider {
    detailRoute(baseUrl: string, name: string, config?: ICatDetailViewConfig): void;
    listAndDetailRoute(baseUrl: string, name: string, config?: ICatListAndDetailViewConfig): void;
}
/**
 * @ngdoc service
 * @name cat.service.route:catRouteServiceProvider
 * @description
 * This service provider delegates to the $stateProvider and actually creates 2 separate routes after applying letious
 * conventions / defaults
 */
declare class CatRouteServiceProvider implements ICatRouteServiceProvider {
    private $stateProvider;
    private viewNames;
    constructor($stateProvider: IStateProvider);
    private static _getListUrl(baseUrl, name, config);
    private _registerAbstractState(url, name);
    private static _getStateName(name, config);
    private _registerDetailState(config, name);
    private _registerListState(config, name);
    /**
     * A helper function for detail routes which applies a few optimizations and some auto configuration.
     * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
     * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
     * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
     * object which pre-loads all the necessary data.
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the state
     * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
     */
    private _getDetailConfig(config, name);
    /**
     * A helper function for list routes which applies a few optimizations and some auto configuration.
     * In the current state it handles 4 settings:
     * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
     * * controller - Auto-generation of the correct controller based on conventions and the config.name property
     * * reloadOnSearch - this property is set to false
     * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
     *
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the sate
     * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
     */
    private _getListConfig(config, name);
    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route url via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    detailRoute(baseUrl: any, name: any, config: ICatDetailViewConfig): void;
    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    listAndDetailRoute(baseUrl: string, name: string, config?: ICatListAndDetailViewConfig): void;
    /**
     * @ngdoc service
     * @name cat.service.route:catRouteService
     * @module cat.service.route
     *
     * @description
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $stateProvider
     */
    $get: (() => ICatRouteService)[];
}
