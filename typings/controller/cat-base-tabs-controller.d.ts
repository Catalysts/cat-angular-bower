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
