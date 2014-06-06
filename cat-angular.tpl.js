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
    '            <h4>{{facetName(facet)}}</h4>\n' +
    '            <ul class="nav">\n' +
    '                <li ng-repeat="term in facet.terms" ng-class="{\'active\': isActive(facet,term)}">\n' +
    '                    <span>\n' +
    '                        <a ng-if="!isActive(facet,term)" href="" ng-click="setActive(facet, term)">{{term.name}}</a>\n' +
    '                        <span ng-if="isActive(facet,term)">{{term.name}} <a href="" ng-click="remove(facet)"><span\n' +
    '                                class="glyphicon glyphicon-remove"></span></a></span>\n' +
    '                        <span class="text-muted">({{term.count}})</span>\n' +
    '                    </span>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '        </li>\n' +
    '    </ul>\n' +
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
    '            <input class="form-control" placeholder="Search by {{prop}}" ng-model="search[prop]"\n' +
    '                   cat-focus-on-shortcut="alt+f">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="row text-center" ng-if="!isSinglePageList && count !== 0">\n' +
    '        <pagination total-items="count" items-per-page="pagination.size" page="pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"></pagination>\n' +
    '    </div>\n' +
    '    <div class="row text-center">\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="count !== 0">\n' +
    '            {{count}} Einträge gefunden. Einträge {{firstResult}}-{{lastResult}}\n' +
    '        </div>\n' +
    '        <div class="alert alert-info" style="margin: 20px 0;" ng-if="count === 0">\n' +
    '            Keine Einträge gefunden\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="row" ng-transclude ng-show="count !== 0"></div>\n' +
    '    <div class="row text-center" ng-if="!isSinglePageList && count !== 0">\n' +
    '        <pagination total-items="count" items-per-page="pagination.size" page="pagination.page" max-size="10"\n' +
    '                    class="pagination-sm" boundary-links="true" rotate="false"></pagination>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();

})(window, document);
