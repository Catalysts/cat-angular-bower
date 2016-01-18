interface CatInputGroupScope extends IScope {
    label: string;
    name: string;
    catI18nKey?: string;
}
declare function catInputGroupDirectiveFactory(catValidationService: any): IDirective;
