declare class CatGlobalErrorsController {
    private catValidationService;
    contextId: string;
    constructor(catValidationService: ICatValidationService);
    hasErrors(): boolean;
    getErrors(): string[];
}
declare function catGlobalErrorsDirectiveFactory(): IDirective;
