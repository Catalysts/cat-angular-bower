interface IMainMenuProvider extends IServiceProvider {
    menu(moduleId: string, options: any): void;
    menuGroup(moduleId: string, groupId: string, options: any): void;
    menuEntry(moduleId: string, groupId: string, entryId: string, options: any): void;
}
interface IMenuEntry {
    completeId: string;
    getOptions(): any;
    isGroup(): boolean;
    isMenu(): boolean;
}
declare class MenuEntry implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    constructor(id: string, options: any, parent: MenuGroup | Menu);
    getOptions(): any;
    isGroup(): boolean;
    isMenu(): boolean;
}
declare class MenuGroup implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    private menuEntries;
    constructor(id: string, options: any, parent: IMenuEntry);
    addMenuEntry(menuEntryId: string, options: any): void;
    getOptions(): any;
    getEntries(): MenuEntry[];
    isGroup(): boolean;
    isMenu(): boolean;
    isSubMenu(): boolean;
}
declare class Menu implements IMenuEntry {
    private id;
    private options;
    completeId: string;
    private menuEntries;
    private menuGroups;
    constructor(id: string, options: any);
    addMenuGroup(groupId: any, options: any): void;
    addMenuEntry(groupId: any, menuEntryId: any, options: any): void;
    getGroups(): Array<MenuGroup>;
    getEntries(groupId: any): MenuEntry[];
    getFlattened(): _.List<any> | _.RecursiveList<any>;
    isMenu(): boolean;
    isGroup(): boolean;
    getOptions(): any;
}
interface ICatMainMenuService {
    getMenus(): Menu[];
}
declare class MenuBar {
    private id;
    private options;
    private menus;
    constructor(id: string, options: any);
    addMenu(menuId: any, options: any): void;
    addMenuGroup(menuId: any, groupId: any, options: any): void;
    addMenuEntry(menuId: any, groupId: any, menuEntryId: any, options: any): void;
    getMenus(): Menu[];
    getOptions(): any;
}
/**
 * @ngdoc service
 * @name cat.service.menu:$mainMenu
 * @constructor
 */
declare class MainMenuProvider implements IMainMenuProvider {
    private mainMenu;
    menus: any[];
    private _groups;
    private _entries;
    menu(moduleId: any, options: any): void;
    menuGroup(moduleId: any, groupId: any, options: any): void;
    menuEntry(moduleId: any, groupId: any, entryId: any, options: any): void;
    $get(): MenuBar;
}
