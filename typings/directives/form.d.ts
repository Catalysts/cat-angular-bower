import IDirectiveLinkFn = angular.IDirectiveLinkFn;
interface CatFormAttributes extends IAttributes {
    eocsWarnOnNavIfDirty?: string;
}
declare function catFormDirectiveFactory($timeout: ITimeoutService): {
    restrict: string;
    scope: boolean;
    require: string;
    link: IDirectiveLinkFn;
};
