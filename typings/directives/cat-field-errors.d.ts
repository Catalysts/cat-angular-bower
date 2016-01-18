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
