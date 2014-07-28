/*
 * Copyright 2014 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(window, document, undefined) {
'use strict';
(function(module) {
try {
  module = angular.module('cat');
} catch (e) {
  module = angular.module('cat', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/base-detail.tpl.html',
    '<div ng-repeat="parent in uiStack" class="alert alert-info"><a ng-href="{{parent.url}}">\n' +
    '     {{parent.title}}\n' +
    '</a> </div>\n' +
    '\n' +
    '<div class="panel panel-default">\n' +
    '    <div class="panel-heading">\n' +
    '        <div class="pull-right edit-buttons" ng-if="!editDetail && !!editTemplate">\n' +
    '            <div class="btn-group">\n' +
    '                <button type="button" class="btn btn-xs btn-default" cat-confirm-click cat-on-confirm="remove()"><span\n' +
    '                        class="glyphicon glyphicon-trash"></span> Delete\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-xs btn-default" ng-click="edit()"\n' +
    '                        cat-activate-on-shortcut="alt+e"><span class="glyphicon glyphicon-edit"></span> Edit\n' +
    '                </button>\n' +
    '            </div>\n' +
    '            &nbsp;\n' +
    '            <a ng-href="#{{baseUrl}}/new" class="btn btn-xs btn-default" cat-activate-on-shortcut="alt+n"><span\n' +
    '                    class="glyphicon glyphicon-plus"></span> New</a>\n' +
    '        </div>\n' +
    '        <h5 ng-if="exists">{{title()}}</h5>\n' +
    '        <h5 ng-if="!exists">New</h5>\n' +
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
    '                cat-activate-on-shortcut="alt+esc"><span class="glyphicon glyphicon-remove"></span> Cancel\n' +
    '        </button>\n' +
    '        <button type="submit" class="btn btn-xs btn-primary" ng-click="save()"\n' +
    '                ng-disabled="form.$pristine"><span class="glyphicon glyphicon-floppy-disk"></span>\n' +
    '            Save\n' +
    '        </button>\n' +
    '    </div>\n' +
    '</div>\n' +
    '<div ng-if="!editDetail && !!additionalViewTemplate" ng-include="additionalViewTemplate"></div>');
}]);
})();

})(window, document);

(function(window, document, undefined) {
'use strict';
(function(module) {
try {
  module = angular.module('cat');
} catch (e) {
  module = angular.module('cat', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-facets.tpl.html',
    '<div class="sidebar">\n' +
    '    <ul class="nav sidenav">\n' +
    '        <li ng-repeat="facet in facets">\n' +
    '            <h4>{{facetName(facet)}}\n' +
    '                <small ng-if="!isActive(facet)">\n' +
    '                    <a ng-click="showAll(facet)" href="">See all</a>\n' +
    '                </small>\n' +
    '            </h4>\n' +
    '            <ul class="nav">\n' +
    '                <li ng-repeat="term in facet.terms" ng-class="{\'active\': isActive(facet,term)}" cat-load-more="5">\n' +
    '                    <a ng-if="showItem(facet,term)" href="" ng-click="setActive(facet,term)">{{term.name}}\n' +
    '                        <span class="text-muted">({{term.count}})</span>\n' +
    '                    </a>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '        </li>\n' +
    '    </ul>\n' +
    '\n' +
    '</div>');
}]);
})();

})(window, document);

(function(window, document, undefined) {
'use strict';
(function(module) {
try {
  module = angular.module('cat');
} catch (e) {
  module = angular.module('cat', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-input.tpl.html',
    '<label class="col-sm-2 control-label" for="{{name}}">{{label}}</label>\n' +
    '<div class="col-sm-10">\n' +
    '    <div ng-transclude class="cat-input"></div>\n' +
    '    <cat-field-errors errors="errors" name="{{name}}"></cat-field-errors>\n' +
    '</div>\n' +
    '');
}]);
})();

})(window, document);

(function(window, document, undefined) {
'use strict';
(function(module) {
try {
  module = angular.module('cat');
} catch (e) {
  module = angular.module('cat', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-main-menu.tpl.html',
    '<ul class="nav navbar-nav">\n' +
    '    <li class="dropdown" ng-repeat="menu in menus">\n' +
    '        <a href="" class="dropdown-toggle" data-toggle="dropdown" ng-if="isVisible(menu)">{{menu.getOptions().name}}<b\n' +
    '                class="caret"></b></a>\n' +
    '        <ul class="dropdown-menu" ng-if="isVisible(menu)">\n' +
    '            <li ng-repeat="entry in menu.getFlattened() track by entry.id" ng-if="isVisible(entry)"\n' +
    '                ng-class="{\'dropdown-header\': entry.isGroup()}"\n' +
    '                ng-switch data-on="entry.isGroup()">\n' +
    '                <a ng-href="#{{entry.getOptions().path}}" ng-switch-when="false">\n' +
    '                    {{entry.getOptions().name}} <span ng-if="entry.getOptions().keymap" class="text-muted">{{entry.getOptions().keymap}}</span>\n' +
    '                </a>\n' +
    '                <span ng-switch-default>{{entry.getOptions().name}}</span>\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '    </li>\n' +
    '</ul>');
}]);
})();

})(window, document);

(function(window, document, undefined) {
'use strict';
(function(module) {
try {
  module = angular.module('cat');
} catch (e) {
  module = angular.module('cat', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/cat-paginated.tpl.html',
    '<div ng-cloak>\n' +
    '    <div ng-if="searchProps" class="row search">\n' +
    '        <div class="col-sm-3 pull-right" ng-repeat="prop in searchProps">\n' +
    '            <input class="form-control" placeholder="Search by {{prop}}" ng-model="listData.search[prop]">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="row text-center" ng-if="!listData.isSinglePageList && listData.count !== 0">\n' +
    '        <pagination total-items="listData.count" items-per-page="listData.pagination.size"\n' +
    '                    page="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"></pagination>\n' +
    '    </div>\n' +
    '    <div class="row text-center">\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="listData.count !== 0">\n' +
    '            {{listData.count}} Einträge gefunden. Einträge {{listData.firstResult}}-{{listData.lastResult}}\n' +
    '        </div>\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="listData.count === 0">\n' +
    '        Keine Einträge gefunden\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="row" ng-transclude ng-show="listData.count !== 0"></div>\n' +
    '    <div class="row text-center" ng-if="!listData.isSinglePageList && istData.count !== 0">\n' +
    '    <pagination total-items="listData.count" items-per-page="listData.pagination.size" page="listData.pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"></pagination>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();

})(window, document);
