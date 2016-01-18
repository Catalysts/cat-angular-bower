
/**
 * @ngdoc function
 * @name cat.FacetTerm
 * @module cat
 *
 * @description
 * A 'FacetTerm' model used in conjunction with the cat-paginated directive where it represents a value of a group or
 * property which can be used to filter the shown list.
 * It consist of an id, a name and a count
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
declare class FacetTerm {
    id: any;
    name: string;
    count: number;
    constructor(data?: any);
}
/**
 * @ngdoc overview
 * @name Facet
 *
 * @description
 * A 'Facet' model which is used in conjunction with the cat-paginated directive where it represents a group or
 * which property which can be used to filter the shown list.
 * It has a name and an array of FacetTerms
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
declare class Facet {
    name: string;
    terms: Array<FacetTerm>;
    constructor(data?: any);
}

interface Sort {
    property?: string;
    isDesc?: boolean | string;
}
interface Pagination {
    page: number;
    size: number;
}
interface SearchUrlParams {
    page?: number;
    size?: number;
    sort?: string;
    rev?: boolean;
}
/**
 * @ngdoc function
 * @name cat.SearchRequest
 * @module cat
 *
 * @description
 * A 'SearchRequest' model used by the catApiService to provide the backend with certain filter, order, page and size
 * parameters.
 *
 *
 * @param {Object} [searchUrlParams] an object representing the search parameters of the current url, which are
 * used to initialize the properties of the SearchRequest
 * @constructor
 */
declare class SearchRequest {
    private _pagination;
    private _sort;
    private _search;
    private _dirty;
    private lastEncoded;
    constructor(searchUrlParams?: SearchUrlParams);
    private _encodeSort();
    private _encodePagination();
    private static _concatenate(result, next);
    private _encodeSearch();
    private _urlEndoded();
    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    pagination(pagination: Pagination): Pagination;
    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    sort(sort?: Sort): Sort;
    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    search(search?: any): {};
    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    urlEncoded(): any;
    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    isDirty(): boolean;
    setPristine(): void;
    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    setSearch($location: any): void;
}

interface CatMessagesConfig {
    knownFieldsActive: boolean;
}

interface ICatBaseDetailStateParams extends IStateParamsService {
    id: string | number;
}
interface ICatBaseDetailScope<T> extends IScope {
    baseTabsController: (string | Function)[];
    config: ICatDetailConfig;
    detail: T;
    editDetail: T;
    editTemplate: string;
    exists: boolean;
    mainViewTemplate: string;
    additionalViewTemplate?: string;
    uiStack: CatBreadcrumb[];
    add(): void;
    copy(): void;
    cancelEdit(): void;
    edit(): void;
    reloadDetails(): void;
    remove(): void;
    save(styInEdit?: boolean): void;
    title(): string;
}
declare class CatBaseDetailController {
    private $scope;
    private $state;
    private $stateParams;
    private $location;
    private $window;
    private $globalMessages;
    private $controller;
    private $log;
    private catValidationService;
    private catBreadcrumbsService;
    private config;
    /**
     * @ngdoc controller
     * @name cat.controller.base.detail:CatBaseDetailController
     * @module cat.controller.base.detail
     *
     * @description
     * The CatBaseDetailController takes care of providing several common properties and functions to the scope
     * of every detail page. It also instantiates the controller given via the config.controller parameter and shares
     * the same scope with it.
     *
     * Common properties include:
     * * detail - the actual object to view
     * * editDetail - a copy of the detail object used for editing
     * * breadcrumbs - the breadcrumbs array
     * * uiStack - the ui stack array if parents exist
     * * editTemplate - the url of the edit template
     * * mainViewTemplate - the url of the main view template
     * * additionalViewTemplate - the url of the additional view template if it exists
     *
     * Common functions include:
     * * save - the save function to update / create an object
     * * edit - a function to switch from view to edit mode
     * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
     * * add - a function to switch into edit mode of a new object
     * * remove - a function to delete the current object
     * * title - a function to resolve a 'title' of the current object
     *
     * @param {object} $scope DOCTODO
     * @param {object} $state DOCTODO
     * @param {object} $stateParams DOCTODO
     * @param {object} $location DOCTODO
     * @param {object} $window DOCTODO
     * @param {object} $globalMessages DOCTODO
     * @param {object} $controller DOCTODO
     * @param {object} $log DOCTODO
     * @param {object} catValidationService DOCTODO
     * @param {object} catBreadcrumbsService DOCTODO
     * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
     */
    constructor($scope: ICatBaseDetailScope<any>, $state: IStateService, $stateParams: ICatBaseDetailStateParams, $location: ILocationService, $window: IWindowService, $globalMessages: ICatMessagesService, $controller: any, $log: ILogService, catValidationService: ICatValidationService, catBreadcrumbsService: ICatBreadcrumbsService, config: ICatDetailConfig);
}

interface ICatListScope<T> extends IScope {
    listData: ICatListData<T>;
}
interface ICatBaseListController {
    titleKey: string;
    title: string;
    searchProps: any;
    config: ICatListConfig;
    remove(id: any): void;
}
declare class CatBaseListController implements ICatBaseListController {
    private $scope;
    private $state;
    private $log;
    private catListDataLoadingService;
    config: ICatListConfig;
    titleKey: string;
    title: string;
    searchProps: any;
    /**
     * @ngdoc controller
     * @name cat.controller.base.list:CatBaseListController
     * @module cat.controller.base.list
     *
     * @description
     * The CatBaseListController takes care of providing several common properties to the scope
     * of every list page. It also instantiates the controller given via the config.controller parameter and shares
     * the same scope with it. In addition it has a common template 'cat-base-list.tpl.html' which shows a title,
     * new button and provides the cat-paginated directive.
     *
     * Common properties include:
     * * listData - the listData to be used by cat-paginated
     * * title - the title of the view
     * * searchProps - the list of search properties passed on to the cat-paginated directive
     * * config - the config object used to instantiate this view
     *
     * @param {object} $scope scope
     * @param {object} $state state service
     * @param {object} $controller controller
     * @param {object} $log log
     * @param {object} catBreadcrumbsService catBreadcrumbsService
     * @param {object} catListDataLoadingService catListDataLoadingService
     * @param {object} config holds data like the listData object, the template url, base url, the model constructor, etc.
     */
    constructor($scope: ICatListScope<any>, $state: IStateService, $controller: any, $log: ILogService, catBreadcrumbsService: ICatBreadcrumbsService, catListDataLoadingService: ICatListDataLoadingService, config: ICatListConfig);
    getUrlForId(id: any): string;
    getUrlForNewPage(): string;
    remove(id: any): void;
}

interface ICatBaseTabsScope<T> extends ICatBaseDetailScope<T> {
    activeTab: {
        [tabName: string]: boolean;
    };
    tabController: (string | Function)[];
    tabNames: string[];
    tabs: ICatTab[];
    activateTab(tabName: string): void;
    getTabName(configName: string): string;
    getTabTemplate(tabName: string): string;
    getTabKey(tabName: string): string;
    selectTab(tabName: string): void;
}
interface ICatBaseTabScope<T> extends IScope {
    listData?: ICatListData<T>;
    getEndpoint(): ICatApiEndpoint;
    getSearchRequest(): SearchRequest;
    loadListData(): void;
}
interface ICatBaseTabsStateParams extends ICatBaseDetailStateParams {
    tab?: string;
}
declare class CatBaseTabsController<T> {
    /**
     * @ngdoc controller
     * @name cat.controller.base.tabs:CatBaseTabsController
     * @module cat.controller.base.tabs
     *
     * @description
     * The base code for handling sub entites (as tabs).
     * Includes the instantiation of one controller per tab/list and lazy loading of the approrpiate data
     *
     * @param {Object} $scope The angular scope
     * @param {Object} $controller The angular $controller service
     * @param {Object} $stateParams The ui-router $stateParams service
     * @param {Object} $location The angular $location service
     * @param {Object} catElementVisibilityService The visibility service to check wheter or not a tab should be rendered
     * @param {Object} config The config as handled by state resolve
     * @param {ICatUrlResolverService} urlResolverService service to resolve the template urls
     */
    constructor($scope: ICatBaseTabsScope<T>, $controller: any, $stateParams: ICatBaseTabsStateParams, $location: ILocationService, catElementVisibilityService: ICatElementVisibilityService, config: ICatDetailConfig, urlResolverService: ICatUrlResolverService);
}

declare function catAutofocusDirectiveFactory($timeout: ITimeoutService): IDirective;

interface CatBreadcrumbsConfig {
    homeState: string;
}
interface CatBreadcrumbsScope extends IScope {
    homeState: string;
    breadcrumbs: ICatBreadcrumbsService;
    showHome(): boolean;
}
declare function catBreadcrumbsDirectiveFactory(catBreadcrumbsConfig: CatBreadcrumbsConfig, catBreadcrumbs: ICatBreadcrumbsService): IDirective;

interface CatCheckboxDirectiveScope extends IScope {
    checked: boolean;
}
declare function catCheckboxDirectiveFactory(): IDirective;

interface CatConfirmClickAttributes extends IAttributes {
    catConfirmClick?: string;
    catOnConfirm?: string;
}
declare function catConfirmClickDirectiveFactory(): IDirective;

interface CatElementVisibleScope extends IScope {
    identifier: string;
    data: any;
}
declare function catElementVisibleDirectiveFactory(catElementVisibilityService: any): IDirective;

interface CatFacetsScope<T> extends IScope {
    catPaginatedController: ICatPaginatedController;
    facetSelectOptions: Select2Options;
    listData: ICatListData<T>;
    names?: {
        [facetName: string]: string;
    };
    facets?: {
        [facetName: string]: any;
    };
    facetChanged(facet: Facet): void;
    facetName(facet: Facet): string;
    initFacets(): void;
    isActive(facet: Facet): boolean;
}
declare class CatFacetsController<T> {
    constructor($scope: CatFacetsScope<T>);
}
declare function catFacetsDirectiveFactory(): {
    replace: boolean;
    restrict: string;
    scope: {
        listData: string;
        names: string;
    };
    require: string;
    templateUrl: string;
    link: IDirectiveLinkFn;
    controller: (string | typeof CatFacetsController)[];
};

declare class CatFieldErrorsInfoController {
    private catValidationService;
    contextId: string;
    constructor(catValidationService: any);
    hasErrors(): any;
}
declare function catFieldErrorsInfoDirectiveFactory(): IDirective;

declare class CatFieldErrorsController {
    private catValidationService;
    name: string;
    contextId: string;
    constructor(catValidationService: ICatValidationService);
    hasErrors(): boolean;
    getErrors(): CatFieldError[];
}
declare function catFieldErrorsDirectiveFactory(): {
    replace: string;
    restrict: string;
    scope: {
        name: string;
    };
    bindToController: boolean;
    controllerAs: string;
    require: string[];
    link: IDirectiveLinkFn;
    controller: typeof CatFieldErrorsController;
    templateUrl: string;
};

declare class CatGlobalErrorsController {
    private catValidationService;
    contextId: string;
    constructor(catValidationService: ICatValidationService);
    hasErrors(): boolean;
    getErrors(): string[];
}
declare function catGlobalErrorsDirectiveFactory(): IDirective;

interface CatI18nScope extends IScope {
    key?: string;
    params?: {
        [key: string]: string;
    };
    watchParams?: boolean;
}
declare function catI18nDirectiveFactory($log: ILogService, $rootScope: IRootScopeService, catI18nService: ICatI18nService, catI18nResponseHandler: ICatI18nResponseHandler): {
    restrict: string;
    scope: {
        key: string;
        params: string;
        watchParams: string;
    };
    link: IDirectiveLinkFn;
};

interface CatIconMapping {
    [icon: string]: string;
    create: string;
    edit: string;
    remove: string;
    save: string;
}
interface CatIconConfig {
    xsClass?: string;
    icons: CatIconMapping;
}
interface CatIconScope extends IScope {
    size?: string;
    iconClass: string;
    icon: string;
}
declare class CatIconController {
    constructor($scope: CatIconScope, catIconConfig: CatIconConfig);
}
declare function catIconDirectiveFactory(): {
    restrict: string;
    replace: boolean;
    template: string;
    scope: {
        icon: string;
        title: string;
        size: string;
    };
    controller: typeof CatIconController[];
};

interface CatInputGroupScope extends IScope {
    label: string;
    name: string;
    catI18nKey?: string;
}
declare function catInputGroupDirectiveFactory(catValidationService: any): IDirective;

interface CatInputAttributes extends IAttributes {
    id?: string;
}
declare function catInputDirectiveFactory(): IDirective;

interface CatLoadMoreParentScope extends IScope {
    elementsCount?: number;
    elements?: IAugmentedJQuery[];
}
interface CatLoadMoreScope extends IScope {
    $parent: CatLoadMoreParentScope;
}
interface CatLoadMoreAttributes extends IAttributes {
    catLoadMore: string;
}
declare function catLoadMoreDirectiveFactory(): IDirective;

interface CatMainMenuScope extends IScope {
    getMenus(): Menu[];
    isActive(path: string): boolean;
    isVisible(entry: IMenuEntry): boolean;
}
declare function catMainMenuDirectiveFactory($mainMenu: ICatMainMenuService, catElementVisibilityService: ICatElementVisibilityService, $location: ILocationService): IDirective;

interface CatMessagesDirectiveScope extends IScope {
    contextId?: string;
    type?: string;
    hasMessages(): boolean;
    getMessages(): string[];
}
declare class CatMessagesController {
    constructor($scope: CatMessagesDirectiveScope, catValidationService: ICatValidationService);
}
declare function catMessagesDirectiveFactory(): IDirective;

interface CatPaginatedScope<T> extends IScope {
    catPaginatedController: ICatPaginatedController;
    listData?: ICatListData<T>;
    syncLocation?: boolean;
    searchProps: string[];
    searchPropertyPlaceholders: {
        [property: string]: string;
    };
    paginationText: {
        previous: string;
        next: string;
        first: string;
        last: string;
    };
    $parent: ICatListScope<T> | ICatBaseDetailScope<any>;
}
interface CatPaginatedAttributes extends IAttributes {
    searchProps?: string;
}
interface ICatPaginatedController {
    sort(newVal: Sort, oldVal?: Sort): void;
    getSearch(): any;
    getSearchRequest(): SearchRequest;
}
declare class CatPaginatedController<T> implements ICatPaginatedController {
    private $scope;
    private $location;
    private $timeout;
    private $rootScope;
    private catListDataLoadingService;
    private catI18nService;
    private catSearchService;
    private searchTimeout;
    private searchRequest;
    private static DELAY_ON_SEARCH;
    private static PAGINATION_PREVIOUS_KEY;
    private static PAGINATION_NEXT_KEY;
    private static PAGINATION_FIRST_KEY;
    private static PAGINATION_LAST_KEY;
    constructor($scope: CatPaginatedScope<T>, $location: ILocationService, $timeout: ITimeoutService, $rootScope: IRootScopeService, catListDataLoadingService: ICatListDataLoadingService, catI18nService: ICatI18nService, catSearchService: ICatSearchService);
    private initScopeProperties();
    private registerScopeWatches();
    private registerScopeEventHandlers();
    private handlePaginationTextResponse(prop);
    private _loadPaginationTranslations();
    private reload(delay?, force?);
    private updateLocation();
    private searchChanged(value, delay);
    private updateSearch(newVal, oldVal);
    sort(newVal: Sort, oldVal?: Sort): void;
    getSearch(): {};
    getSearchRequest(): SearchRequest;
}
declare function catPaginatedDirectiveFactory(catI18nService: ICatI18nService): IDirective;

interface CatSelectOptions {
    endpoint: string | ICatApiEndpoint | Function;
    searchRequestAdapter?: Function | Object;
    size?: number;
    sort?: Sort;
    filter?(term: string): boolean;
    search?(term: string, page: number, context: any): any;
}
interface CatSelectScope<T> extends IScope {
    elements: T[];
    selectOptions: Select2Options;
    config?: string;
    options?: CatSelectOptions;
}
declare class CatSelectController {
    private $log;
    constructor($scope: CatSelectScope<any>, $log: ILogService, catApiService: ICatApiService, catSelectConfigService: ICatSelectConfigService);
    private fetchElements(endpoint, sort?, searchRequestAdapter?);
}
/**
 * @ngdoc directive
 * @name cat.directives.select:catSelect
 * @scope
 * @restrict EA
 *
 * @description
 * The 'cat-select' directive is a wrapper around the 'ui-select2' directive which adds support for using an api
 * endpoint provided by catApiService. There exist 2 supported ways of configuration:
 * - The 'config' attribute: This represents a named configuration which will be retrieved from the catSelectConfigService
 * - The 'options' attribute: Here the options object can directly be passed in
 *
 * The 2 different approaches exist to easily reuse certain options, as the named config is seen as 'default' and all
 * values which are provided via the options object will be overridden.
 *
 * An config / options object has the following properties:
 * - endpoint: This can either be an array, in which case it will directly be treated as the source, an endpoint name
 * or an endpoint object to call the given endpoint, or a function which is used as the 'transport' function
 * - sort: An object which defines the 'sort' property and direction used when retrieving the list from an endpoint
 * - ui-select2: An config object which supports all options provided by the 'ui-select2' directive
 *
 * TODO fix returns doc (not the correct format)
 * returns {{
 *      restrict: {string},
 *      replace: {boolean},
 *      priority: {number},
 *      scope: {
 *          options: {string},
 *          id: {string},
 *          config: {string}
 *      },
 *      link: {CatSelectLink},
 *      controller: {CatSelectController},
 *      template: {string}
 * }}
 * @constructor
 */
declare function catSelectDirectiveFactory(): IDirective;

interface CatSortableScope<T> extends CatPaginatedScope<T> {
    sort: Sort;
    toggleSort(property: string): void;
}
declare class CatSortableController<T> {
    constructor($scope: CatSortableScope<T>);
}
interface CatSortableAttributes extends IAttributes {
    catSortable?: string;
    catI18nKey?: string;
    sortMode?: string;
}
declare function catSortableDirectiveFactory($compile: ICompileService): IDirective;

interface ICatValidationGroupController {
    getContextId(): string;
}
declare class CatValidationGroupController implements ICatValidationGroupController {
    private contextId;
    constructor($scope: IScope, catValidationService: ICatValidationService);
    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    getContextId(): string;
}
declare function catValidationGroupDirectiveFactory(): IDirective;

import IDirectiveLinkFn = angular.IDirectiveLinkFn;
interface CatFormAttributes extends IAttributes {
    eocsWarnOnNavIfDirty?: string;
}
declare function catFormDirectiveFactory($timeout: ITimeoutService): {
    restrict: string;
    scope: boolean;
    require: string;
    link: IDirectiveLinkFn;
};

declare function catNumbersOnlyDirectiveFactory(): IDirective;

interface CatReplaceTextFilter {
    /**
     * @ngdoc filter
     * @name cat.filters.replaceText:replaceText
     *
     * @description
     * Replaces text passages with other text, based on regular expressions
     *
     * @param {string} text original text
     * @param {string} pattern regular expression
     * @param {object} options regular expression options
     * @param {string} replacement replacement text
     */
    (text?: string, pattern?: string, options?: string, replacement?: string): string | void;
}
declare function catReplaceTextFilterFactory(): CatReplaceTextFilter;



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

interface CatBreadcrumb {
    url?: string;
    title?: string;
    key?: string;
}
interface ICatBreadcrumbsService {
    clear(): void;
    set(bcs: CatBreadcrumb[]): any;
    get(): CatBreadcrumb[];
    addFirst(entry: CatBreadcrumb): void;
    removeFirst(): CatBreadcrumb;
    push(entry: CatBreadcrumb): void;
    pop(): CatBreadcrumb;
    length(): number;
    replaceLast(newVal: CatBreadcrumb): void;
    generateFromConfig(config: ICatBaseViewConfig): CatBreadcrumb[];
}
/**
 * @ngdoc service
 * @name cat.service.breadcrumbs:catBreadcrumbService
 * @service
 *
 * @description
 * This service is a simple wrapper around a list of Objects.
 * It provides some convenience methods for manipulating the list.
 * It's main purpose is to make breadcrumb handling less cumbersome.
 *
 * @constructor
 */
declare class CatBreadcrumbsService implements ICatBreadcrumbsService {
    private catBreadcrumbs;
    private $state;
    constructor(catBreadcrumbs: Array<CatBreadcrumb>, $state: IStateService);
    clear(): void;
    set(bcs: Array<CatBreadcrumb>): void;
    get(): CatBreadcrumb[];
    addFirst(entry: CatBreadcrumb): void;
    removeFirst(): CatBreadcrumb;
    push(entry: CatBreadcrumb): void;
    pop(): CatBreadcrumb;
    length(): number;
    replaceLast(newVal: CatBreadcrumb): void;
    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    generateFromConfig(config: ICatBaseViewConfig): CatBreadcrumb[];
}

interface CatConversionFunctions {
    toClient(serverData?: any, context?: any): any;
    toServer(clientData?: any, context?: any): any;
}
/**
 * @ngdoc service
 * @name cat.service.conversion:catConversionService
 * @module cat.service.conversion
 *
 * @description
 * This service handles the transformation between server and client side data.
 *
 * @constructor
 */
declare class CatConversionService {
    private catConversionFunctions;
    constructor(catConversionFunctions: CatConversionFunctions);
    toClient(serverData: any, context: any): any;
    toServer(clientData: any): any;
}
declare function _convertToClientModel(data: any, context: any): any;
declare function _convertToClientData(serverData: any, context: any): any;

interface ICatElementVisibilityService {
    /**
     * A helper function to determine wheter or not a ui element should be visible.
     *
     * @param {string} identifier an identifier upon which the the implementation can mofiy it's behaviour
     * @param data the data representing the element for which the visibility check is performed
     * @returns {boolean} <code>true</code> if the element should be rendered, <code>false</code> otherwise
     */
    isVisible(identifier: string, data?: any): boolean;
}
/**
 * @ngdoc service
 * @name cat.service.elementVisibility:catElementVisibilityService
 * @service
 *
 * @description
 * This service provides a entry point for handling the visibility of ui elements.
 * The basic implementation always returns true and is intended to be decorated accordingly within production environments.
 *
 * @constructor
 */
declare class CatElementVisibilityService implements ICatElementVisibilityService {
    isVisible(): boolean;
}

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

interface ICatI18nResponseHandler {
    handleTranslationSuccess(translation: string, scope: IScope, element: IAugmentedJQuery): void;
    handleTranslationError(reason: any, scope: IScope, element: IAugmentedJQuery): void;
}
declare class CatI18nResponseHandler implements ICatI18nResponseHandler {
    handleTranslationSuccess(translation: string, scope: IScope, element: IAugmentedJQuery): void;
    handleTranslationError(reason: any, scope: CatI18nScope, element: IAugmentedJQuery): void;
}

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

interface ICatListData<T> {
    search?: any;
    count: number;
    collection: T[];
    pagination: Pagination;
    firstResult: number;
    lastResult: number;
    facets?: Facet[];
    isSinglePageList: boolean;
    endpoint: ICatApiEndpoint;
    searchRequest: SearchRequest;
}
interface ICatListDataLoadingService {
    load<T>(endpoint: ICatApiEndpoint, searchRequest: SearchRequest): IPromise<ICatListData<T>>;
    resolve<T>(endpointName: string, defaultSort?: Sort): IPromise<ICatListData<T>>;
}
declare class CatListDataLoadingService implements ICatListDataLoadingService {
    private $location;
    private $q;
    private catApiService;
    private catSearchService;
    constructor($location: ILocationService, $q: IQService, catApiService: ICatApiService, catSearchService: ICatSearchService);
    load<T>(endpoint: ICatApiEndpoint, searchRequest: any): IPromise<ICatListData<T>>;
    /**
     *
     * @param {String} endpointName
     * @param {Object} [defaultSort={property:'name',isDesc:false}]
     */
    resolve<T>(endpointName: any, defaultSort?: Sort): IPromise<ICatListData<T>>;
}

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

/**
 * Created by Thomas on 08/03/2015.
 */
interface ICatUrlEncodingService {
    encodeAsUrl(params?: any): string;
}
declare class CatUrlEncodingService implements ICatUrlEncodingService {
    encodeAsUrl(params: any): string;
}
interface ICatSearchService {
    encodeAsUrl(searchRequest?: SearchRequest): string;
    updateLocation(searchRequest?: SearchRequest): void;
    fromLocation(): SearchRequest;
}
declare class CatSearchService implements ICatSearchService {
    private $location;
    private catUrlEncodingService;
    constructor($location: any, catUrlEncodingService: any);
    private static _encodeSort(_sort);
    private static _encodePagination(_pagination);
    private _encodeSearch(_search);
    private urlEndoded(searchRequest);
    private static _concatenate(result, next);
    /**
     * @ngdoc function
     * @name encodeAsUrl
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request to encode as url
     *
     * @description
     * This methods returns an url encoded version of the given search request
     */
    encodeAsUrl(searchRequest: any): any;
    /**
     * @ngdoc function
     * @name updateLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request from which to update the $location service
     *
     * @description
     * This methods updates the browsers address bar via the $location service to reflect the given SearchRequest
     */
    updateLocation(searchRequest: any): void;
    /**
     * @ngdoc function
     * @name fromLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @description
     * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
     */
    fromLocation(): any;
}

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

/**
 * Created by Mustafa on 05.08.2015.
 */
interface ICatUrlResolverService {
    getTabTemplate(tab: string, config: ICatDetailConfig): string;
}
declare class CatUrlResolverService implements ICatUrlResolverService {
    getTabTemplate(tab: string, config: ICatDetailConfig): string;
}

/**
 * Validation Context which holds all information about a validation context
 */
declare class ValidationContext {
    uuid: string;
    global: Array<string>;
    fieldErrors: Object;
    knownFields: Array<string>;
    /**
     * @param uuid context identifier
     */
    constructor(uuid?: string);
    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    registerField(name: string): void;
}
interface CatFieldError {
    field: string;
    message: string;
}
interface CatRejectionData {
    fieldErrors: Array<CatFieldError>;
    globalErrors: Array<string>;
}
interface ICatValidationService {
    getContext(contextId?: string): ValidationContext;
    createContext(): string;
    destroyContext(contextId: string): void;
    updateFromRejection(rejection: CatHttpPromiseCallbackArg<CatRejectionData>): void;
    clearValidationErrors(contextId?: string): void;
    hasGlobalErrors(contextId?: string): boolean;
    getGlobalErrors(contextId?: string): string[];
    hasFieldErrors(fieldName: string, contextId?: string): boolean;
    hasAnyFieldErrors(contextId?: string): boolean;
    getFieldErrors(fieldName: string, contextId?: string): CatFieldError[];
    hasErrors(contextId?: string): boolean;
    prepareConfig(contextId: string, config: any): any;
}
declare class CatValidationService implements ICatValidationService {
    private $log;
    private $globalMessages;
    private catValidations;
    private catValidationContexts;
    private catMessagesConfig;
    private catI18nService;
    constructor($log: ILogService, $globalMessages: CatMessageService, catValidations: ValidationContext, catValidationContexts: {
        [context: string]: ValidationContext;
    }, catMessagesConfig: CatMessagesConfig, catI18nService: ICatI18nService);
    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    getContext(contextId?: string): ValidationContext;
    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    createContext(): string;
    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    destroyContext(contextId: string): void;
    updateFromRejection(rejection: CatHttpPromiseCallbackArg<CatRejectionData>): void;
    clearValidationErrors(contextId: any): void;
    hasGlobalErrors(contextId: any): boolean;
    getGlobalErrors(contextId: any): string[];
    hasFieldErrors(fieldName: any, contextId: any): boolean;
    hasAnyFieldErrors(contextId: any): boolean;
    getFieldErrors(fieldName: any, contextId: any): any;
    hasErrors(contextId: any): boolean;
    prepareConfig(contextId: any, config: any): {};
}

/**
 * @author Thomas Scheinecker, Catalysts GmbH.
 */
interface ICatViewConfig {
    name?: string;
    parent?: string;
    viewData?: any;
    url?: string;
    templateUrl?: string;
    reloadOnSearch?: boolean;
    model?: new (any) => any;
    controller?: string;
}
interface ICatDetailViewConfig extends ICatViewConfig {
    endpoint?: string | {
        name: string;
        parents?: string[];
    };
    additionalViewTemplate?: boolean | string;
    additionalViewTemplateTabs?: ICatTab[];
}
interface ICatListViewConfig extends ICatViewConfig {
    endpoint?: string;
    searchProps?: any;
    listTemplateUrl?: string;
    defaultSort?: Sort;
}
interface ICatTemplateUrls {
    edit: string;
    view: string | {
        main: string;
        additional: string;
    };
}
interface ICatTab {
    name: string;
}
interface ICatBaseViewConfig {
    viewData: any;
    name: string;
    controller: string | Function | (string | Function)[];
    endpoint?: ICatApiEndpoint;
    parents?: any[];
}
interface ICatDetailConfig extends ICatBaseViewConfig {
    Model: {
        new (data?: any): any;
    };
    templateUrls: ICatTemplateUrls;
    tabs?: ICatTab[];
    detail?: any;
}
interface ICatListConfig extends ICatBaseViewConfig {
    listData?: ICatListData<any>;
    title: string;
    searchProps: any;
    listTemplateUrl: string;
}
interface ICatViewConfigService {
    getDetailData($stateParams: any, Model: any, endpoint: any): IPromise<any>;
    getDetailConfig(config: ICatDetailViewConfig, $stateParams: IStateParamsService): IPromise<ICatDetailConfig>;
    getListConfig(config: ICatListViewConfig): IPromise<ICatListConfig>;
}
declare class CatViewConfigService implements ICatViewConfigService {
    private $q;
    private catApiService;
    private catListDataLoadingService;
    constructor($q: IQService, catApiService: ICatApiService, catListDataLoadingService: ICatListDataLoadingService);
    private static toLowerCaseName(name);
    getDetailData($stateParams: any, Model: any, endpoint: any): any;
    private getEndpoint(endpointName, parentEndpointNames, $stateParams);
    private getParentInfo(endpoint);
    getDetailConfig(config: ICatDetailViewConfig, $stateParams: IStateParamsService): IPromise<{}>;
    private getListDataPromise(config, name);
    getListConfig(config: ICatListViewConfig): IPromise<{}>;
}

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

import IHttpProvider = angular.IHttpProvider;
declare class CatErrorHttpInterceptor implements IHttpInterceptor {
    private $q;
    private loadingService;
    private catValidationMessageHandler;
    constructor($q: IQService, loadingService: CatLoadingService, catValidationMessageHandler: CatValidationMessageHandler);
    request(config: IRequestConfig): IRequestConfig;
    requestError(rejection: any): IPromise<any>;
    response(success: any): any;
    responseError(rejection: any): IPromise<any>;
}
declare function catErrorHttpInterceptorFactory($q: IQService, loadingService: CatLoadingService, catValidationMessageHandler: CatValidationMessageHandler): CatErrorHttpInterceptor;

interface CatLoadingServiceOptions {
    timeout: number;
    animationDuration: number;
}
declare class CatLoadingService {
    private $rootScope;
    private $timeout;
    private usSpinnerService;
    private CAT_LOADING_SERVICE_DEFAULTS;
    private activeCount;
    private startTime;
    private startTimer;
    private stopTimer;
    constructor($rootScope: IRootScopeService, $timeout: ITimeoutService, usSpinnerService: any, CAT_LOADING_SERVICE_DEFAULTS: CatLoadingServiceOptions);
    start(): void;
    stop(): void;
}

interface IMainMenuProvider extends IServiceProvider {
    menu(moduleId: string, options: any): void;
    menuGroup(moduleId: string, groupId: string, options: any): void;
    menuEntry(moduleId: string, groupId: string, entryId: string, options: any): void;
}
interface IMenuEntry {
    completeId: string;
    getOptions(): any;
    isGroup(): boolean;
    isMenu(): boolean;
}
declare class MenuEntry implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    constructor(id: string, options: any, parent: MenuGroup | Menu);
    getOptions(): any;
    isGroup(): boolean;
    isMenu(): boolean;
}
declare class MenuGroup implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    private menuEntries;
    constructor(id: string, options: any, parent: IMenuEntry);
    addMenuEntry(menuEntryId: string, options: any): void;
    getOptions(): any;
    getEntries(): MenuEntry[];
    isGroup(): boolean;
    isMenu(): boolean;
    isSubMenu(): boolean;
}
declare class Menu implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    private menuEntries;
    private menuGroups;
    constructor(id: string, options: any);
    addMenuGroup(groupId: any, options: any): void;
    addMenuEntry(groupId: any, menuEntryId: any, options: any): void;
    getGroups(): Array<MenuGroup>;
    getEntries(groupId: any): MenuEntry[];
    getFlattened(): _.List<any> | _.RecursiveList<any>;
    isMenu(): boolean;
    isGroup(): boolean;
    getOptions(): any;
}
interface ICatMainMenuService {
    getMenus(): Menu[];
}
declare class MenuBar {
    private id;
    private options;
    private menus;
    constructor(id: string, options: any);
    addMenu(menuId: any, options: any): void;
    addMenuGroup(menuId: any, groupId: any, options: any): void;
    addMenuEntry(menuId: any, groupId: any, menuEntryId: any, options: any): void;
    getMenus(): Menu[];
    getOptions(): any;
}
/**
 * @ngdoc service
 * @name cat.service.menu:$mainMenu
 * @constructor
 */
declare class MainMenuProvider implements IMainMenuProvider {
    private mainMenu;
    menus: any[];
    private _groups;
    private _entries;
    menu(moduleId: any, options: any): void;
    menuGroup(moduleId: any, groupId: any, options: any): void;
    menuEntry(moduleId: any, groupId: any, entryId: any, options: any): void;
    $get(): MenuBar;
}

declare class Message {
    text: string;
    type: string;
    timeToLive: number;
    constructor(data?: any);
}
interface ICatMessagesService {
    getMessages(type?: string): Array<string>;
    hasMessages(type?: string): boolean;
    clearMessages(type?: string): void;
    clearDeadMessages(): void;
    addMessage(type: string, message: string, flash?: boolean): void;
    addMessages(type: string, messages: Array<string>): void;
    setMessages(type: string, messages: Array<string>): void;
    decreaseTimeToLive(): void;
}
/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
declare class CatMessageService implements ICatMessagesService {
    private messages;
    constructor($rootScope: any);
    getMessages(type?: string): Array<string>;
    hasMessages(type?: string): boolean;
    clearMessages(type?: string): void;
    clearDeadMessages(): void;
    addMessage(type: string, message: string, flash?: boolean): void;
    decreaseTimeToLive(): void;
    addMessages(type: string, messages: Array<string>): void;
    setMessages(type: string, messages: Array<string>): void;
}
/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
declare class CatValidationMessageHandler {
    private $globalMessages;
    private catValidationService;
    constructor($globalMessages: ICatMessagesService, catValidationService: ICatValidationService);
    handleRejectedResponse(rejection: any): void;
}

interface CatUtils {
    defaultListSearchProps?: string[];
    /**
     * Pluralizes a string
     * @param string
     * @returns {*}
     */
    pluralize(string: string): string;
    /**
     * Capitalizes a string (first letter to uppercase)
     * @param string
     * @returns {string}
     */
    capitalize(string: string): string;
    /**
     * Generates a new UUID
     *
     * @returns {string} uuid
     */
    generateUUID(): string;
    /**
     * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
     * @param name the name of the 'entity' for which the constructor has to be returned
     * @returns {Constructor}
     */
    defaultModelResolver(name: string): {
        new (data?: any): any;
    };
}
