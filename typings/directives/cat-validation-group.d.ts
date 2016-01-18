interface ICatValidationGroupController {
    getContextId(): string;
}
declare class CatValidationGroupController implements ICatValidationGroupController {
    private contextId;
    constructor($scope: IScope, catValidationService: ICatValidationService);
    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    getContextId(): string;
}
declare function catValidationGroupDirectiveFactory(): IDirective;
