interface CatFacetsScope<T> extends IScope {
    catPaginatedController: ICatPaginatedController;
    facetSelectOptions: Select2Options;
    listData: ICatListData<T>;
    names?: {
        [facetName: string]: string;
    };
    facets?: {
        [facetName: string]: any;
    };
    facetChanged(facet: Facet): void;
    facetName(facet: Facet): string;
    initFacets(): void;
    isActive(facet: Facet): boolean;
}
declare class CatFacetsController<T> {
    constructor($scope: CatFacetsScope<T>);
}
declare function catFacetsDirectiveFactory(): {
    replace: boolean;
    restrict: string;
    scope: {
        listData: string;
        names: string;
    };
    require: string;
    templateUrl: string;
    link: IDirectiveLinkFn;
    controller: (string | typeof CatFacetsController)[];
};
