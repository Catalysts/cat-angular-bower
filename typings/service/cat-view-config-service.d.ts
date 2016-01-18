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
