interface CatMessagesDirectiveScope extends IScope {
    contextId?: string;
    type?: string;
    hasMessages(): boolean;
    getMessages(): string[];
}
declare class CatMessagesController {
    constructor($scope: CatMessagesDirectiveScope, catValidationService: ICatValidationService);
}
declare function catMessagesDirectiveFactory(): IDirective;
