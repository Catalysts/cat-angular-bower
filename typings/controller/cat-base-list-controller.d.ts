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
