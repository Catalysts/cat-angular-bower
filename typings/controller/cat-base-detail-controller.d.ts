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
