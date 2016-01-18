interface CatLoadMoreParentScope extends IScope {
    elementsCount?: number;
    elements?: IAugmentedJQuery[];
}
interface CatLoadMoreScope extends IScope {
    $parent: CatLoadMoreParentScope;
}
interface CatLoadMoreAttributes extends IAttributes {
    catLoadMore: string;
}
declare function catLoadMoreDirectiveFactory(): IDirective;
