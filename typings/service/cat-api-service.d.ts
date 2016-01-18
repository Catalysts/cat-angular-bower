import MemoizedFunction = _.MemoizedFunction;
interface ICatApiService {
    [key: string]: ICatApiEndpoint;
}
interface CatApiEndpointSettings {
    name?: string;
    url?: string;
    model?: new (data?: any) => any;
    children?: CatApiEndpointSettings[];
}
interface CatApiEndpointConfig {
    url: string;
    list?: any;
    name: string;
    model: new (data?: any) => any;
}
interface ICatApiServiceProvider extends IServiceProvider {
    endpoint(name: string, settings?: CatApiEndpointSettings): EndpointConfig;
}
interface CatApiCustom {
    get(url: string, searchRequest: any): any;
    put(url: string, object: any): any;
    post(url: string, object: any): any;
}
interface CatPagedResponse<T> {
    elements: T[];
    totalCount: number;
    facets?: Facet[];
}
interface ICatApiEndpoint {
    parentEndpoint?: ICatApiEndpoint;
    config: CatApiEndpointConfig;
    custom: CatApiCustom;
    getEndpointName(): string;
    getEndpointUrl(): string;
    get(id: any): any;
    info(id: any): any;
    copy(id: any): any;
    list(searchRequest?: SearchRequest): IPromise<CatPagedResponse<any>>;
    all(): any[];
    save(data: any): IPromise<any>;
    remove(id: any): IHttpPromise<any>;
}
/**
 * @name CatApiEndpoint
 *
 * @description
 * A CatApiEndpoint wraps several helper functions to easily execute backend calls for the base CRUD operations.
 * It also adds support for 'children' which can only be used by resolving them for a parent id.
 * @param {string} url the base url which is added before the configured urls
 * @param {object} endpointConfig the configuration of this endpoint - holds properties like name, url, the model and children
 * @param {object} $http the angular $http service which handles the actual xhr requests
 * @param {object} catConversionService the catConversionService used to convert from and to server side data
 * @param {object} catSearchService the catSearchService for handling all operations concerning cat.uitl.SearchRequest objects
 * @constructor
 */
declare class CatApiEndpoint implements ICatApiEndpoint {
    private $http;
    private catConversionService;
    private catSearchService;
    _endpointName: string;
    config: CatApiEndpointConfig;
    _endpointUrl: string;
    _childEndpointSettings: any;
    _endpointListConfig: any;
    /**
     * Simple wrapper object which contains the custom get, put and post methods
     * @type {{}}
     */
    custom: CatApiCustom;
    constructor(url: string, endpointConfig: any, $http: any, catConversionService: any, catSearchService: any);
    /**
     * This helper function initializes all configured child endpoints by creating the appropriate url by appending
     * the given id before initializing them.
     * @return {object} a object holding all resolved child endpoints for the given id
     * @private
     */
    private _res;
    private _addChildEndpoints(data);
    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    private _mapResponse(data);
    /**
     * This helper methods deletes all child endpoints from the given object.
     * @param {object} object the object to remove the child endpoints from
     * @return {object} the passed in object without the child endpoints
     * @private
     */
    private _removeEndpoints(object);
    /**
     * This helper method turns a cat.SearchRequest in to en url encoded search query
     * @param {window.cat.SearchRequest} [searchRequest] the search request which should be url encoded
     * @return {string} either the url encoded search query or an empty string if no search request is given or it is not a instance of cat.SearchRequest
     * @private
     */
    private _getSearchQuery(searchRequest);
    /**
     * This method is used to instantiate actual child api endpoints which are dependent on a certain parent id
     * @param id the id for which to 'resolve' the child endpoints.
     * @return {object} a object which maps all child endpoint names to the actual endpoints where the url was resolved
     * with the provided id
     */
    res(id: any): Object;
    /**
     * A small helper function to retrieve the actual url this endpoint resolved to.
     * @return {string} the resolved url of this endpoint
     */
    getEndpointUrl(): string;
    /**
     * A small helper to retrieve the name of the endpoint.
     * @return {string} the name of this endpoint
     */
    getEndpointName(): string;
    /**
     * This function calls by default the url available via #getEndpointUrl without further modification apart from
     * adding search parameters if the searchRequest parameter is provided. In addition an alternative  endpoint url can
     * be configured with `endpoint.list.endpoint`, such that the request will be send to another endpoint url.
     * (#getEndpointUrl + additional_url).
     * It can handle either an array response in which case all elements will be
     * mapped to the appropriate configured model or a 'paginated' result in which case an object with totalCount,
     * facests and elements will be returned.
     *
     * @param {SearchRequest} [searchRequest] if given searchRequest#urlEncoded() will be added to the request url
     * @return {[{object}]|{totalCount: {Number}, facets: [{Facet}], elements: []}} a promise wrapping either a list of
     * instances of the configured model or a wrapper object which holds not only the list but pagination information
     * as well
     */
    list(searchRequest: any): IPromise<CatPagedResponse<any>>;
    /**
     * A helper function which adds '/all' to the request url available via #getEndpointUrl and maps the response to
     * the configured model.
     * @return [{object}] a promise wrapping an array of new instances of the configured model initialized with the data retrieved from
     * the backend
     */
    all(): any[];
    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of the provided id at the end.
     * @param id the id which will be appended as '/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    get(id: any): any;
    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of '/copy' and the provided id at the end.
     * @param id the id which will be appended as '/copy/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    copy(id: any): any;
    /**
     * This method makes a GET the url available via #getEndpointUrl with the addition of the provided id at the end + the
     * 'info' request parameter.
     * @param id the id which will be appended as '/:id' to the url
     * @return {*} a promise wrapping the data retrieved from the backend
     */
    info(id: any): any;
    /**
     * This method is either makes a PUT or POST request to the backend depending on wheter or not the given object
     * has an 'id' attribute.
     * For PUT requests the url resolves to #getEndpointUrl + /:id, for POST requests it is just the #getEndpointUrl
     * @param {object} object the object which should be sent to the sever. it is stripped of all child endpoints before
     * it is sent.
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    save(object: any): IPromise<any>;
    /**
     * This method executes a DELETE request to the url available via #getEndpointUrl with the addition of the provided url at the end.
     * @param url the url to be appended to the endpoint url - usually only the id of the object to delete
     * @return {*} The promise returned by the $http 'DELETE' call
     */
    remove(url: any): any;
}
/**
 * @ngdoc service
 * @name EndpointConfig
 *
 * @description
 * An 'EndpointConfig' basically is a wrapper around the configuration for an api endpoint during the configuration
 * phase which is later used to instantiate the actual CatApiEndpoints. It exposes its name, the configuration itself,
 * as well as a map of all its children and helper function to create or receive child endpoint configurations.
 *
 * @param {string} name the name of the endpoint
 * @param {object} config the api endpoint configuration which basically wraps an 'url' and a 'model' attribute.
 * If a 'children' attribute is present as well it will be used to create the appropriate child endpoints automatically,
 * without the need to call the #child method manually - this works to arbitrary deps.
 * @constructor
 */
declare class EndpointConfig {
    name: string;
    config: CatApiEndpointSettings;
    parent: EndpointConfig;
    children: {
        [key: string]: EndpointConfig;
    };
    constructor(name: string, config?: CatApiEndpointSettings);
    /**
     * This method method either returns or creates and returns a child api endpoint of the current one.
     *
     * @param {string} childName the name of the child endpoint
     * @param {object} [childConfig] if given a new EndpointConfig will be created as a child of the current one. The
     * parent property of the created config will point to the current config
     * @return {EndpointConfig} the child endpoint config with the given name
     */
    child(childName: string, childConfig: CatApiEndpointSettings): EndpointConfig;
}
declare class CatApiServiceProvider implements ICatApiServiceProvider {
    private _endpoints;
    /**
     * This method is used to either create or retrieve named endpoint configurations.
     * @param {string} name the name of the api endpoint to create or retrieve the configuration for
     * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
     * @return {EndpointConfig} the endpoint config for the given name
     */
    endpoint(name: any, settings: any): any;
    /**
     * @return {object} returns a map from names to CatApiEndpoints
     */
    private $getCatApiService($http, catConversionService, catSearchService, CAT_API_SERVICE_DEFAULTS);
    $get: (string | (($http: any, catConversionService: any, catSearchService: any, CAT_API_SERVICE_DEFAULTS: any) => any))[];
}
