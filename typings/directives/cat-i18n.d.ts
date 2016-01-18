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
