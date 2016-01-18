interface ICatViewServiceProvider extends IServiceProvider {
    listAndDetailView(baseUrl: string, name: string, config?: any): void;
}
/**
 * @ngdoc service
 * @name cat.service.view:catViewService
 * @module cat.service.view
 *
 * @description
 * This service provider can be used to initialize an api endpoint and the according detail and list routes by simply
 * providing a name and a config object.
 *
 * @param {CatRouteServiceProvider} catRouteServiceProvider DOCTODO
 * @param {CatApiServiceProvider} catApiServiceProvider DOCTODO
 * @constructor
 */
declare class CatViewServiceProvider implements ICatViewServiceProvider {
    private catRouteServiceProvider;
    private catApiServiceProvider;
    private viewNames;
    private endpointNames;
    constructor(catRouteServiceProvider: ICatRouteServiceProvider, catApiServiceProvider: ICatApiServiceProvider);
    /**
     * This function registers a new api endpoint with catApiServiceProvider and a list and detail route with
     * catRouteServiceProvider
     * @param {string} baseUrl the base url which will be prepended to all generated route pats
     * @param {string} name the name used as entry point to all routes and endpoint creations (camel cased)
     * @param {object} [config] the config object which can in turn hold objects used for configuration of the endpoint,
     * detail route or list route
     */
    listAndDetailView(baseUrl: string, name: string, config: ICatListAndDetailViewConfig): void;
    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to other service providers
     * @return {{views: Array, endpoints: Array}}
     */
    $get: (() => {
        views: string[];
        endpoints: string[];
    })[];
}
