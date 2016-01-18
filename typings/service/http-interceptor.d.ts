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
