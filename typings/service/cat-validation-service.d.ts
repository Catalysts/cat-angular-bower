/**
 * Validation Context which holds all information about a validation context
 */
declare class ValidationContext {
    uuid: string;
    global: Array<string>;
    fieldErrors: Object;
    knownFields: Array<string>;
    /**
     * @param uuid context identifier
     */
    constructor(uuid?: string);
    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    registerField(name: string): void;
}
interface CatFieldError {
    field: string;
    message: string;
}
interface CatRejectionData {
    fieldErrors: Array<CatFieldError>;
    globalErrors: Array<string>;
}
interface ICatValidationService {
    getContext(contextId?: string): ValidationContext;
    createContext(): string;
    destroyContext(contextId: string): void;
    updateFromRejection(rejection: CatHttpPromiseCallbackArg<CatRejectionData>): void;
    clearValidationErrors(contextId?: string): void;
    hasGlobalErrors(contextId?: string): boolean;
    getGlobalErrors(contextId?: string): string[];
    hasFieldErrors(fieldName: string, contextId?: string): boolean;
    hasAnyFieldErrors(contextId?: string): boolean;
    getFieldErrors(fieldName: string, contextId?: string): CatFieldError[];
    hasErrors(contextId?: string): boolean;
    prepareConfig(contextId: string, config: any): any;
}
declare class CatValidationService implements ICatValidationService {
    private $log;
    private $globalMessages;
    private catValidations;
    private catValidationContexts;
    private catMessagesConfig;
    private catI18nService;
    constructor($log: ILogService, $globalMessages: CatMessageService, catValidations: ValidationContext, catValidationContexts: {
        [context: string]: ValidationContext;
    }, catMessagesConfig: CatMessagesConfig, catI18nService: ICatI18nService);
    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    getContext(contextId?: string): ValidationContext;
    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    createContext(): string;
    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    destroyContext(contextId: string): void;
    updateFromRejection(rejection: CatHttpPromiseCallbackArg<CatRejectionData>): void;
    clearValidationErrors(contextId: any): void;
    hasGlobalErrors(contextId: any): boolean;
    getGlobalErrors(contextId: any): string[];
    hasFieldErrors(fieldName: any, contextId: any): boolean;
    hasAnyFieldErrors(contextId: any): boolean;
    getFieldErrors(fieldName: any, contextId: any): any;
    hasErrors(contextId: any): boolean;
    prepareConfig(contextId: any, config: any): {};
}
