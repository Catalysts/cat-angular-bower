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
