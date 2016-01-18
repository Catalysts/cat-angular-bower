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
