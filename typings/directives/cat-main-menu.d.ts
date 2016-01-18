interface CatMainMenuScope extends IScope {
    getMenus(): Menu[];
    isActive(path: string): boolean;
    isVisible(entry: IMenuEntry): boolean;
}
declare function catMainMenuDirectiveFactory($mainMenu: ICatMainMenuService, catElementVisibilityService: ICatElementVisibilityService, $location: ILocationService): IDirective;
