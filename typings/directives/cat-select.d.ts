interface CatSelectOptions {
    endpoint: string | ICatApiEndpoint | Function;
    searchRequestAdapter?: Function | Object;
    size?: number;
    sort?: Sort;
    filter?(term: string): boolean;
    search?(term: string, page: number, context: any): any;
}
interface CatSelectScope<T> extends IScope {
    elements: T[];
    selectOptions: Select2Options;
    config?: string;
    options?: CatSelectOptions;
}
declare class CatSelectController {
    private $log;
    constructor($scope: CatSelectScope<any>, $log: ILogService, catApiService: ICatApiService, catSelectConfigService: ICatSelectConfigService);
    private fetchElements(endpoint, sort?, searchRequestAdapter?);
}
/**
 * @ngdoc directive
 * @name cat.directives.select:catSelect
 * @scope
 * @restrict EA
 *
 * @description
 * The 'cat-select' directive is a wrapper around the 'ui-select2' directive which adds support for using an api
 * endpoint provided by catApiService. There exist 2 supported ways of configuration:
 * - The 'config' attribute: This represents a named configuration which will be retrieved from the catSelectConfigService
 * - The 'options' attribute: Here the options object can directly be passed in
 *
 * The 2 different approaches exist to easily reuse certain options, as the named config is seen as 'default' and all
 * values which are provided via the options object will be overridden.
 *
 * An config / options object has the following properties:
 * - endpoint: This can either be an array, in which case it will directly be treated as the source, an endpoint name
 * or an endpoint object to call the given endpoint, or a function which is used as the 'transport' function
 * - sort: An object which defines the 'sort' property and direction used when retrieving the list from an endpoint
 * - ui-select2: An config object which supports all options provided by the 'ui-select2' directive
 *
 * TODO fix returns doc (not the correct format)
 * returns {{
 *      restrict: {string},
 *      replace: {boolean},
 *      priority: {number},
 *      scope: {
 *          options: {string},
 *          id: {string},
 *          config: {string}
 *      },
 *      link: {CatSelectLink},
 *      controller: {CatSelectController},
 *      template: {string}
 * }}
 * @constructor
 */
declare function catSelectDirectiveFactory(): IDirective;
