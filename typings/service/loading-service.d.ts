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
