interface CatIconMapping {
    [icon: string]: string;
    create: string;
    edit: string;
    remove: string;
    save: string;
}
interface CatIconConfig {
    xsClass?: string;
    icons: CatIconMapping;
}
interface CatIconScope extends IScope {
    size?: string;
    iconClass: string;
    icon: string;
}
declare class CatIconController {
    constructor($scope: CatIconScope, catIconConfig: CatIconConfig);
}
declare function catIconDirectiveFactory(): {
    restrict: string;
    replace: boolean;
    template: string;
    scope: {
        icon: string;
        title: string;
        size: string;
    };
    controller: typeof CatIconController[];
};
