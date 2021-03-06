/*!
 Copyright 2014-2015 the original author or authors.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
define(['angular', 'angular-ui-bootstrap'], function(angular) {
    'use strict';

    angular.module('cat.template', ['ui.bootstrap.tpls']);
angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-base-additional-details-tabs-view.tpl.html',
    '<uib-tabset vertical="true" type="pills">\n' +
    '    <uib-tab active="activeTab[tab.name]" select="selectTab(tab.name)" ng-repeat="tab in tabs">\n' +
    '        <uib-tab-heading>\n' +
    '            <span ng-if="tab.icon" ng-class="\'glyphicon glyphicon-\'+tab.icon"></span> <span\n' +
    '                cat-i18n="{{getTabKey(tab.name)}}">{{getTabName(tab.name)}}</span>\n' +
    '        </uib-tab-heading>\n' +
    '        <div ng-include="getTabTemplate(tab.name)" ng-controller="tabController"></div>\n' +
    '    </uib-tab>\n' +
    '</uib-tabset>\n' +
    '\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-base-detail.tpl.html',
    '<div ng-repeat="parent in uiStack" class="alert alert-info"><a ng-href="{{parent.url}}">\n' +
    '    {{parent.title}}\n' +
    '</a></div>\n' +
    '\n' +
    '<div class="panel panel-default">\n' +
    '    <div class="panel-heading">\n' +
    '        <div class="pull-right edit-buttons" ng-if="!editDetail && !!editTemplate">\n' +
    '            <div class="btn-group">\n' +
    '                <button type="button" class="btn btn-xs btn-default" cat-confirm-click cat-on-confirm="remove()"\n' +
    '                        cat-element-visible="cat.base.delete" cat-element-data="config">\n' +
    '                    <span cat-icon="remove" size="xs"></span>\n' +
    '                    <span cat-i18n="cc.catalysts.general.delete">Delete</span>\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-xs btn-default" cat-confirm-click cat-on-confirm="copy()"\n' +
    '                        cat-element-visible="cat.base.copy" cat-element-data="config">\n' +
    '                    <span class="glyphicon glyphicon-duplicate"></span>\n' +
    '                    <span cat-i18n="cc.catalysts.general.copy">Copy</span>\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-xs btn-default" ng-click="edit()"\n' +
    '                        cat-element-visible="cat.base.edit" cat-element-data="config"\n' +
    '                        cat-activate-on-shortcut="alt+e"><span cat-icon="edit" size="xs"></span>\n' +
    '                    <span cat-i18n="cc.catalysts.general.edit">Edit</span>\n' +
    '                </button>\n' +
    '            </div>\n' +
    '            &nbsp;\n' +
    '            <a ui-sref="^.detail({id: \'new\'})" class="btn btn-xs btn-default"\n' +
    '               cat-element-visible="cat.base.new" cat-element-data="config">\n' +
    '                <span cat-icon="create" size="xs"></span>\n' +
    '                <span cat-i18n="cc.catalysts.general.new">New</span></a>\n' +
    '        </div>\n' +
    '        <h5 ng-if="exists">{{title()}}</h5>\n' +
    '        <h5 ng-if="!exists" cat-i18n="cc.catalysts.general.new">New</h5>\n' +
    '    </div>\n' +
    '    <!-- create form element if editing -->\n' +
    '    <div class="panel-body">\n' +
    '        <form name="form" novalidate class="form-horizontal"\n' +
    '              ng-if="!!editDetail && !!editTemplate">\n' +
    '            <div ng-include="editTemplate"></div>\n' +
    '        </form>\n' +
    '\n' +
    '        <div ng-include="mainViewTemplate" ng-if="!editDetail"></div>\n' +
    '    </div>\n' +
    '    <div class="panel-footer text-right" ng-if="!!editDetail">\n' +
    '        <button type="button" class="btn btn-xs btn-default" ng-click="cancelEdit()"\n' +
    '                cat-activate-on-shortcut="alt+esc"><span class="glyphicon glyphicon-remove"></span>\n' +
    '            <span cat-i18n="cc.catalysts.general.cancel">Cancel</span>\n' +
    '        </button>\n' +
    '        <button type="submit" class="btn btn-xs btn-primary" ng-click="save()"\n' +
    '                ng-disabled="form.$pristine"><span class="glyphicon glyphicon-floppy-disk"></span>\n' +
    '            <span cat-i18n="cc.catalysts.general.save">Save</span>\n' +
    '        </button>\n' +
    '    </div>\n' +
    '</div>\n' +
    '<div ng-if="!editDetail && !!additionalViewTemplate" ng-include="additionalViewTemplate"\n' +
    '     ng-controller="baseTabsController"></div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-base-list.tpl.html',
    '<h2>\n' +
    '    <span cat-i18n="{{catBaseListController.titleKey}}">{{catBaseListController.title}}</span>\n' +
    '    <a class="btn btn-primary pull-right" ui-sref="{{catBaseListController.config.name}}.detail({id: \'new\'})"\n' +
    '            cat-element-visible="cat.base.new" cat-element-data="catBaseListController.config">\n' +
    '        <span cat-icon="create"></span> <span cat-i18n="cc.catalysts.general.new">New</span>\n' +
    '    </a>\n' +
    '</h2>\n' +
    '\n' +
    '<cat-paginated search-props="{{catBaseListController.searchProps}}">\n' +
    '    <ng-include src="catBaseListController.config.listTemplateUrl"></ng-include>\n' +
    '</cat-paginated>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-breadcrumbs.tpl.html',
    '<ol class="breadcrumb">\n' +
    '    <li ng-if="showHome()"><a ui-sref="{{homeState}}" cat-i18n="cc.catalysts.cat-breadcrumbs.entry.home">Home</a></li>\n' +
    '    <li ng-class="{\'active\':$last}" ng-repeat="bc in breadcrumbs">\n' +
    '        <a ng-if="!$last" ng-href="{{bc.url}}" cat-i18n="{{bc.key}}">{{bc.title}}</a>\n' +
    '        <span ng-if="$last" cat-i18n="{{bc.key}}">{{bc.title}}</span>\n' +
    '    </li>\n' +
    '</ol>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-facets.tpl.html',
    '<div>\n' +
    '    <ul class="nav">\n' +
    '        <li ng-repeat="facet in listData.facets" ng-if="listData.facets" ng-init="initFacets()">\n' +
    '            <label cat-i18n="{{\'cc.catalysts.cat-facets.facet.\'+facet.name}}" i18n-params="{facet: facet}">{{facetName(facet)}}</label>\n' +
    '            <select class="form-control" ui-select2="facetSelectOptions" ng-model="facets[facet.name]"\n' +
    '                    ng-change="facetChanged(facet)">\n' +
    '                <option></option>\n' +
    '                <option ng-repeat="term in facet.terms" value="{{term.id}}">{{term.name}} ({{term.count}})\n' +
    '                </option>\n' +
    '            </select>\n' +
    '            <br>\n' +
    '        </li>\n' +
    '    </ul>\n' +
    '</div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-field-errors-info.tpl.html',
    '<div class="alert alert-danger" ng-show="catFieldErrorsInfo.hasErrors()">\n' +
    '    <div cat-i18n="cc.catalysts.cat-field-errors-info.text"></div>\n' +
    '</div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-field-errors.tpl.html',
    '<div class="label label-danger" ng-show="catFieldErrors.hasErrors()">\n' +
    '    <ul>\n' +
    '        <li ng-repeat="error in catFieldErrors.getErrors()">{{error}}</li>\n' +
    '    </ul>\n' +
    '</div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-global-errors.tpl.html',
    '<div class="alert alert-danger" ng-show="catGlobalErrors.hasErrors()">\n' +
    '    <ul ng-class="catGlobalErrors.getErrors().length === 1 ? \'list-unstyled unstyled\' : \'\'">\n' +
    '        <li ng-repeat="error in catGlobalErrors.getErrors()">{{error}}</li>\n' +
    '    </ul>\n' +
    '</div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-input.tpl.html',
    '<label class="col-sm-2 control-label" for="{{name}}" cat-i18n="{{catI18nKey}}">{{label}}</label>\n' +
    '<div class="col-sm-10">\n' +
    '    <div ng-transclude class="cat-input"></div>\n' +
    '    <cat-field-errors name="{{name}}"></cat-field-errors>\n' +
    '</div>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-main-menu.tpl.html',
    '<ul class="nav navbar-nav">\n' +
    '    <li class="dropdown" ng-repeat="menu in getMenus()" uib-dropdown="">\n' +
    '        <a href="" class="dropdown-toggle" ng-if="isVisible(menu)" uib-dropdown-toggle="">\n' +
    '            <span cat-i18n="cc.catalysts.cat-menu.menu.{{menu.completeId}}">{{menu.getOptions().name}}</span>\n' +
    '            <b class="caret"></b>\n' +
    '        </a>\n' +
    '        <ul class="dropdown-menu" uib-dropdown-menu="" ng-if="isVisible(menu)">\n' +
    '            <li ng-repeat="entry in menu.getFlattened() track by entry.id" ng-if="isVisible(entry)"\n' +
    '                ng-class="{\'dropdown-header\': entry.isGroup() && !entry.isSubMenu(), \'dropdown dropdown-submenu\' : entry.isSubMenu()}">\n' +
    '                <a ng-if="!entry.isGroup()" ng-href="#{{entry.getOptions().path}}">\n' +
    '                    <span cat-i18n="cc.catalysts.cat-menu.entry.{{entry.completeId}}">{{entry.getOptions().name}}</span>\n' +
    '                    <span ng-if="entry.getOptions().keymap" class="text-muted">{{entry.getOptions().keymap}}</span>\n' +
    '                </a>\n' +
    '                <span ng-if="entry.isGroup() && !entry.isSubMenu()"\n' +
    '                      cat-i18n="cc.catalysts.cat-menu.group.{{entry.completeId}}">\n' +
    '                    {{entry.getOptions().name}}\n' +
    '                </span>\n' +
    '                <a ng-if="isVisible(entry) && entry.isGroup() && entry.isSubMenu()" href="" class="dropdown-toggle"\n' +
    '                   data-toggle="dropdown">\n' +
    '                    <span cat-i18n="cc.catalysts.cat-menu.group.{{entry.completeId}}">{{entry.getOptions().name}}</span>\n' +
    '                    <ul ng-if="isVisible(entry) && entry.isGroup() && entry.isSubMenu()" class="dropdown-menu" uib-dropdown-menu="">\n' +
    '                        <li ng-repeat="entry in entry.subEntries track by entry.id" ng-if="isVisible(entry)">\n' +
    '                            <a ng-href="#{{entry.getOptions().path}}" ng-if="!entry.isGroup()">\n' +
    '                                <span cat-i18n="cc.catalysts.cat-menu.entry.{{entry.completeId}}">\n' +
    '                                    {{entry.getOptions().name}}\n' +
    '                                </span>\n' +
    '                            </a>\n' +
    '                        </li>\n' +
    '                    </ul>\n' +
    '                </a>\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '    </li>\n' +
    '</ul>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-messages.tpl.html',
    '<div class="global-messages">\n' +
    '    <div class="alert alert-success" ng-if="type === \'success\' && hasMessages()">\n' +
    '        <ul>\n' +
    '            <li ng-repeat="message in getMessages()">{{message}}</li>\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <div class="alert alert-danger" ng-if="type === \'error\' && hasMessages()">\n' +
    '        <ul>\n' +
    '            <li ng-repeat="message in getMessages()">{{message}}</li>\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <div class="alert alert-info" ng-if="type === \'info\' && hasMessages()">\n' +
    '        <ul>\n' +
    '            <li ng-repeat="message in getMessages()">{{message}}</li>\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <div class="alert alert-warning" ng-if="type === \'warning\' && hasMessages()">\n' +
    '        <ul>\n' +
    '            <li ng-repeat="message in getMessages()">{{message}}></li>\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-paginated.tpl.html',
    '<div ng-cloak>\n' +
    '    <div ng-if="searchProps" class="row search">\n' +
    '        <div class="col-sm-3 pull-right" ng-repeat="prop in searchProps">\n' +
    '            <input class="form-control" placeholder="{{searchPropertyPlaceholders[prop]}}"\n' +
    '                   ng-model="listData.search[prop]">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="text-center" ng-if="!listData.isSinglePageList && listData.count !== 0">\n' +
    '        <uib-pagination total-items="listData.count" items-per-page="listData.pagination.size"\n' +
    '                    ng-model="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"\n' +
    '                    previous-text="{{paginationText.previous}}"\n' +
    '                    next-text="{{paginationText.next}}"\n' +
    '                    first-text="{{paginationText.first}}"\n' +
    '                    last-text="{{paginationText.last}}">\n' +
    '        </uib-pagination>\n' +
    '    </div>\n' +
    '    <div class="text-center">\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="listData.count !== 0"\n' +
    '             cat-i18n="cc.catalysts.cat-paginated.itemsFound" i18n-watch-params="true"\n' +
    '             i18n-params="{count: listData.count, firstResult: listData.firstResult, lastResult:listData.lastResult}">\n' +
    '            {{listData.count}} Einträge gefunden. Einträge {{listData.firstResult}}-{{listData.lastResult}}\n' +
    '        </div>\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="listData.count === 0">\n' +
    '            <span cat-i18n="cc.catalysts.cat-paginated.noItemsFound">Keine Einträge gefunden</span>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div ng-transclude></div>\n' +
    '    <div class="text-center" ng-if="!listData.isSinglePageList && listData.count !== 0">\n' +
    '        <uib-pagination total-items="listData.count" items-per-page="listData.pagination.size"\n' +
    '                    ng-model="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"\n' +
    '                    previous-text="{{paginationText.previous}}"\n' +
    '                    next-text="{{paginationText.next}}"\n' +
    '                    first-text="{{paginationText.first}}"\n' +
    '                    last-text="{{paginationText.last}}">\n' +
    '        </uib-pagination>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('uib/template/tabs/tabset.html',
    '<div class="row">\n' +
    '    <!-- override angular-ui template -->\n' +
    '    <div class="col-sm-2">\n' +
    '        <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n' +
    '    </div>\n' +
    '    <div class="col-sm-10 tab-content">\n' +
    '        <div class="tab-pane"\n' +
    '             ng-repeat="tab in tabs"\n' +
    '             ng-class="{active: tab.active}"\n' +
    '             uib-tab-content-transclude="tab">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);

    return 'cat.template';
});
//# sourceMappingURL=cat-angular-require.tpl.js.map
