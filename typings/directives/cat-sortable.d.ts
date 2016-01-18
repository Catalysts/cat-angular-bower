interface CatSortableScope<T> extends CatPaginatedScope<T> {
    sort: Sort;
    toggleSort(property: string): void;
}
declare class CatSortableController<T> {
    constructor($scope: CatSortableScope<T>);
}
interface CatSortableAttributes extends IAttributes {
    catSortable?: string;
    catI18nKey?: string;
    sortMode?: string;
}
declare function catSortableDirectiveFactory($compile: ICompileService): IDirective;
