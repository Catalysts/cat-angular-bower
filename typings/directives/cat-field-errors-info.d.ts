declare class CatFieldErrorsInfoController {
    private catValidationService;
    contextId: string;
    constructor(catValidationService: any);
    hasErrors(): any;
}
declare function catFieldErrorsInfoDirectiveFactory(): IDirective;
