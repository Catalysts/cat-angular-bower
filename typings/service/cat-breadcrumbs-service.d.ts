interface CatBreadcrumb {
    url?: string;
    title?: string;
    key?: string;
}
interface ICatBreadcrumbsService {
    clear(): void;
    set(bcs: CatBreadcrumb[]): any;
    get(): CatBreadcrumb[];
    addFirst(entry: CatBreadcrumb): void;
    removeFirst(): CatBreadcrumb;
    push(entry: CatBreadcrumb): void;
    pop(): CatBreadcrumb;
    length(): number;
    replaceLast(newVal: CatBreadcrumb): void;
    generateFromConfig(config: ICatBaseViewConfig): CatBreadcrumb[];
}
/**
 * @ngdoc service
 * @name cat.service.breadcrumbs:catBreadcrumbService
 * @service
 *
 * @description
 * This service is a simple wrapper around a list of Objects.
 * It provides some convenience methods for manipulating the list.
 * It's main purpose is to make breadcrumb handling less cumbersome.
 *
 * @constructor
 */
declare class CatBreadcrumbsService implements ICatBreadcrumbsService {
    private catBreadcrumbs;
    private $state;
    constructor(catBreadcrumbs: Array<CatBreadcrumb>, $state: IStateService);
    clear(): void;
    set(bcs: Array<CatBreadcrumb>): void;
    get(): CatBreadcrumb[];
    addFirst(entry: CatBreadcrumb): void;
    removeFirst(): CatBreadcrumb;
    push(entry: CatBreadcrumb): void;
    pop(): CatBreadcrumb;
    length(): number;
    replaceLast(newVal: CatBreadcrumb): void;
    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    generateFromConfig(config: ICatBaseViewConfig): CatBreadcrumb[];
}
