interface CatBreadcrumbsConfig {
    homeState: string;
}
interface CatBreadcrumbsScope extends IScope {
    homeState: string;
    breadcrumbs: ICatBreadcrumbsService;
    showHome(): boolean;
}
declare function catBreadcrumbsDirectiveFactory(catBreadcrumbsConfig: CatBreadcrumbsConfig, catBreadcrumbs: ICatBreadcrumbsService): IDirective;
