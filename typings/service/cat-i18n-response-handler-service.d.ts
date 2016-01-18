interface ICatI18nResponseHandler {
    handleTranslationSuccess(translation: string, scope: IScope, element: IAugmentedJQuery): void;
    handleTranslationError(reason: any, scope: IScope, element: IAugmentedJQuery): void;
}
declare class CatI18nResponseHandler implements ICatI18nResponseHandler {
    handleTranslationSuccess(translation: string, scope: IScope, element: IAugmentedJQuery): void;
    handleTranslationError(reason: any, scope: CatI18nScope, element: IAugmentedJQuery): void;
}
