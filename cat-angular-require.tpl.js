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
    '<tabset>\n' +
    '    <tab active="activeTab[tab.name]" select="selectTab(tab.name)" ng-repeat="tab in tabs">\n' +
    '        <tab-heading>\n' +
    '            <span ng-if="tab.icon" ng-class="\'glyphicon glyphicon-\'+tab.icon"></span> {{getTabName(tab.name)}}\n' +
    '        </tab-heading>\n' +
    '        <div ng-include="getTabTemplate(tab.name)" ng-controller="tabController"></div>\n' +
    '    </tab>\n' +
    '</tabset>\n' +
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
    '                    <span class="glyphicon glyphicon-trash"></span>\n' +
    '                    <span cat-i18n="cc.catalysts.general.delete">Delete</span>\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-xs btn-default" ng-click="edit()"\n' +
    '                        cat-element-visible="cat.base.edit" cat-element-data="config"\n' +
    '                        cat-activate-on-shortcut="alt+e"><span class="glyphicon glyphicon-edit"></span>\n' +
    '                    <span cat-i18n="cc.catalysts.general.edit">Edit</span>\n' +
    '                </button>\n' +
    '            </div>\n' +
    '            &nbsp;\n' +
    '            <a ui-sref="^.detail({id: \'new\'})" class="btn btn-xs btn-default"\n' +
    '               cat-element-visible="cat.base.new" cat-element-data="config">\n' +
    '                <span class="glyphicon glyphicon-plus"></span>\n' +
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
    '        <span class="glyphicon glyphicon-plus"></span> <span cat-i18n="cc.catalysts.general.new">New</span>\n' +
    '    </a>\n' +
    '</h2>\n' +
    '\n' +
    '<cat-paginated search-props="{{catBaseListController.searchProps}}">\n' +
    '    <ng-include src="catBaseListController.config.listTemplateUrl"></ng-include>\n' +
    '</cat-paginated>\n' +
    '');
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
  $templateCache.put('template/cat-input.tpl.html',
    '<label class="col-sm-2 control-label" for="{{name}}">{{label}}</label>\n' +
    '<div class="col-sm-10">\n' +
    '    <div ng-transclude class="cat-input"></div>\n' +
    '    <cat-field-errors errors="errors" name="{{name}}"></cat-field-errors>\n' +
    '</div>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-main-menu.tpl.html',
    '<ul class="nav navbar-nav">\n' +
    '    <li class="dropdown" ng-repeat="menu in getMenus()" dropdown="">\n' +
    '        <a href="" class="dropdown-toggle" ng-if="isVisible(menu)" dropdown-toggle="">\n' +
    '            <span cat-i18n="cc.catalysts.cat-menu.menu.{{menu.completeId}}">{{menu.getOptions().name}}</span> <b\n' +
    '                class="caret"></b>\n' +
    '        </a>\n' +
    '        <ul class="dropdown-menu" ng-if="isVisible(menu)">\n' +
    '            <li ng-repeat="entry in menu.getFlattened() track by entry.id" ng-if="isVisible(entry)"\n' +
    '                ng-class="{\'dropdown-header\': entry.isGroup()}"\n' +
    '                ng-switch data-on="entry.isGroup()">\n' +
    '                <a ng-href="#{{entry.getOptions().path}}" ng-switch-when="false">\n' +
    '                    <span cat-i18n="cc.catalysts.cat-menu.entry.{{entry.completeId}}">\n' +
    '                        {{entry.getOptions().name}}\n' +
    '                    </span> <span ng-if="entry.getOptions().keymap"\n' +
    '                                  class="text-muted">{{entry.getOptions().keymap}}</span>\n' +
    '                </a>\n' +
    '                <span ng-switch-default\n' +
    '                      cat-i18n="cc.catalysts.cat-menu.group.{{entry.completeId}}">\n' +
    '                    {{entry.getOptions().name}}\n' +
    '                </span>\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '    </li>\n' +
    '</ul>');
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
    '        <pagination total-items="listData.count" items-per-page="listData.pagination.size"\n' +
    '                    ng-model="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"\n' +
    '                    previous-text="{{paginationText.previous}}"\n' +
    '                    next-text="{{paginationText.next}}"\n' +
    '                    first-text="{{paginationText.first}}"\n' +
    '                    last-text="{{paginationText.last}}">\n' +
    '        </pagination>\n' +
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
    '        <pagination total-items="listData.count" items-per-page="listData.pagination.size"\n' +
    '                    ng-model="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"\n' +
    '                    previous-text="{{paginationText.previous}}"\n' +
    '                    next-text="{{paginationText.next}}"\n' +
    '                    first-text="{{paginationText.first}}"\n' +
    '                    last-text="{{paginationText.last}}">\n' +
    '        </pagination>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('cat.template').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/tabs/tabset.html',
    '<div class="row tabset">\n' +
    '    <!-- override angular-ui template -->\n' +
    '    <div class="col-sm-2">\n' +
    '        <ul class="nav nav-stacked nav-pills" ng-transclude></ul>\n' +
    '    </div>\n' +
    '    <div class="col-sm-10 tab-content">\n' +
    '        <div class="tab-pane" ng-repeat="tab in tabs" ng-class="{active: tab.active}"\n' +
    '             tab-content-transclude="tab"></div>\n' +
    '    </div>\n' +
    '</div>');
}]);

    return 'cat.template';
});
//# sourceMappingURL=cat-angular-require.tpl.js.map