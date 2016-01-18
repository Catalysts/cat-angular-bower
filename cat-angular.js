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
(function ($, _, angular) {
    'use strict';
    window.cat = window.cat || {};
angular.module('cat.filters', ['cat.filters.replaceText']);
angular.module('cat.service', [
    'cat.service.conversion',
    'cat.service.api',
    'cat.service.breadcrumbs',
    'cat.service.elementVisibility',
    'cat.service.i18n',
    'cat.service.listDataLoading',
    'cat.service.route',
    'cat.service.selectConfig',
    'cat.service.view',
    'cat.service.loading',
    'cat.service.httpIntercept',
    'cat.service.menu',
    'cat.service.message',
    'cat.service.search'
]);
angular.module('cat.controller', ['cat.controller.base.detail', 'cat.controller.base.list']);
angular.module('cat.directives', [
    'cat.directives.autofocus',
    'cat.directives.checkbox',
    'cat.directives.confirmClick',
    'cat.directives.elementVisible',
    'cat.directives.fieldErrors',
    'cat.directives.fieldErrors.info',
    'cat.directives.globalErrors',
    'cat.directives.input',
    'cat.directives.inputGroup',
    'cat.directives.loadMore',
    'cat.directives.menu',
    'cat.directives.select',
    'cat.directives.i18n',
    'cat.directives.paginated',
    'cat.directives.facets',
    'cat.directives.sortable',
    'cat.directives.form',
    'cat.directives.numbersOnly',
    'cat.directives.breadcrumbs'
]);
angular.module('cat', [
    'cat.service',
    'cat.directives',
    'cat.filters',
    'cat.controller',
    'ui.bootstrap'
]);

/**
 * @ngdoc function
 * @name cat.FacetTerm
 * @module cat
 *
 * @description
 * A 'FacetTerm' model used in conjunction with the cat-paginated directive where it represents a value of a group or
 * property which can be used to filter the shown list.
 * It consist of an id, a name and a count
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
var FacetTerm = (function () {
    function FacetTerm(data) {
        if (data === void 0) { data = {}; }
        this.id = data.id;
        this.name = data.name;
        this.count = data.count;
    }
    return FacetTerm;
})();
/**
 * @ngdoc overview
 * @name Facet
 *
 * @description
 * A 'Facet' model which is used in conjunction with the cat-paginated directive where it represents a group or
 * which property which can be used to filter the shown list.
 * It has a name and an array of FacetTerms
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
var Facet = (function () {
    function Facet(data) {
        if (data === void 0) { data = {}; }
        this.name = data.name;
        this.terms = _.map(data.facets, function (facet) {
            return new FacetTerm(facet);
        });
    }
    return Facet;
})();
window.cat = window.cat || {};
window.cat.Facet = Facet;
window.cat.FacetTerm = FacetTerm;

/**
 * @ngdoc function
 * @name cat.SearchRequest
 * @module cat
 *
 * @description
 * A 'SearchRequest' model used by the catApiService to provide the backend with certain filter, order, page and size
 * parameters.
 *
 *
 * @param {Object} [searchUrlParams] an object representing the search parameters of the current url, which are
 * used to initialize the properties of the SearchRequest
 * @constructor
 */
var SearchRequest = (function () {
    function SearchRequest(searchUrlParams) {
        var _this = this;
        if (searchUrlParams === void 0) { searchUrlParams = {}; }
        this._pagination = {
            page: 1,
            size: 100
        };
        this._sort = {};
        this._search = {};
        this._dirty = false;
        if (!_.isEmpty(searchUrlParams)) {
            this._pagination.page = searchUrlParams.page || this._pagination.page;
            this._pagination.size = searchUrlParams.size || this._pagination.size;
            this._sort.property = searchUrlParams.sort || this._sort.property;
            this._sort.isDesc = searchUrlParams.rev || this._sort.isDesc;
            _.forEach(_.keys(searchUrlParams), function (param) {
                if (param.indexOf('search.') > -1 && param.length > 7) {
                    _this._search[param.substring(7)] = searchUrlParams[param];
                }
            });
        }
    }
    SearchRequest.prototype._encodeSort = function () {
        var _sort = this._sort;
        return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
    };
    SearchRequest.prototype._encodePagination = function () {
        var _pagination = this._pagination;
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
    };
    SearchRequest._concatenate = function (result, next) {
        if (!result) {
            return next;
        }
        if (!next) {
            return result;
        }
        return result + '&' + next;
    };
    SearchRequest.prototype._encodeSearch = function () {
        if (!!this._search && !_.isEmpty(this._search)) {
            return $.param(this._search, true);
        }
        return '';
    };
    SearchRequest.prototype._urlEndoded = function () {
        return _([this._encodePagination(), this._encodeSort(), this._encodeSearch()]).reduce(SearchRequest._concatenate);
    };
    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    SearchRequest.prototype.pagination = function (pagination) {
        if (pagination === undefined) {
            return this._pagination;
        }
        else {
            this._pagination = pagination;
            this._dirty = true;
            return this._pagination;
        }
    };
    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    SearchRequest.prototype.sort = function (sort) {
        if (sort === undefined) {
            return this._sort;
        }
        else {
            this._sort = sort;
            this._dirty = true;
            return this._sort;
        }
    };
    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    SearchRequest.prototype.search = function (search) {
        if (search === undefined) {
            return this._search;
        }
        else {
            this._search = search;
            this._dirty = true;
            return this._search;
        }
    };
    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    SearchRequest.prototype.urlEncoded = function () {
        this.lastEncoded = this._urlEndoded();
        return this.lastEncoded;
    };
    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    SearchRequest.prototype.isDirty = function () {
        return this._dirty;
    };
    SearchRequest.prototype.setPristine = function () {
        this._dirty = false;
    };
    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    SearchRequest.prototype.setSearch = function ($location) {
        var _this = this;
        var ret = {};
        ret.page = this._pagination.page;
        ret.size = this._pagination.size;
        if (!!this._sort.property) {
            ret.sort = this._sort.property;
            ret.rev = this._sort.isDesc || false;
        }
        _.forEach(_.keys(this._search), function (s) {
            ret['search.' + s] = _this._search[s];
        });
        $location.search(ret);
    };
    return SearchRequest;
})();
window.cat = window.cat || {};
window.cat.SearchRequest = SearchRequest;

angular
    .module('cat.config.messages', [])
    .constant('catMessagesConfig', {
    knownFieldsActive: false
});

function catReplaceTextFilterFactory() {
    return function (text, pattern, options, replacement) {
        if (pattern === void 0) { pattern = '\n'; }
        if (options === void 0) { options = 'g'; }
        if (replacement === void 0) { replacement = ', '; }
        if (!text) {
            return text;
        }
        else {
            return String(text).replace(new RegExp(pattern, options), replacement);
        }
    };
}
angular
    .module('cat.filters.replaceText', [])
    .filter('replaceText', [catReplaceTextFilterFactory]);

var CatBaseDetailController = (function () {
    /**
     * @ngdoc controller
     * @name cat.controller.base.detail:CatBaseDetailController
     * @module cat.controller.base.detail
     *
     * @description
     * The CatBaseDetailController takes care of providing several common properties and functions to the scope
     * of every detail page. It also instantiates the controller given via the config.controller parameter and shares
     * the same scope with it.
     *
     * Common properties include:
     * * detail - the actual object to view
     * * editDetail - a copy of the detail object used for editing
     * * breadcrumbs - the breadcrumbs array
     * * uiStack - the ui stack array if parents exist
     * * editTemplate - the url of the edit template
     * * mainViewTemplate - the url of the main view template
     * * additionalViewTemplate - the url of the additional view template if it exists
     *
     * Common functions include:
     * * save - the save function to update / create an object
     * * edit - a function to switch from view to edit mode
     * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
     * * add - a function to switch into edit mode of a new object
     * * remove - a function to delete the current object
     * * title - a function to resolve a 'title' of the current object
     *
     * @param {object} $scope DOCTODO
     * @param {object} $state DOCTODO
     * @param {object} $stateParams DOCTODO
     * @param {object} $location DOCTODO
     * @param {object} $window DOCTODO
     * @param {object} $globalMessages DOCTODO
     * @param {object} $controller DOCTODO
     * @param {object} $log DOCTODO
     * @param {object} catValidationService DOCTODO
     * @param {object} catBreadcrumbsService DOCTODO
     * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
     */
    function CatBaseDetailController($scope, $state, $stateParams, $location, $window, $globalMessages, $controller, $log, catValidationService, catBreadcrumbsService, config) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.$window = $window;
        this.$globalMessages = $globalMessages;
        this.$controller = $controller;
        this.$log = $log;
        this.catValidationService = catValidationService;
        this.catBreadcrumbsService = catBreadcrumbsService;
        this.config = config;
        $scope.detail = config.detail;
        $scope.editDetail = undefined;
        $scope.config = config;
        var endpoint = config.endpoint;
        var templateUrls = config.templateUrls;
        var Model = config.Model;
        $scope.uiStack = catBreadcrumbsService.generateFromConfig(config);
        if ($stateParams.id === 'new') {
            catBreadcrumbsService.push({
                title: 'New',
                key: 'cc.catalysts.general.new'
            });
        }
        else {
            catBreadcrumbsService.push({});
        }
        $scope.editTemplate = templateUrls.edit;
        if (_.isObject(templateUrls.view)) {
            $scope.mainViewTemplate = templateUrls.view['main'];
            $scope.additionalViewTemplate = templateUrls.view['additional'];
        }
        else {
            $scope.mainViewTemplate = '' + templateUrls.view;
        }
        /**
         * @returns {String|Number} A title of the current object or the 'id' as fallback
         */
        $scope.title = function () {
            var data = $scope.detail;
            if (_.isUndefined(data)) {
                return '';
            }
            return !!data.breadcrumbTitle ? data.breadcrumbTitle() : (!!data.name ? data.name : data.id);
        };
        var update = function () {
            catBreadcrumbsService.replaceLast({
                title: $scope.title()
            });
        };
        /**
         * reloads the current object from the server
         */
        $scope.reloadDetails = function () {
            endpoint.get($stateParams.id).then(function (data) {
                $scope.detail = data;
                update();
            });
        };
        $scope.exists = !!$stateParams.id && $stateParams.id !== 'new';
        /**
         * Creates a new copy of the given model and sets its parent if applicable.
         * Triggers a switch into the edit mode
         */
        $scope.add = function () {
            $scope.editDetail = new Model();
            if (_.isFunction($scope.editDetail.setParent)) {
                $scope.editDetail.setParent(config.parents[0]);
            }
        };
        /**
         * Creates a copy of the current object and triggers a switch into edit mode
         */
        $scope.edit = function () {
            if (_.isFunction($scope.detail.setParent)) {
                $scope.detail.setParent(config.parents[0]);
            }
            $scope.editDetail = angular.copy($scope.detail);
        };
        /**
         * Either cancels the current edit of an object by resetting it or triggers a history back event if the 'new' mode
         * is active
         */
        $scope.cancelEdit = function () {
            catValidationService.clearValidationErrors();
            $scope.$broadcast('formReset');
            if ($scope.exists) {
                $scope.editDetail = undefined;
                $globalMessages.clearMessages();
            }
            else {
                $window.history.back();
            }
        };
        /**
         * Calls the copy function of the current endpoint and redirects to the detail page of the copied object upon success
         */
        $scope.copy = function () {
            endpoint.copy($scope.detail.id).then(function (data) {
                //Note: here we go to the detail state of the copied object although we have all the data of the copied object here,
                // but otherwise we would have to change the url and this leads to problems with browser back and so on
                $state.go('.', { id: data.id });
            });
        };
        /**
         * Calls the remove function of the current endpoint and redirects to the ^.list upon success
         */
        $scope.remove = function () {
            endpoint.remove($scope.detail.id).then(function () {
                if (_.isEmpty($scope.uiStack)) {
                    $state.go('^.list');
                }
                else {
                    var url = $state.href('^.^');
                    $location.url(url.substring(1, url.length));
                    $location.search('tab', endpoint.getEndpointName());
                }
            });
        };
        /**
         * Calls the save function of the current endpoint.
         * Upon success the view mode of the details of the currently created / updated object will be shown.
         * Upon an error the reported errors (global & field errors) will be shown to the user and the edit mode
         * will remain active.
         *
         * * @param {object} stayInEdit If true the view stays in detail edit state after save instead of switching to
         *                              detail view state.
         */
        $scope.save = function (stayInEdit) {
            // When passing data to an asynchronous method, it makes sense to clone it.
            endpoint.save(angular.copy($scope.editDetail)).then(function (data) {
                $globalMessages.clearMessages();
                catValidationService.clearValidationErrors();
                if (stayInEdit) {
                    $scope.editDetail = data;
                    // Refresh-Breadcrumb:
                    $scope.reloadDetails();
                }
                else {
                    if (!$scope.exists) {
                        $scope.$broadcast('formReset');
                        $state.go('.', { id: data.id });
                    }
                    else {
                        $scope.editDetail = undefined;
                        $scope.detail = data;
                        update();
                    }
                }
            });
        };
        // TABS
        $scope.baseTabsController = ['$scope', function ($tabsScope) {
                $controller('CatBaseTabsController', {
                    $scope: $tabsScope,
                    config: config
                });
            }];
        try {
            // extend with custom controller
            $controller(config.controller, {
                $scope: $scope,
                detail: config.detail,
                parents: config.parents,
                config: config
            });
        }
        catch (unused) {
            $log.info('Couldn\'t instantiate controller with name ' + config.controller);
        }
        if ($scope.exists) {
            update();
        }
        else {
            $scope.edit();
        }
    }
    return CatBaseDetailController;
})();
angular
    .module('cat.controller.base.detail', [
    'cat.service.breadcrumbs',
    'cat.controller.base.tabs'
])
    .controller('CatBaseDetailController', [
    '$scope',
    '$state',
    '$stateParams',
    '$location',
    '$window',
    '$globalMessages',
    '$controller',
    '$log',
    'catValidationService',
    'catBreadcrumbsService',
    'config',
    CatBaseDetailController
]);

var CatBaseListController = (function () {
    /**
     * @ngdoc controller
     * @name cat.controller.base.list:CatBaseListController
     * @module cat.controller.base.list
     *
     * @description
     * The CatBaseListController takes care of providing several common properties to the scope
     * of every list page. It also instantiates the controller given via the config.controller parameter and shares
     * the same scope with it. In addition it has a common template 'cat-base-list.tpl.html' which shows a title,
     * new button and provides the cat-paginated directive.
     *
     * Common properties include:
     * * listData - the listData to be used by cat-paginated
     * * title - the title of the view
     * * searchProps - the list of search properties passed on to the cat-paginated directive
     * * config - the config object used to instantiate this view
     *
     * @param {object} $scope scope
     * @param {object} $state state service
     * @param {object} $controller controller
     * @param {object} $log log
     * @param {object} catBreadcrumbsService catBreadcrumbsService
     * @param {object} catListDataLoadingService catListDataLoadingService
     * @param {object} config holds data like the listData object, the template url, base url, the model constructor, etc.
     */
    function CatBaseListController($scope, $state, $controller, $log, catBreadcrumbsService, catListDataLoadingService, config) {
        this.$scope = $scope;
        this.$state = $state;
        this.$log = $log;
        this.catListDataLoadingService = catListDataLoadingService;
        this.config = config;
        if (!_.isUndefined(config.listData)) {
            this.titleKey = 'cc.catalysts.cat-breadcrumbs.entry.' + config.listData.endpoint.getEndpointName();
            catBreadcrumbsService.set([
                {
                    title: config.title,
                    key: this.titleKey
                }
            ]);
            $scope.listData = config.listData;
        }
        else {
            $log.warn('No listData available!');
        }
        this.title = config.title;
        this.searchProps = config.searchProps;
        this.config = config;
        try {
            // extend with custom controller
            $controller(config.controller, { $scope: $scope, listData: config.listData, config: config });
        }
        catch (unused) {
            $log.info('Couldn\'t instantiate controller with name ' + config.controller);
        }
    }
    CatBaseListController.prototype.getUrlForId = function (id) {
        this.$log.warn('use ui-sref directly - this method will be removed in the near future');
        return this.$state.href('^.detail', { id: id });
    };
    CatBaseListController.prototype.getUrlForNewPage = function () {
        return this.getUrlForId('new');
    };
    CatBaseListController.prototype.remove = function (id) {
        var _this = this;
        var endpoint = this.config.listData.endpoint;
        endpoint
            .remove(id)
            .then(function () {
            return _this.catListDataLoadingService
                .load(_this.config.listData.endpoint, _this.config.listData.searchRequest);
        })
            .then(function (data) {
            return _.assign(_this.$scope.listData, data);
        });
    };
    return CatBaseListController;
})();
angular
    .module('cat.controller.base.list', [
    'cat.service.breadcrumbs'
])
    .controller('CatBaseListController', [
    '$scope',
    '$state',
    '$controller',
    '$log',
    'catBreadcrumbsService',
    'catListDataLoadingService',
    'config',
    CatBaseListController
]);

var CatBaseTabsController = (function () {
    /**
     * @ngdoc controller
     * @name cat.controller.base.tabs:CatBaseTabsController
     * @module cat.controller.base.tabs
     *
     * @description
     * The base code for handling sub entites (as tabs).
     * Includes the instantiation of one controller per tab/list and lazy loading of the approrpiate data
     *
     * @param {Object} $scope The angular scope
     * @param {Object} $controller The angular $controller service
     * @param {Object} $stateParams The ui-router $stateParams service
     * @param {Object} $location The angular $location service
     * @param {Object} catElementVisibilityService The visibility service to check wheter or not a tab should be rendered
     * @param {Object} config The config as handled by state resolve
     * @param {ICatUrlResolverService} urlResolverService service to resolve the template urls
     */
    CatBaseTabsController.$inject = ["$scope", "$controller", "$stateParams", "$location", "catElementVisibilityService", "config", "urlResolverService"];
    function CatBaseTabsController($scope, $controller, $stateParams, $location, catElementVisibilityService, config, urlResolverService) {
        var endpoint = config.endpoint;
        $scope.tabs = _.filter(config.tabs, function (tab) {
            return catElementVisibilityService.isVisible('cat.base.tab', tab);
        });
        $scope.tabNames = _.map($scope.tabs, 'name');
        $scope.activeTab = {};
        $scope.activateTab = function (tab) {
            $scope.$broadcast('tab-' + tab + '-active');
            _.forEach($scope.tabs, function (currentTab) {
                $scope.activeTab[currentTab.name] = false;
            });
            $scope.activeTab[tab] = true;
        };
        $scope.selectTab = function (tabName) {
            if (_.isUndefined($location.search().tab) && tabName === $scope.tabNames[0]) {
                // don't add 'default' tab to url
                return;
            }
            $location.search('tab', tabName);
        };
        var isTabActive = function (tab) {
            if (tab.name === $scope.tabNames[0] && _.isUndefined($stateParams.tab)) {
                // first tab is active if no parameter is given
                return true;
            }
            return $stateParams.tab === tab.name;
        };
        $scope.$watchCollection(function () {
            return $location.search();
        }, function (newValue) {
            if (_.isString(newValue.tab)) {
                $scope.activateTab(newValue.tab);
            }
            else if (_.isUndefined(newValue.tab)) {
                // activate first tab if undefined
                $scope.activateTab($scope.tabNames[0]);
            }
        });
        $scope.getTabName = function (tab) {
            return window.cat.util.pluralize(window.cat.util.capitalize(tab));
        };
        _.forEach($scope.tabs, function (tab) {
            $scope.activeTab[tab.name] = isTabActive(tab);
        });
        $scope.getTabTemplate = function (tab) {
            return urlResolverService.getTabTemplate(tab, config);
        };
        $scope.getTabKey = function (tabName) {
            var key = 'cc.catalysts.general.tab.' + endpoint.getEndpointName();
            var parentEndpoint = endpoint.parentEndpoint;
            while (parentEndpoint) {
                key += '.';
                key += parentEndpoint.getEndpointName();
                parentEndpoint = parentEndpoint.parentEndpoint;
            }
            return key + '.' + tabName;
        };
        var _getDefaultTabControllerName = function (tab) {
            var name = window.cat.util.capitalize(endpoint.getEndpointName());
            var parentEndpoint = endpoint.parentEndpoint;
            while (parentEndpoint) {
                name = window.cat.util.capitalize(parentEndpoint.getEndpointName()) + name;
                parentEndpoint = parentEndpoint.parentEndpoint;
            }
            return name + window.cat.util.capitalize(tab.name) + 'Controller';
        };
        var _getTabControllerName = function (tab) {
            if (!!tab.controller) {
                return tab.controller;
            }
            return _getDefaultTabControllerName(tab);
        };
        var tabIndex = 0;
        $scope.tabController = [
            '$scope',
            'catListDataLoadingService',
            function ($tabScope, catListDataLoadingService) {
                var activeTab = $scope.tabs[tabIndex++];
                var tabControllerName = _getTabControllerName(activeTab);
                $tabScope.getSearchRequest = function () {
                    return new window.cat.SearchRequest();
                };
                $tabScope.getEndpoint = function () {
                    return config.detail[activeTab.name];
                };
                $tabScope.loadListData = function () {
                    catListDataLoadingService
                        .load($tabScope.getEndpoint(), $tabScope.getSearchRequest())
                        .then(function (data) {
                        $tabScope.listData = data;
                    });
                };
                $tabScope.$on('tab-' + activeTab.name + '-active', function () {
                    if (_.isUndefined($tabScope.listData)) {
                        $tabScope.loadListData();
                    }
                });
                $controller(tabControllerName, {
                    $scope: $tabScope,
                    detail: config.detail,
                    parents: config.parents,
                    config: config
                });
                if ($scope.activeTab[activeTab.name] === true) {
                    $scope.activateTab(activeTab.name);
                }
            }];
    }
    return CatBaseTabsController;
})();
angular
    .module('cat.controller.base.tabs', [
    'cat.service.elementVisibility',
    'cat.url.resolver.service'
]).controller('CatBaseTabsController', CatBaseTabsController);

window.cat.i18n = window.cat.i18n || {};
window.cat.i18n['de'] = _.assign({
    'cc.catalysts.cat-paginated.itemsFound': '{{count}} Einträge gefunden. Einträge {{firstResult}}-{{lastResult}}',
    'cc.catalysts.cat-paginated.noItemsFound': 'Keine Einträge gefunden',
    'cc.catalysts.general.new': 'Neu',
    'cc.catalysts.general.edit': 'Bearbeiten',
    'cc.catalysts.general.delete': 'Löschen',
    'cc.catalysts.general.copy': 'Kopieren',
    'cc.catalysts.general.save': 'Speichern',
    'cc.catalysts.general.cancel': 'Abbrechen',
    'cc.catalysts.cat-breadcrumbs.entry.home': 'Zuhause',
    'cc.catalysts.cat-breadcrumbs.entry.edit': 'Bearbeiten',
    'cc.catalysts.cat-field-errors-info.text': 'Beim speichern ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Eingabe.',
    'cc.catalysts.cat-validation-service.networkError': 'Es ist ein Netzwerkfehler aufgetreten.'
}, window.cat.i18n['de']);

window.cat.i18n = window.cat.i18n || {};
window.cat.i18n['en'] = _.assign({
    'cc.catalysts.cat-paginated.itemsFound': '{{count}} entries found. Entries {{firstResult}}-{{lastResult}}',
    'cc.catalysts.cat-paginated.noItemsFound': 'No entries found',
    'cc.catalysts.general.new': 'New',
    'cc.catalysts.general.edit': 'Edit',
    'cc.catalysts.general.delete': 'Delete',
    'cc.catalysts.general.copy': 'Copy',
    'cc.catalysts.general.save': 'Save',
    'cc.catalysts.general.cancel': 'Cancel',
    'cc.catalysts.cat-breadcrumbs.entry.home': 'Home',
    'cc.catalysts.cat-breadcrumbs.entry.edit': 'Edit',
    'cc.catalysts.cat-field-errors-info.text': 'Errors occured during save. Please verify your input.',
    'cc.catalysts.cat-validation-service.networkError': 'A network error occurred.'
}, window.cat.i18n['en']);

function catAutofocusDirectiveFactory($timeout) {
    var catAutofocusLink = function (scope, element) {
        $timeout(function () {
            if (!_.isUndefined(element.data('select2'))) {
                element.select2('open');
            }
            else {
                element[0].focus();
            }
        }, 100);
    };
    return {
        restrict: 'A',
        link: catAutofocusLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.autofocus:catAutofocus
 */
angular
    .module('cat.directives.autofocus', [])
    .directive('catAutofocus', [
    '$timeout',
    catAutofocusDirectiveFactory
]);


catBreadcrumbsDirectiveFactory.$inject = ["catBreadcrumbsConfig", "catBreadcrumbs"];function catBreadcrumbsDirectiveFactory(catBreadcrumbsConfig, catBreadcrumbs) {
    var catAutofocusLink = function (scope) {
        if (catBreadcrumbsConfig.homeState) {
            scope.homeState = catBreadcrumbsConfig.homeState;
        }
        scope.breadcrumbs = catBreadcrumbs;
        scope.showHome = function () {
            return !!catBreadcrumbsConfig.homeState;
        };
    };
    return {
        restrict: 'A',
        templateUrl: 'template/cat-breadcrumbs.tpl.html',
        link: catAutofocusLink
    };
}
angular
    .module('cat.directives.breadcrumbs', ['cat.service.breadcrumbs'])
    .constant('catBreadcrumbsConfig', {
    homeState: 'dashboard'
})
    .directive('catBreadcrumbs', catBreadcrumbsDirectiveFactory);

function catCheckboxDirectiveFactory() {
    var catCheckboxLink = function (scope, element) {
        if (!!scope.checked) {
            element.addClass('glyphicon glyphicon-check');
        }
        else {
            element.addClass('glyphicon glyphicon-unchecked');
        }
    };
    return {
        replace: true,
        restrict: 'E',
        scope: {
            checked: '='
        },
        link: catCheckboxLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.checkbox:catCheckbox
 */
angular
    .module('cat.directives.checkbox', [])
    .directive('catCheckbox', [catCheckboxDirectiveFactory]);

function catConfirmClickDirectiveFactory() {
    var catConfirmClickLink = function (scope, element, attr) {
        var msg = attr.catConfirmClick || 'Are you sure?';
        var clickAction = attr.catOnConfirm;
        element.bind('click', function () {
            if (window.confirm(msg)) {
                scope.$eval(clickAction);
            }
        });
    };
    return {
        restrict: 'A',
        link: catConfirmClickLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.confirmClick:catConfirmClick
 */
angular
    .module('cat.directives.confirmClick', [])
    .directive('catConfirmClick', [catConfirmClickDirectiveFactory]);

function catElementVisibleDirectiveFactory(catElementVisibilityService) {
    var catElementVisibleLink = function (scope, element) {
        if (!catElementVisibilityService.isVisible(scope.identifier, scope.data)) {
            element.hide();
        }
    };
    return {
        restrict: 'A',
        scope: {
            identifier: '@catElementVisible',
            data: '=?catElementData'
        },
        link: catElementVisibleLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.elementVisible:catElementVisible
 */
angular
    .module('cat.directives.elementVisible', [
    'cat.service.elementVisibility'
])
    .directive('catElementVisible', [
    'catElementVisibilityService',
    catElementVisibleDirectiveFactory
]);

var CatFacetsController = (function () {
    function CatFacetsController($scope) {
        $scope.isActive = function (facet) {
            return !!$scope.catPaginatedController.getSearch()[facet.name];
        };
        $scope.facetName = function (facet) {
            if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                return $scope.names[facet.name];
            }
            else {
                return facet.name;
            }
        };
        $scope.facets = {};
        var _search = function (search) {
            return $scope.catPaginatedController.getSearchRequest().search(search);
        };
        $scope.facetChanged = function (facet) {
            var search = _search();
            var value = $scope.facets[facet.name];
            if (!!value) {
                search[facet.name] = value;
            }
            else {
                delete search[facet.name];
            }
        };
        $scope.initFacets = function () {
            _.forEach($scope.listData.facets, function (facet) {
                if ($scope.isActive(facet)) {
                    $scope.facets[facet.name] = $scope.catPaginatedController.getSearch()[facet.name];
                }
            });
        };
        $scope.facetSelectOptions = {
            allowClear: true
        };
    }
    return CatFacetsController;
})();
function catFacetsDirectiveFactory() {
    function _initDefaults(scope) {
        if (_.isUndefined(scope.listData)) {
            scope.listData = scope.$parent['listData'];
        }
    }
    function _checkConditions(scope) {
        if (_.isUndefined(scope.listData)) {
            throw new Error('listData was not defined and couldn\'t be found with default value');
        }
        if (_.isUndefined(scope.listData.facets)) {
            throw new Error('No facets are available within given listData');
        }
    }
    var catFacetsLink = function (scope, element, attrs, catPaginatedController) {
        _initDefaults(scope);
        _checkConditions(scope);
        scope.catPaginatedController = catPaginatedController;
    };
    return {
        replace: true,
        restrict: 'E',
        scope: {
            listData: '=?',
            names: '='
        },
        require: '^catPaginated',
        templateUrl: 'template/cat-facets.tpl.html',
        link: catFacetsLink,
        controller: [
            '$scope',
            CatFacetsController
        ]
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.facets:catFacets
 */
angular
    .module('cat.directives.facets', [
    'cat.directives.paginated'
])
    .directive('catFacets', [
    catFacetsDirectiveFactory
]);

var CatFieldErrorsInfoController = (function () {
    function CatFieldErrorsInfoController(catValidationService) {
        this.catValidationService = catValidationService;
    }
    CatFieldErrorsInfoController.prototype.hasErrors = function () {
        return this.catValidationService.hasAnyFieldErrors(this.contextId);
    };
    return CatFieldErrorsInfoController;
})();
function catFieldErrorsInfoDirectiveFactory() {
    var catFieldErrorsLink = function (scope, elem, attr, _a) {
        var catFieldErrors = _a[0], catValidationGroup = _a[1];
        elem.addClass('cat-field-errors-info');
        if (!!catValidationGroup) {
            catFieldErrors.contextId = catValidationGroup.getContextId();
        }
    };
    return {
        replace: true,
        restrict: 'EA',
        scope: true,
        bindToController: true,
        controllerAs: 'catFieldErrorsInfo',
        require: ['catFieldErrorsInfo', '?^^catValidationGroup'],
        link: catFieldErrorsLink,
        controller: CatFieldErrorsInfoController,
        templateUrl: 'template/cat-field-errors-info.tpl.html'
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.fieldErrors.info:catFieldErrorsInfo
 */
angular
    .module('cat.directives.fieldErrors.info', [
    'cat.service.validation'
])
    .directive('catFieldErrorsInfo', [
    catFieldErrorsInfoDirectiveFactory
]);

var CatFieldErrorsController = (function () {
    function CatFieldErrorsController(catValidationService) {
        this.catValidationService = catValidationService;
    }
    CatFieldErrorsController.prototype.hasErrors = function () {
        return this.catValidationService.hasFieldErrors(this.name, this.contextId);
    };
    CatFieldErrorsController.prototype.getErrors = function () {
        return this.catValidationService.getFieldErrors(this.name, this.contextId);
    };
    return CatFieldErrorsController;
})();
function catFieldErrorsDirectiveFactory() {
    var catFieldErrorsLink = function (scope, elem, attr, _a) {
        var catFieldErrorsController = _a[0], catValidationGroupController = _a[1];
        elem.addClass('cat-field-errors');
        if (!!catValidationGroupController) {
            catFieldErrorsController.contextId = catValidationGroupController.getContextId();
        }
    };
    return {
        replace: 'true',
        restrict: 'EA',
        scope: {
            name: '@'
        },
        bindToController: true,
        controllerAs: 'catFieldErrors',
        require: ['catFieldErrors', '?^^catValidationGroup'],
        link: catFieldErrorsLink,
        controller: CatFieldErrorsController,
        templateUrl: 'template/cat-field-errors.tpl.html'
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular
    .module('cat.directives.fieldErrors', [
    'cat.service.validation'
])
    .directive('catFieldErrors', [
    catFieldErrorsDirectiveFactory
]);

var CatGlobalErrorsController = (function () {
    function CatGlobalErrorsController(catValidationService) {
        this.catValidationService = catValidationService;
    }
    CatGlobalErrorsController.prototype.hasErrors = function () {
        return this.catValidationService.hasGlobalErrors(this.contextId);
    };
    CatGlobalErrorsController.prototype.getErrors = function () {
        return this.catValidationService.getGlobalErrors(this.contextId);
    };
    return CatGlobalErrorsController;
})();
function catGlobalErrorsDirectiveFactory() {
    var catGlobalErrorsLink = function (scope, elem, attr, _a) {
        var catGlobalErrors = _a[0], catValidationGroup = _a[1];
        elem.addClass('cat-global-errors');
        if (!!catValidationGroup) {
            catGlobalErrors.contextId = catValidationGroup.getContextId();
        }
    };
    return {
        replace: true,
        restrict: 'EA',
        scope: true,
        bindToController: true,
        controllerAs: 'catGlobalErrors',
        require: ['catGlobalErrors', '?^^catValidationGroup'],
        link: catGlobalErrorsLink,
        controller: CatGlobalErrorsController,
        templateUrl: 'template/cat-global-errors.tpl.html'
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.globalError:catGlobalErrors
 */
angular
    .module('cat.directives.globalErrors', [
    'cat.service.validation'
])
    .directive('catGlobalErrors', [
    catGlobalErrorsDirectiveFactory
]);

function catI18nDirectiveFactory($log, $rootScope, catI18nService, catI18nResponseHandler) {
    function _translate(scope, element) {
        if (!scope.key) {
            $log.warn('No key was given for cat-i18n!');
            return;
        }
        catI18nService
            .translate(scope.key, scope.params)
            .then(function (message) {
            catI18nResponseHandler.handleTranslationSuccess(message, scope, element);
        }, function (reason) {
            catI18nResponseHandler.handleTranslationError(reason, scope, element);
        });
    }
    var catI18nLink = function (scope, element) {
        _translate(scope, element);
        if (!!scope.params && scope.watchParams === true) {
            scope.$watch('params', function () {
                _translate(scope, element);
            }, true);
        }
        $rootScope.$on('cat-i18n-refresh', function () {
            _translate(scope, element);
        });
    };
    return {
        restrict: 'A',
        scope: {
            key: '@catI18n',
            params: '=?i18nParams',
            watchParams: '=?i18nWatchParams'
        },
        link: catI18nLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.i18n:catI18n
 */
angular
    .module('cat.directives.i18n', [
    'cat.service.i18n'
])
    .directive('catI18n', [
    '$log',
    '$rootScope',
    'catI18nService',
    'catI18nResponseHandler',
    catI18nDirectiveFactory
]);

var CatIconController = (function () {
    function CatIconController($scope, catIconConfig) {
        var icons = catIconConfig.icons;
        var iconClasses = [];
        // add size class
        if (!!$scope.size && $scope.size === 'xs' && !!catIconConfig.xsClass) {
            iconClasses.push(catIconConfig.xsClass);
        }
        // add icon class
        iconClasses.push(icons[$scope.icon]);
        $scope.iconClass = iconClasses.join(' ');
    }
    return CatIconController;
})();
function catIconDirectiveFactory() {
    return {
        restrict: 'A',
        replace: true,
        template: '<span class="{{iconClass}}" title="{{title}}"></span>',
        scope: {
            icon: '@catIcon',
            title: '@',
            size: '@'
        },
        controller: [CatIconController]
    };
}
angular.module('cat.directives.icon', [])
    .constant('catIconConfig', {
    icons: {
        config: {
            xsClass: undefined
        },
        create: 'glyphicon glyphicon-plus',
        edit: 'glyphicon glyphicon-edit',
        remove: 'glyphicon glyphicon-remove',
        save: 'glyphicon glyphicon-floppy-disk'
    }
})
    .directive('catIcon', [
    catIconDirectiveFactory
]);

function catInputGroupDirectiveFactory(catValidationService) {
    var catInputGroupLink = function (scope, element, attr, catValidationGroupCtrl) {
        if (!!catValidationGroupCtrl && !!catValidationService) {
            catValidationService
                .getContext(catValidationGroupCtrl.getContextId())
                .registerField(scope.name);
        }
        element.addClass('form-group');
    };
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            label: '@',
            name: '@',
            catI18nKey: '@'
        },
        require: '?^^catValidationGroup',
        link: catInputGroupLink,
        templateUrl: 'template/cat-input.tpl.html'
    };
}
angular
    .module('cat.directives.inputGroup', [])
    .directive('catInputGroup', [
    catInputGroupDirectiveFactory
]);

function catInputDirectiveFactory() {
    var catInputLink = function (scope, element, attrs, ctrl) {
        if (!!ctrl) {
            scope.$on('fieldErrors', function (event, fieldErrors) {
                if (!fieldErrors || !attrs.id) {
                    return;
                }
                var valid = !fieldErrors[attrs.id];
                ctrl.$setValidity(attrs.id, valid);
            });
        }
    };
    return {
        require: '?ngModel',
        restrict: 'E',
        link: catInputLink
    };
}
angular
    .module('cat.directives.input', [])
    .directive('input', [
    catInputDirectiveFactory
]);

function catLoadMoreDirectiveFactory() {
    var catLoadMoreLink = function (scope, element, attrs) {
        var initialCount = parseInt(attrs.catLoadMore);
        scope.$parent.elementsCount = scope.$parent.elementsCount || initialCount;
        scope.$parent.elements = scope.$parent.elements || [];
        scope.$parent.elements.push(element);
        if (scope.$parent.elements.length > scope.$parent.elementsCount) {
            element.addClass('hidden');
        }
        if (!element.parent().next().length && scope.$parent.elements.length > scope.$parent.elementsCount) {
            var elt = $('<a href="#">Show more</a>');
            elt.on({
                click: function () {
                    scope.$parent.elementsCount += initialCount;
                    if (scope.$parent.elements.length <= scope.$parent.elementsCount) {
                        elt.addClass('hidden');
                    }
                    scope.$parent.elements.forEach(function (elt, ind) {
                        if (ind < scope.$parent.elementsCount) {
                            elt.removeClass('hidden');
                        }
                    });
                    return false;
                }
            });
            element.parent().after(elt);
        }
    };
    return {
        replace: true,
        restrict: 'A',
        link: catLoadMoreLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.loadMore:catLoadMore
 */
angular
    .module('cat.directives.loadMore', [])
    .directive('catLoadMore', [
    catLoadMoreDirectiveFactory
]);

function catMainMenuDirectiveFactory($mainMenu, catElementVisibilityService, $location) {
    var catMainMenuLink = function (scope) {
        scope.getMenus = $mainMenu.getMenus;
        scope.isVisible = function (entry) {
            var visible = false;
            if (entry.isMenu() || entry.isGroup()) {
                _.forEach(entry['getEntries'](), function (subEntry) {
                    visible = visible || scope['isVisible'](subEntry);
                });
                if (entry.isMenu()) {
                    _.forEach(entry['getGroups'](), function (groups) {
                        visible = visible || scope['isVisible'](groups);
                    });
                }
            }
            else {
                return catElementVisibilityService.isVisible('cat.menu.entry', entry);
            }
            return visible;
        };
        scope.isActive = function (path) {
            return $location.path().substr(0, path.length) === path;
        };
    };
    return {
        restrict: 'E',
        scope: {},
        link: catMainMenuLink,
        templateUrl: 'template/cat-main-menu.tpl.html'
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.menu:catLoadMore
 */
angular
    .module('cat.directives.menu', [
    'cat.service.menu',
    'cat.service.elementVisibility'
])
    .directive('catMainMenu', [
    '$mainMenu',
    'catElementVisibilityService',
    '$location',
    catMainMenuDirectiveFactory
]);

var CatMessagesController = (function () {
    function CatMessagesController($scope, catValidationService) {
        if (!$scope.type) {
            $scope.type = 'error';
        }
        $scope.hasMessages = function () {
            return catValidationService.hasGlobalErrors($scope.contextId);
        };
        $scope.getMessages = function () {
            return catValidationService.getGlobalErrors($scope.contextId);
        };
    }
    return CatMessagesController;
})();
function catMessagesDirectiveFactory() {
    var catMessagesLink = function (scope, elem, attr, catValidationGroupCtrl) {
        if (!!catValidationGroupCtrl) {
            scope.contextId = catValidationGroupCtrl.getContextId();
        }
    };
    return {
        restrict: 'A',
        templateUrl: 'template/cat-messages.tpl.html',
        scope: {
            type: '=?'
        },
        require: '?^^catValidationGroup',
        link: catMessagesLink,
        controller: [
            '$scope',
            'catValidationService',
            CatMessagesController
        ]
    };
}
angular
    .module('cat.directives.messages', [
    'cat.config.messages',
    'cat.service.validation'
])
    .directive('catMessages', [
    catMessagesDirectiveFactory
]);

var CatPaginatedController = (function () {
    function CatPaginatedController($scope, $location, $timeout, $rootScope, catListDataLoadingService, catI18nService, catSearchService) {
        this.$scope = $scope;
        this.$location = $location;
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;
        this.catListDataLoadingService = catListDataLoadingService;
        this.catI18nService = catI18nService;
        this.catSearchService = catSearchService;
        this.searchTimeout = null;
        this.initScopeProperties();
        this.registerScopeEventHandlers();
        this.registerScopeWatches();
    }
    CatPaginatedController.prototype.initScopeProperties = function () {
        if (_.isUndefined(this.$scope.listData)) {
            this.$scope.listData = this.$scope.$parent['listData'];
            if (_.isUndefined(this.$scope.listData)) {
                throw new Error('listData was not defined and couldn\'t be found with default value');
            }
        }
        if (_.isUndefined(this.$scope.syncLocation)) {
            this.$scope.syncLocation = _.isUndefined(this.$scope.$parent['detail']);
        }
        this.$scope.paginationText = {
            previous: 'Previous',
            next: 'Next',
            first: 'First',
            last: 'Last'
        };
        this._loadPaginationTranslations();
        this.$scope.listData.search = this.$scope.listData.search || this.$scope.listData.searchRequest.search() || {};
        this.searchRequest = this.$scope.listData.searchRequest;
    };
    CatPaginatedController.prototype.registerScopeWatches = function () {
        var _this = this;
        this.$scope.$watch('listData.sort', function (newVal) {
            if (!!newVal) {
                console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                this.$scope.$parent.$broadcast('SortChanged', newVal);
            }
        }, true);
        this.$scope.$watch('listData.search', this.updateSearch, true);
        this.$scope.$watch('listData.pagination', function (newVal, oldVal) {
            // TODO check wheter or not this is necessary with angular >= 1.3
            if (angular.equals(newVal, oldVal)) {
                return;
            }
            _this.searchRequest.pagination(_this.$scope.listData.pagination);
            _this.updateLocation();
            _this.reload();
        }, true);
    };
    CatPaginatedController.prototype.registerScopeEventHandlers = function () {
        var _this = this;
        this.$rootScope.$on('cat-i18n-refresh', function () {
            _this._loadPaginationTranslations();
        });
        this.$scope.$on('cat-paginated-refresh', function () {
            _this.reload(0, true);
        });
        this.$scope.$on('SortChanged', function (event, value) {
            this.sort(value);
        });
    };
    CatPaginatedController.prototype.handlePaginationTextResponse = function (prop) {
        var _this = this;
        return function (message) {
            _this.$scope.paginationText[prop] = message;
        };
    };
    CatPaginatedController.prototype._loadPaginationTranslations = function () {
        this.catI18nService.translate(CatPaginatedController.PAGINATION_PREVIOUS_KEY).then(this.handlePaginationTextResponse('previous'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_NEXT_KEY).then(this.handlePaginationTextResponse('next'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_FIRST_KEY).then(this.handlePaginationTextResponse('first'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_LAST_KEY).then(this.handlePaginationTextResponse('last'));
    };
    CatPaginatedController.prototype.reload = function (delay, force) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        if (force === void 0) { force = false; }
        this.$timeout.cancel(this.searchTimeout);
        this.searchTimeout = this.$timeout(function () {
            if (_this.searchRequest.isDirty() || force) {
                _this.catListDataLoadingService.load(_this.$scope.listData.endpoint, _this.searchRequest).then(function (data) {
                    _this.searchRequest.setPristine();
                    _.assign(_this.$scope.listData, data);
                });
            }
        }, delay);
    };
    CatPaginatedController.prototype.updateLocation = function () {
        if (this.$scope.syncLocation !== false) {
            this.catSearchService.updateLocation(this.searchRequest);
            this.$location.replace();
        }
    };
    CatPaginatedController.prototype.searchChanged = function (value, delay) {
        this.searchRequest.search(value);
        this.updateLocation();
        this.$scope.listData.pagination.page = 1;
        this.reload(delay);
    };
    CatPaginatedController.prototype.updateSearch = function (newVal, oldVal) {
        // TODO check wheter or not this is necessary with angular >= 1.3
        if (angular.equals(newVal, oldVal)) {
            return;
        }
        var search = this.searchRequest.search();
        _.assign(search, newVal);
        this.searchChanged(newVal, CatPaginatedController.DELAY_ON_SEARCH);
    };
    CatPaginatedController.prototype.sort = function (newVal, oldVal) {
        // TODO check wheter or not this is necessary with angular >= 1.3
        if (angular.equals(newVal, oldVal)) {
            return;
        }
        this.searchRequest.sort(newVal);
        this.updateLocation();
        this.$scope.listData.pagination.page = 1;
        this.reload();
    };
    CatPaginatedController.prototype.getSearch = function () {
        return this.searchRequest.search();
    };
    CatPaginatedController.prototype.getSearchRequest = function () {
        return this.searchRequest;
    };
    CatPaginatedController.DELAY_ON_SEARCH = 500;
    CatPaginatedController.PAGINATION_PREVIOUS_KEY = 'cc.catalysts.cat-paginated.pagination.previous';
    CatPaginatedController.PAGINATION_NEXT_KEY = 'cc.catalysts.cat-paginated.pagination.next';
    CatPaginatedController.PAGINATION_FIRST_KEY = 'cc.catalysts.cat-paginated.pagination.first';
    CatPaginatedController.PAGINATION_LAST_KEY = 'cc.catalysts.cat-paginated.pagination.last';
    return CatPaginatedController;
})();
function catPaginatedDirectiveFactory(catI18nService) {
    var SEARCH_PROP_KEY = 'cc.catalysts.cat-paginated.search.prop';
    var catPaginatedLink = function (scope, element, attrs) {
        if (!!attrs.searchProps) {
            scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                return !!prop;
            });
            scope.searchPropertyPlaceholders = {};
            _.forEach(scope.searchProps, function (searchProp) {
                scope.searchPropertyPlaceholders[searchProp] = 'Search by ' + searchProp;
                catI18nService.translate(SEARCH_PROP_KEY, { prop: searchProp })
                    .then(function (message) {
                    scope.searchPropertyPlaceholders[searchProp] = message;
                });
            });
        }
    };
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            listData: '=?',
            syncLocation: '=?'
        },
        templateUrl: 'template/cat-paginated.tpl.html',
        link: catPaginatedLink,
        controllerAs: 'catPaginatedController',
        controller: [
            '$scope',
            '$location',
            '$timeout',
            '$rootScope',
            'catListDataLoadingService',
            'catI18nService',
            'catSearchService',
            CatPaginatedController
        ]
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.paginated:catPaginated
 */
angular
    .module('cat.directives.paginated', [
    'ui.bootstrap.pagination',
    'cat.service.listDataLoading',
    'cat.service.i18n',
    'cat.service.search'
])
    .directive('catPaginated', [
    'catI18nService',
    catPaginatedDirectiveFactory
]);

var CatSelectController = (function () {
    function CatSelectController($scope, $log, catApiService, catSelectConfigService) {
        this.$log = $log;
        var options = catSelectConfigService.getConfig($scope.config, $scope.options);
        if (_.isUndefined(options)) {
            throw new Error('At least one of "config" or "options" has to be specified');
        }
        var searchRequestAdapter = options.searchRequestAdapter || {};
        var transport, quietMillis, searchRequestFunc = options.search || function (term, page) {
            return {
                'search.name': term,
                page: page
            };
        }, filterFunc = options.filter || function (term) {
            return true;
        };
        var endpoint = options.endpoint;
        if (_.isArray(endpoint)) {
            transport = function (queryParams) {
                return queryParams.success({
                    elements: options.endpoint
                });
            };
            quietMillis = 0;
        }
        else if (_.isFunction(endpoint)) {
            transport = endpoint;
            quietMillis = 500;
        }
        else if (_.isObject(endpoint)) {
            transport = this.fetchElements(endpoint, options.sort, searchRequestAdapter);
            quietMillis = 500;
        }
        else if (_.isString(endpoint)) {
            var api = catApiService['' + endpoint];
            if (!api) {
                $log.error('No api endpoint "' + endpoint + '" defined');
                $scope.elements = [];
                return;
            }
            transport = this.fetchElements(api, options.sort, searchRequestAdapter);
            quietMillis = 500;
        }
        else {
            $log.error('The given endpoint has to be one of the following types: array, object, string or function - but was ' + (typeof endpoint));
            $scope.elements = [];
            return;
        }
        $scope.selectOptions = _.assign({
            placeholder: ' ',
            minimumInputLength: 0,
            adaptDropdownCssClass: function (cssClass) {
                if (_.contains(['ng-valid', 'ng-invalid', 'ng-pristine', 'ng-dirty'], cssClass)) {
                    return cssClass;
                }
                return null;
            },
            ajax: {
                data: searchRequestFunc,
                quietMillis: quietMillis,
                transport: transport,
                results: function (data, page) {
                    var more = (page * (options.size || 100)) < data.totalCount;
                    return {
                        results: _.filter(data.elements, filterFunc),
                        more: more
                    };
                }
            },
            formatResult: function (element) {
                return element.name;
            },
            formatSelection: function (element) {
                return element.name;
            }
        }, options['ui-select2']);
    }
    CatSelectController.prototype.fetchElements = function (endpoint, sort, searchRequestAdapter) {
        return function (queryParams) {
            var searchRequest = new window.cat.SearchRequest(queryParams.data);
            searchRequest.sort(sort || { property: 'name', isDesc: false });
            if (_.isFunction(searchRequestAdapter)) {
                searchRequest = searchRequestAdapter(searchRequest);
            }
            else if (_.isObject(searchRequestAdapter)) {
                _.assign(searchRequest, searchRequestAdapter);
            }
            else {
                this.$log.warn('searchRequestAdapter has to be either a function or an object but was ' + (typeof searchRequestAdapter));
            }
            return endpoint.list(searchRequest).then(queryParams.success);
        };
    };
    return CatSelectController;
})();
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
function catSelectDirectiveFactory() {
    var catSelectLink = function (scope, element, attrs, ngModel) {
        element.addClass('form-control');
        // clear formatters, otherwise $viewModel will be converted to a string
        // see https://github.com/angular/angular.js/commit/1eda18365a348c9597aafba9d195d345e4f13d1e
        ngModel.$formatters = [];
    };
    return {
        restrict: 'EA',
        replace: true,
        priority: 1,
        require: 'ngModel',
        scope: {
            options: '=?',
            id: '@',
            config: '@?'
        },
        link: catSelectLink,
        controller: [
            '$scope',
            '$log',
            'catApiService',
            'catSelectConfigService',
            CatSelectController
        ],
        template: '<input type="text" ui-select2="selectOptions">'
    };
}
angular.module('cat.directives.select', ['ui.select2', 'cat.service.api', 'cat.service.selectConfig'])
    .directive('catSelect', [catSelectDirectiveFactory]);

var CatSortableController = (function () {
    function CatSortableController($scope) {
        $scope.toggleSort = function (property) {
            if ($scope.sort.property === property) {
                $scope.sort.isDesc = !$scope.sort.isDesc;
            }
            else {
                $scope.sort.property = property;
                $scope.sort.isDesc = false;
            }
            $scope.catPaginatedController.sort($scope.sort);
        };
        $scope.$on('SortChanged', function (event, value) {
            $scope.sort = value;
        });
    }
    return CatSortableController;
})();
function catSortableDirectiveFactory($compile) {
    var catSortableLink = function (scope, element, attrs, catPaginatedController) {
        var title = element.text();
        var property = attrs.catSortable || title.toLowerCase().trim();
        var i18n = 'cc.catalysts.cat-sortable.sort.' + property;
        if (!!attrs.catI18nKey) {
            i18n = attrs.catI18nKey;
        }
        // todo - make configurable
        scope.sort = scope.listData.searchRequest.sort();
        scope.catPaginatedController = catPaginatedController;
        var icon = 'glyphicon-sort-by-attributes';
        if (!!attrs.sortMode) {
            if (attrs.sortMode === 'numeric') {
                icon = 'glyphicon-sort-by-order';
            }
            else if (attrs.sortMode === 'alphabet') {
                icon = 'glyphicon-sort-by-alphabet';
            }
        }
        element.text('');
        element.append($compile("\n<a class=\"sort-link\" href=\"\" ng-click=\"toggleSort('" + property + "')\">\n    <span cat-i18n=\"" + i18n + "\">" + title + "</span>\n    <span class=\"glyphicon\"\n          ng-class=\"{\n            '" + icon + "': sort.property == '" + property + "' && !sort.isDesc,\n            '" + icon + "-alt': sort.property == '" + property + "' && sort.isDesc\n          }\">\n    </span>\n</a>")(scope));
    };
    return {
        restrict: 'AC',
        require: '^catPaginated',
        link: catSortableLink,
        controller: CatSortableController
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.sortable:catSortable
 */
angular
    .module('cat.directives.sortable', [
    'cat.directives.paginated'
])
    .directive('catSortable', [
    catSortableDirectiveFactory
]);

var CatValidationGroupController = (function () {
    function CatValidationGroupController($scope, catValidationService) {
        var _this = this;
        this.contextId = catValidationService.createContext();
        $scope.$on('$destroy', function () {
            catValidationService.destroyContext(_this.contextId);
        });
    }
    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    CatValidationGroupController.prototype.getContextId = function () {
        return this.contextId;
    };
    return CatValidationGroupController;
})();
function catValidationGroupDirectiveFactory() {
    return {
        restrict: 'A',
        controllerAs: 'catValidationGroupCtrl',
        bindToController: true,
        controller: [
            '$scope',
            'catValidationService',
            CatValidationGroupController
        ]
    };
}
angular
    .module('cat.directives.validation', ['cat.service.validation'])
    .directive('catValidationGroup', [
    catValidationGroupDirectiveFactory
]);

function catFormDirectiveFactory($timeout) {
    var catFormLink = function (scope, element, attrs, formCtrl) {
        var warningMessage = attrs.eocsWarnOnNavIfDirty || 'You have unsaved changes. Leave the page?';
        // TODO - remove this ugly hack if ui-select2 fixes this problem...
        $timeout(function () {
            formCtrl.$setPristine();
        }, 50);
        scope.$on('formReset', function () {
            formCtrl.$setPristine();
        });
        scope.$on('formDirty', function () {
            formCtrl.$setDirty();
        });
        // handle angular route change
        scope.$on('$locationChangeStart', function (event) {
            if (formCtrl.$dirty) {
                if (!window.confirm(warningMessage)) {
                    event.preventDefault();
                }
            }
        });
        // handle browser window/tab close
        $(window).on('beforeunload', function (event) {
            if (formCtrl.$dirty) {
                return warningMessage;
            }
        });
        // clean up beforeunload handler when scope is destroyed
        scope.$on('$destroy', function () {
            $(window).unbind('beforeunload');
        });
    };
    return {
        restrict: 'E',
        scope: true,
        require: 'form',
        link: catFormLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.form:form
 */
angular
    .module('cat.directives.form', [])
    .directive('form', [
    '$timeout',
    catFormDirectiveFactory
]);

function catNumbersOnlyDirectiveFactory() {
    var catNumbersOnlyLink = function (scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function (inputValue) {
            if (!inputValue)
                return '';
            var pattern = '[^0-9]';
            if (!!attrs.hasOwnProperty('allowFraction')) {
                pattern = '[^0-9,.]';
            }
            var transformedInput = inputValue.replace(new RegExp(pattern, 'g'), '');
            if (transformedInput !== inputValue) {
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
            }
            return transformedInput;
        });
    };
    return {
        require: 'ngModel',
        link: catNumbersOnlyLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.numbersOnly:numbersOnly
 */
angular.module('cat.directives.numbersOnly', [])
    .directive('numbersOnly', [
    catNumbersOnlyDirectiveFactory
]);

/**
 * @name CatApiEndpoint
 *
 * @description
 * A CatApiEndpoint wraps several helper functions to easily execute backend calls for the base CRUD operations.
 * It also adds support for 'children' which can only be used by resolving them for a parent id.
 * @param {string} url the base url which is added before the configured urls
 * @param {object} endpointConfig the configuration of this endpoint - holds properties like name, url, the model and children
 * @param {object} $http the angular $http service which handles the actual xhr requests
 * @param {object} catConversionService the catConversionService used to convert from and to server side data
 * @param {object} catSearchService the catSearchService for handling all operations concerning cat.uitl.SearchRequest objects
 * @constructor
 */
var CatApiEndpoint = (function () {
    function CatApiEndpoint(url, endpointConfig, $http, catConversionService, catSearchService) {
        var _this = this;
        this.$http = $http;
        this.catConversionService = catConversionService;
        this.catSearchService = catSearchService;
        /**
         * This helper function initializes all configured child endpoints by creating the appropriate url by appending
         * the given id before initializing them.
         * @return {object} a object holding all resolved child endpoints for the given id
         * @private
         */
        this._res = _.memoize(function (id) {
            var url = _this._endpointUrl + '/' + id + '/';
            var ret = {};
            _.forEach(_.keys(_this._childEndpointSettings), function (path) {
                ret[path] = new CatApiEndpoint(url, _this._childEndpointSettings[path], _this.$http, _this.catConversionService, _this.catSearchService);
                ret[path].parentEndpoint = _this;
                ret[path].parentId = id;
                ret[path].parentInfo = function () {
                    return _this.info(id);
                };
            });
            return ret;
        });
        this.config = endpointConfig.config;
        this._endpointName = endpointConfig.name;
        this._endpointUrl = "" + url + (this.config.url || endpointConfig.name);
        this._childEndpointSettings = endpointConfig.children;
        this._endpointListConfig = this.config.list || {};
        /**
         * This method executes a GET request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param searchRequest an optional cat.SearchRequest to be applied to the request
         * @return {*} The promise returned by the $http.get call
         */
        var get = function (url, searchRequest) {
            return _this.$http.get([_this._endpointUrl, url].join('/') + _this._getSearchQuery(searchRequest));
        };
        /**
         * This method executes a POST request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param object hte object to send as payload - not that it will be used as is for this request
         * @return {*} The promise returned by the $http.post call
         */
        var post = function (url, object) {
            return _this.$http.post([_this._endpointUrl, url].join('/'), object);
        };
        /**
         * This method executes a PUT request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param object hte object to send as payload - not that it will be used as is for this request
         * @return {*} The promise returned by the $http.put call
         */
        var put = function (url, object) {
            return _this.$http.put([_this._endpointUrl, url].join('/'), object);
        };
        this.custom = {
            get: get,
            put: put,
            post: post
        };
    }
    CatApiEndpoint.prototype._addChildEndpoints = function (data) {
        _.merge(data, this._res(data.id));
    };
    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    CatApiEndpoint.prototype._mapResponse = function (data) {
        var _this = this;
        var object = this.catConversionService.toClient(data, this.config);
        if (!_.isUndefined(object.id)) {
            this._addChildEndpoints(object);
        }
        if (_.isArray(object)) {
            _.forEach(object, function (item) { return _this._addChildEndpoints(item); });
        }
        if (_.isArray(object.elements)) {
            _.forEach(object.elements, function (item) { return _this._addChildEndpoints(item); });
        }
        return object;
    };
    /**
     * This helper methods deletes all child endpoints from the given object.
     * @param {object} object the object to remove the child endpoints from
     * @return {object} the passed in object without the child endpoints
     * @private
     */
    CatApiEndpoint.prototype._removeEndpoints = function (object) {
        var endpoints = this._res(object.id);
        _.forEach(_.keys(endpoints), function (key) {
            delete object[key];
        });
        return object;
    };
    /**
     * This helper method turns a cat.SearchRequest in to en url encoded search query
     * @param {window.cat.SearchRequest} [searchRequest] the search request which should be url encoded
     * @return {string} either the url encoded search query or an empty string if no search request is given or it is not a instance of cat.SearchRequest
     * @private
     */
    CatApiEndpoint.prototype._getSearchQuery = function (searchRequest) {
        if (!!searchRequest && searchRequest instanceof window.cat.SearchRequest) {
            return '?' + this.catSearchService.encodeAsUrl(searchRequest);
        }
        return '';
    };
    /**
     * This method is used to instantiate actual child api endpoints which are dependent on a certain parent id
     * @param id the id for which to 'resolve' the child endpoints.
     * @return {object} a object which maps all child endpoint names to the actual endpoints where the url was resolved
     * with the provided id
     */
    CatApiEndpoint.prototype.res = function (id) {
        return this._res(id);
    };
    /**
     * A small helper function to retrieve the actual url this endpoint resolved to.
     * @return {string} the resolved url of this endpoint
     */
    CatApiEndpoint.prototype.getEndpointUrl = function () {
        return this._endpointUrl;
    };
    /**
     * A small helper to retrieve the name of the endpoint.
     * @return {string} the name of this endpoint
     */
    CatApiEndpoint.prototype.getEndpointName = function () {
        return this._endpointName;
    };
    /**
     * This function calls by default the url available via #getEndpointUrl without further modification apart from
     * adding search parameters if the searchRequest parameter is provided. In addition an alternative  endpoint url can
     * be configured with `endpoint.list.endpoint`, such that the request will be send to another endpoint url.
     * (#getEndpointUrl + additional_url).
     * It can handle either an array response in which case all elements will be
     * mapped to the appropriate configured model or a 'paginated' result in which case an object with totalCount,
     * facests and elements will be returned.
     *
     * @param {SearchRequest} [searchRequest] if given searchRequest#urlEncoded() will be added to the request url
     * @return {[{object}]|{totalCount: {Number}, facets: [{Facet}], elements: []}} a promise wrapping either a list of
     * instances of the configured model or a wrapper object which holds not only the list but pagination information
     * as well
     */
    CatApiEndpoint.prototype.list = function (searchRequest) {
        var _this = this;
        var url = !!this._endpointListConfig.endpoint ? this._endpointListConfig.endpoint : '';
        return this.$http.get(this._endpointUrl + url + this._getSearchQuery(searchRequest)).then(function (response) {
            return _this._mapResponse(response.data);
        });
    };
    /**
     * A helper function which adds '/all' to the request url available via #getEndpointUrl and maps the response to
     * the configured model.
     * @return [{object}] a promise wrapping an array of new instances of the configured model initialized with the data retrieved from
     * the backend
     */
    CatApiEndpoint.prototype.all = function () {
        var _this = this;
        return this.$http.get(this._endpointUrl + '/all').then(function (response) {
            return _.map(response.data, function (elem) {
                return _this._mapResponse(elem);
            });
        });
    };
    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of the provided id at the end.
     * @param id the id which will be appended as '/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    CatApiEndpoint.prototype.get = function (id) {
        var _this = this;
        return this.$http.get(this._endpointUrl + '/' + id).then(function (response) {
            return _this._mapResponse(response.data);
        });
    };
    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of '/copy' and the provided id at the end.
     * @param id the id which will be appended as '/copy/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    CatApiEndpoint.prototype.copy = function (id) {
        var _this = this;
        return this.$http.get(this._endpointUrl + '/copy/' + id).then(function (response) {
            return _this._mapResponse(response.data);
        });
    };
    /**
     * This method makes a GET the url available via #getEndpointUrl with the addition of the provided id at the end + the
     * 'info' request parameter.
     * @param id the id which will be appended as '/:id' to the url
     * @return {*} a promise wrapping the data retrieved from the backend
     */
    CatApiEndpoint.prototype.info = function (id) {
        return this.$http.get(this._endpointUrl + '/' + id + '?info').then(function (response) {
            return response.data;
        });
    };
    /**
     * This method is either makes a PUT or POST request to the backend depending on wheter or not the given object
     * has an 'id' attribute.
     * For PUT requests the url resolves to #getEndpointUrl + /:id, for POST requests it is just the #getEndpointUrl
     * @param {object} object the object which should be sent to the sever. it is stripped of all child endpoints before
     * it is sent.
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    CatApiEndpoint.prototype.save = function (object) {
        var _this = this;
        var t = _([34, 342]).value();
        if (!!object.id) {
            return this.$http.put(this._endpointUrl + '/' + object.id, this._removeEndpoints(object)).then(function (response) {
                return _this._mapResponse(response.data);
            });
        }
        else {
            return this.$http.post(this._endpointUrl, this._removeEndpoints(object)).then(function (response) {
                return _this._mapResponse(response.data);
            });
        }
    };
    /**
     * This method executes a DELETE request to the url available via #getEndpointUrl with the addition of the provided url at the end.
     * @param url the url to be appended to the endpoint url - usually only the id of the object to delete
     * @return {*} The promise returned by the $http 'DELETE' call
     */
    CatApiEndpoint.prototype.remove = function (url) {
        return this.$http({ method: 'DELETE', url: this._endpointUrl + '/' + url });
    };
    return CatApiEndpoint;
})();
/**
 * @ngdoc service
 * @name EndpointConfig
 *
 * @description
 * An 'EndpointConfig' basically is a wrapper around the configuration for an api endpoint during the configuration
 * phase which is later used to instantiate the actual CatApiEndpoints. It exposes its name, the configuration itself,
 * as well as a map of all its children and helper function to create or receive child endpoint configurations.
 *
 * @param {string} name the name of the endpoint
 * @param {object} config the api endpoint configuration which basically wraps an 'url' and a 'model' attribute.
 * If a 'children' attribute is present as well it will be used to create the appropriate child endpoints automatically,
 * without the need to call the #child method manually - this works to arbitrary deps.
 * @constructor
 */
var EndpointConfig = (function () {
    function EndpointConfig(name, config) {
        var _this = this;
        if (config === void 0) { config = {}; }
        this.name = name;
        this.config = config;
        this.children = {};
        // this takes care of mapping the 'old' config style to the new builder style
        if (!_.isUndefined(config.children)) {
            var childrenConfig = config.children;
            delete config.children;
            _.forEach(_.keys(childrenConfig), function (childName) {
                _this.child(childName, childrenConfig[childName]);
            });
        }
    }
    /**
     * This method method either returns or creates and returns a child api endpoint of the current one.
     *
     * @param {string} childName the name of the child endpoint
     * @param {object} [childConfig] if given a new EndpointConfig will be created as a child of the current one. The
     * parent property of the created config will point to the current config
     * @return {EndpointConfig} the child endpoint config with the given name
     */
    EndpointConfig.prototype.child = function (childName, childConfig) {
        if (!_.isUndefined(childConfig)) {
            this.children[childName] = new EndpointConfig(childName, childConfig);
            this.children[childName].parent = this;
        }
        return this.children[childName];
    };
    return EndpointConfig;
})();
var CatApiServiceProvider = (function () {
    function CatApiServiceProvider() {
        this._endpoints = {};
        this.$get = ['$http', 'catConversionService', 'catSearchService', 'CAT_API_SERVICE_DEFAULTS', this.$getCatApiService];
    }
    /**
     * This method is used to either create or retrieve named endpoint configurations.
     * @param {string} name the name of the api endpoint to create or retrieve the configuration for
     * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
     * @return {EndpointConfig} the endpoint config for the given name
     */
    CatApiServiceProvider.prototype.endpoint = function (name, settings) {
        if (!_.isUndefined(settings)) {
            this._endpoints[name] = new EndpointConfig(name, settings);
        }
        return this._endpoints[name];
    };
    /**
     * @return {object} returns a map from names to CatApiEndpoints
     */
    CatApiServiceProvider.prototype.$getCatApiService = function ($http, catConversionService, catSearchService, CAT_API_SERVICE_DEFAULTS) {
        var _this = this;
        var catApiService = {};
        var dynamicEndpoints = {};
        /**
         * This method allows to define (dynamic) endpoints after the configuration phase.
         * @param {string} name (optional the name of the api endpoint to create or retrieve the configuration for
         * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
         * @returns {CatApiEndpoint}
         */
        catApiService['dynamicEndpoint'] = function (name, settings) {
            if (typeof name === 'object' && _.isUndefined(settings)) {
                settings = name;
                name = settings.url;
            }
            if (_.isUndefined(dynamicEndpoints[name])) {
                if (_.isUndefined(settings)) {
                    throw new Error('Undefined dynamic endpoint settings');
                }
                dynamicEndpoints[name] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix, new EndpointConfig(name, settings), $http, catConversionService, catSearchService);
            }
            return dynamicEndpoints[name];
        };
        _.forEach(_.keys(this._endpoints), function (path) {
            catApiService[path] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix, _this._endpoints[path], $http, catConversionService, catSearchService);
        });
        return catApiService;
    };
    return CatApiServiceProvider;
})();
/**
 * @ngdoc service
 * @name cat.service.api:catApiService
 *
 * @description
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
angular
    .module('cat.service.api', ['cat.service.conversion', 'cat.service.search'])
    .constant('CAT_API_SERVICE_DEFAULTS', { endpointUrlPrefix: 'api/' })
    .provider('catApiService', [CatApiServiceProvider]);
/**
 * @ngdoc service
 * @name cat.service.api:$api
 * @deprecated use 'catApiService'
 *
 * @description
 * deprecated use 'catApiService'
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
// $api is deprecated, will be removed in a future release
angular
    .module('cat.service.api')
    .provider('$api', [CatApiServiceProvider]);

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
var CatBreadcrumbsService = (function () {
    function CatBreadcrumbsService(catBreadcrumbs, $state) {
        this.catBreadcrumbs = catBreadcrumbs;
        this.$state = $state;
    }
    CatBreadcrumbsService.prototype.clear = function () {
        this.catBreadcrumbs.length = 0;
    };
    CatBreadcrumbsService.prototype.set = function (bcs) {
        var _this = this;
        this.clear();
        _.forEach(bcs, function (bc) {
            _this.catBreadcrumbs.push(bc);
        });
    };
    CatBreadcrumbsService.prototype.get = function () {
        return this.catBreadcrumbs;
    };
    CatBreadcrumbsService.prototype.addFirst = function (entry) {
        this.catBreadcrumbs.unshift(entry);
    };
    CatBreadcrumbsService.prototype.removeFirst = function () {
        return this.catBreadcrumbs.shift();
    };
    CatBreadcrumbsService.prototype.push = function (entry) {
        this.catBreadcrumbs.push(entry);
    };
    CatBreadcrumbsService.prototype.pop = function () {
        return this.catBreadcrumbs.pop();
    };
    CatBreadcrumbsService.prototype.length = function () {
        return this.catBreadcrumbs.length;
    };
    CatBreadcrumbsService.prototype.replaceLast = function (newVal) {
        this.catBreadcrumbs[this.catBreadcrumbs.length - 1] = newVal;
    };
    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    CatBreadcrumbsService.prototype.generateFromConfig = function (config) {
        this.clear();
        var uiStack = [];
        var currentState = this.$state.$current['parent'];
        var currentEndpoint = config.endpoint;
        var count = 0;
        var parents = '^';
        while (!!currentState && !!currentState.parent) {
            var stateName = currentState.name;
            if (!/\.tab$/g.test(stateName)) {
                var href = this.$state.href(parents);
                var breadcrumb = void 0;
                if (config.parents.length > count) {
                    var parent_1 = config.parents[count++];
                    var regex = new RegExp('/' + window.cat.util.pluralize(currentEndpoint.getEndpointName()) + '$');
                    href = href.replace(regex, '?tab=' + currentEndpoint.getEndpointName());
                    breadcrumb = {
                        url: href,
                        title: parent_1.name
                    };
                    uiStack.unshift(breadcrumb);
                }
                else {
                    breadcrumb = {
                        title: window.cat.util.capitalize(window.cat.util.pluralize(currentEndpoint.getEndpointName())),
                        key: 'cc.catalysts.cat-breadcrumbs.entry.' + currentEndpoint.getEndpointName(),
                        url: href
                    };
                }
                this.addFirst(breadcrumb);
                currentEndpoint = currentEndpoint.parentEndpoint;
            }
            currentState = currentState.parent;
            parents += '.^';
        }
        return uiStack;
    };
    return CatBreadcrumbsService;
})();
angular
    .module('cat.service.breadcrumbs', [])
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', [
    'catBreadcrumbs',
    '$state',
    CatBreadcrumbsService
]);

/**
 * @ngdoc service
 * @name cat.service.conversion:catConversionService
 * @module cat.service.conversion
 *
 * @description
 * This service handles the transformation between server and client side data.
 *
 * @constructor
 */
var CatConversionService = (function () {
    function CatConversionService(catConversionFunctions) {
        this.catConversionFunctions = catConversionFunctions;
    }
    CatConversionService.prototype.toClient = function (serverData, context) {
        return this.catConversionFunctions.toClient(serverData, context);
    };
    CatConversionService.prototype.toServer = function (clientData) {
        return this.catConversionFunctions.toServer(clientData);
    };
    return CatConversionService;
})();
function _convertToClientModel(data, context) {
    if (!_.isUndefined(context) && _.isFunction(context.model)) {
        return new context.model(data);
    }
    return data;
}
function _convertToClientData(serverData, context) {
    if (_.isUndefined(serverData)) {
        return undefined;
    }
    if (_.isArray(serverData)) {
        return _.map(serverData, function (data) {
            return _convertToClientModel(data, context);
        });
    }
    if (_.isNumber(serverData.totalCount)) {
        var copy = _.clone(serverData);
        var facets = [];
        if (!!serverData.facets) {
            facets = _.map(serverData.facets, function (facet) {
                return new window.cat.Facet(facet);
            });
        }
        var result = {
            totalCount: serverData.totalCount,
            facets: facets,
            elements: _.map(serverData.elements, function (elem) {
                return _convertToClientData(elem, context);
            })
        };
        delete copy.totalCount;
        delete copy.elements;
        delete copy.facets;
        return _.assign(result, copy);
    }
    if (!_.isUndefined(context)) {
        return _convertToClientModel(serverData, context);
    }
    return serverData;
}
angular.module('cat.service.conversion', [])
    .value('catConversionFunctions', {
    toClient: _convertToClientData,
    toServer: function (clientData, context) {
        return clientData;
    }
})
    .service('catConversionService', [
    'catConversionFunctions',
    CatConversionService
]);

/**
 * @ngdoc service
 * @name cat.service.elementVisibility:catElementVisibilityService
 * @service
 *
 * @description
 * This service provides a entry point for handling the visibility of ui elements.
 * The basic implementation always returns true and is intended to be decorated accordingly within production environments.
 *
 * @constructor
 */
var CatElementVisibilityService = (function () {
    function CatElementVisibilityService() {
    }
    CatElementVisibilityService.prototype.isVisible = function () {
        return true;
    };
    return CatElementVisibilityService;
})();
angular
    .module('cat.service.elementVisibility', [])
    .service('catElementVisibilityService', [
    CatElementVisibilityService
]);

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nLocaleService
 * @module cat.service.i18n
 */
var CatI18nLocaleService = (function () {
    function CatI18nLocaleService($locale, CAT_I18N_DEFAULT_LOCALE) {
        this.$locale = $locale;
        this.CAT_I18N_DEFAULT_LOCALE = CAT_I18N_DEFAULT_LOCALE;
    }
    CatI18nLocaleService.prototype.getLanguageOfLocale = function (locale) {
        if (_.isUndefined(locale)) {
            return undefined;
        }
        if (locale.indexOf('-') !== -1) {
            return locale.split('-')[0];
        }
        return locale;
    };
    CatI18nLocaleService.prototype.getCurrentLocale = function () {
        return this.$locale.id;
    };
    CatI18nLocaleService.prototype.getDefaultLocale = function () {
        return this.CAT_I18N_DEFAULT_LOCALE;
    };
    return CatI18nLocaleService;
})();
angular
    .module('cat.service.i18n.locale', [])
    .constant('CAT_I18N_DEFAULT_LOCALE', 'de')
    .service('catI18nLocaleService', [
    '$locale',
    'CAT_I18N_DEFAULT_LOCALE',
    CatI18nLocaleService
]);

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nMessageSourceService
 * @module cat.service.i18n
 * @service
 *
 * @description
 * A service to retrieve message templates for a given key and locale
 *
 * @param {object} $q DOCTODO
 * @param {object} catI18nLocaleService DOCTODO
 * @param {string} CAT_I18N_DEFAULT_LOCALE DOCTODO
 * @constructor
 */
var CatI18nMessageSourceService = (function () {
    function CatI18nMessageSourceService($q, catI18nLocaleService, CAT_I18N_DEFAULT_LOCALE) {
        this.$q = $q;
        this.catI18nLocaleService = catI18nLocaleService;
        this.CAT_I18N_DEFAULT_LOCALE = CAT_I18N_DEFAULT_LOCALE;
    }
    CatI18nMessageSourceService.prototype._getLocale = function (locale) {
        return locale || this.catI18nLocaleService.getDefaultLocale();
    };
    CatI18nMessageSourceService.prototype._getMessages = function (locale) {
        var localeId = this._getLocale(locale);
        var messages = window.cat.i18n[localeId];
        if (_.isUndefined(messages)) {
            messages = this._getMessages(this.catI18nLocaleService.getDefaultLocale());
        }
        if (localeId !== this.CAT_I18N_DEFAULT_LOCALE && _.isUndefined(messages)) {
            messages = this._getMessages(this.CAT_I18N_DEFAULT_LOCALE);
        }
        return messages;
    };
    /**
     * @ngdoc function
     * @name getMessages
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message bundle for a given locale
     *
     * @param {String} [locale] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message bundle
     */
    CatI18nMessageSourceService.prototype.getMessages = function (locale) {
        return this.$q.when(this._getMessages(locale));
    };
    /**
     * @ngdoc function
     * @name getMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message for a given key and locale
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message
     */
    CatI18nMessageSourceService.prototype.getMessage = function (key, locale) {
        var bundle = this._getMessages(locale);
        if (_.isUndefined(bundle) || _.isUndefined(bundle[key])) {
            return this.$q.reject('No message found for key \'' + key + '\' and the given locale \'' + this._getLocale(locale) + '\'');
        }
        return this.$q.when(bundle[key]);
    };
    /**
     * @ngdoc function
     * @name hasMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which checks whether or not a message for a given key and locale exists
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be available
     * @returns {Promise} a promise holding <code>TRUE</code> if the key can be resolved for the given locale
     */
    CatI18nMessageSourceService.prototype.hasMessage = function (key, locale) {
        var bundle = this._getMessages(locale);
        return this.$q.when(!_.isUndefined(bundle) && !_.isUndefined(bundle[key]));
    };
    return CatI18nMessageSourceService;
})();
angular
    .module('cat.service.i18n.message', [
    'cat.service.i18n.locale'
])
    .service('catI18nMessageSourceService', [
    '$q',
    'catI18nLocaleService',
    'CAT_I18N_DEFAULT_LOCALE',
    CatI18nMessageSourceService
]);

var CatI18nResponseHandler = (function () {
    function CatI18nResponseHandler() {
    }
    CatI18nResponseHandler.prototype.handleTranslationSuccess = function (translation, scope, element) {
        element.text(translation);
    };
    CatI18nResponseHandler.prototype.handleTranslationError = function (reason, scope, element) {
        element.text('##missingkey: ' + scope.key);
    };
    return CatI18nResponseHandler;
})();
/**
 * @ngdoc service
 * @name cat.directives.i18n.responseHandler:catI18nResponseHandler
 */
angular
    .module('cat.service.i18n.responseHandler', [])
    .service('catI18nResponseHandler', [
    CatI18nResponseHandler
]);

/**
 * Created by tscheinecker on 21.10.2014.
 */
var CatI18nService = (function () {
    function CatI18nService($q, $log, catI18nMessageSourceService, catI18nMessageParameterResolver) {
        this.$q = $q;
        this.$log = $log;
        this.catI18nMessageSourceService = catI18nMessageSourceService;
        this.catI18nMessageParameterResolver = catI18nMessageParameterResolver;
    }
    /**
     * @name catI18nService#translate
     * @function
     *
     * @description
     * Tries to resolve the given key to a message of the given locale. The messages are retrieved from the
     * {@link catI18nMessageSourceService} and then passed through {@link catI18nMessageParameterResolver}.
     *
     * @param {String} key the key of the message to be translated
     * @param {Object|Array} [parameters] message parameters usable in the resolved message
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale to use for translation
     * @returns {promise} Returns a promise of the translated key
     */
    CatI18nService.prototype.translate = function (key, parameters, locale) {
        var _this = this;
        var model = parameters;
        if (_.isArray(parameters)) {
            parameters.forEach(function (value, idx) {
                model['p' + idx] = value;
            });
        }
        return this
            .canTranslate(key, locale)
            .then(function (canTranslate) {
            if (canTranslate) {
                return _this.catI18nMessageSourceService.getMessage(key, locale);
            }
            else {
                var reason = 'No translation for key \'' + key + '\' available!';
                return _this.$q.reject(reason);
            }
        })
            .then(function (message) {
            var translation = _this.catI18nMessageParameterResolver(message, model);
            if (_.isString(translation)) {
                return translation;
            }
            else {
                _this.$log.warn('Didn\'t get a string from catI18nMessageParameterResolver');
                return _this.$q.reject(translation);
            }
        })
            .then(undefined, function (reason) {
            _this.$log.warn(reason);
            return _this.$q.reject(reason);
        });
    };
    /**
     * @name catI18nService#canTranslate
     * @function
     *
     * @description
     * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
     * This is useful when you are dealing with an object that might or might not be a promise, or if
     * the promise comes from a source that can't be trusted.
     *
     * @param {String} key the key of the message to be translated
     * @param {String} [locale] the locale to use for translation
     * @returns {promise} Returns a promise which resolves to true when a message for the given key exists for the
     * specified locale
     */
    CatI18nService.prototype.canTranslate = function (key, locale) {
        return this.catI18nMessageSourceService
            .getMessages(locale)
            .then(function (messages) {
            return !_.isUndefined(messages) && !_.isUndefined(messages[key]);
        });
    };
    return CatI18nService;
})();
angular
    .module('cat.service.i18n', [
    'cat.service.i18n.message',
    'cat.service.i18n.responseHandler'
])
    .value('catI18nMessageParameterResolver', function (message, parameters) {
    return _.template(message, { interpolate: /{{([\s\S\d]+?)}}/g })(parameters || {});
})
    .service('catI18nService', [
    '$q',
    '$log',
    'catI18nMessageSourceService',
    'catI18nMessageParameterResolver',
    CatI18nService
]);

var CatListDataLoadingService = (function () {
    function CatListDataLoadingService($location, $q, catApiService, catSearchService) {
        this.$location = $location;
        this.$q = $q;
        this.catApiService = catApiService;
        this.catSearchService = catSearchService;
    }
    CatListDataLoadingService.prototype.load = function (endpoint, searchRequest) {
        return endpoint
            .list(searchRequest)
            .then(function (data) {
            var pagination = searchRequest.pagination();
            var result = {
                count: data.totalCount,
                collection: data.elements,
                pagination: pagination,
                firstResult: (pagination.page - 1) * pagination.size + 1,
                lastResult: Math.min(pagination.page * pagination.size, data.totalCount),
                facets: data.facets,
                isSinglePageList: data.totalCount <= pagination.size,
                endpoint: endpoint,
                searchRequest: searchRequest
            };
            delete data.totalCount;
            delete data.elements;
            delete data.facets;
            return _.assign(result, data);
        });
    };
    /**
     *
     * @param {String} endpointName
     * @param {Object} [defaultSort={property:'name',isDesc:false}]
     */
    CatListDataLoadingService.prototype.resolve = function (endpointName, defaultSort) {
        if (defaultSort === void 0) { defaultSort = { property: 'name', isDesc: false }; }
        var searchRequest = this.catSearchService.fromLocation();
        if (!this.$location.search().sort) {
            searchRequest.sort(defaultSort);
        }
        return this.load(this.catApiService[endpointName], searchRequest);
    };
    return CatListDataLoadingService;
})();
/**
 * @ngdoc service
 * @name cat.service.listDataLoading:catListDataLoadingService
 */
angular
    .module('cat.service.listDataLoading', [
    'cat.service.api',
    'ui.router'
])
    .service('catListDataLoadingService', [
    '$location',
    '$q',
    'catApiService',
    'catSearchService',
    CatListDataLoadingService
]);

/**
 * @ngdoc service
 * @name cat.service.route:catRouteServiceProvider
 * @description
 * This service provider delegates to the $stateProvider and actually creates 2 separate routes after applying letious
 * conventions / defaults
 */
var CatRouteServiceProvider = (function () {
    CatRouteServiceProvider.$inject = ["$stateProvider"];
    function CatRouteServiceProvider($stateProvider) {
        var _this = this;
        this.$stateProvider = $stateProvider;
        this.viewNames = [];
        /**
         * @ngdoc service
         * @name cat.service.route:catRouteService
         * @module cat.service.route
         *
         * @description
         * This service simply exposes the created view and endpoint names, as the provider basically only delegates
         * to the $stateProvider
         */
        this.$get = [function () {
                return _this.viewNames;
            }];
    }
    CatRouteServiceProvider._getListUrl = function (baseUrl, name, config) {
        var listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());
        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url;
        }
        return listUrl;
    };
    CatRouteServiceProvider.prototype._registerAbstractState = function (url, name) {
        this.$stateProvider
            .state(name, {
            abstract: true,
            template: '<ui-view></ui-view>',
            url: url
        });
    };
    CatRouteServiceProvider._getStateName = function (name, config) {
        if (!!config && !!config.parent) {
            return config.parent + '.' + name;
        }
        return name;
    };
    CatRouteServiceProvider.prototype._registerDetailState = function (config, name) {
        var stateName = CatRouteServiceProvider._getStateName(name, config);
        var detailConfig = this._getDetailConfig(config, name);
        this.$stateProvider
            .state(stateName + '.detail', detailConfig);
        if (!!config && config.additionalViewTemplate === 'tabs') {
            this.$stateProvider
                .state(stateName + '.tab', {
                abstract: true,
                template: '<ui-view></ui-view>',
                url: '/:' + name.toLowerCase() + 'Id'
            });
        }
    };
    CatRouteServiceProvider.prototype._registerListState = function (config, name) {
        var stateName = CatRouteServiceProvider._getStateName(name, config);
        var listConfig = this._getListConfig(config, name);
        this.$stateProvider
            .state(stateName + '.list', listConfig);
    };
    /**
     * A helper function for detail routes which applies a few optimizations and some auto configuration.
     * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
     * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
     * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
     * object which pre-loads all the necessary data.
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the state
     * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
     */
    CatRouteServiceProvider.prototype._getDetailConfig = function (config, name) {
        var _config = _.assign({ name: name }, config);
        return {
            url: _config.url || '/:id',
            templateUrl: _config.templateUrl || 'template/cat-base-detail.tpl.html',
            controller: 'CatBaseDetailController',
            reloadOnSearch: _config.reloadOnSearch,
            resolve: {
                config: function ($stateParams, catViewConfigService) {
                    // TODO $stateParams needs to be passed from here because otherwise it's empty...
                    return catViewConfigService.getDetailConfig(_config, $stateParams);
                }
            }
        };
    };
    /**
     * A helper function for list routes which applies a few optimizations and some auto configuration.
     * In the current state it handles 4 settings:
     * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
     * * controller - Auto-generation of the correct controller based on conventions and the config.name property
     * * reloadOnSearch - this property is set to false
     * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
     *
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the sate
     * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
     */
    CatRouteServiceProvider.prototype._getListConfig = function (config, name) {
        var _config = _.assign({ name: name }, config);
        return {
            url: _config.url || '',
            reloadOnSearch: false,
            controller: 'CatBaseListController',
            controllerAs: 'catBaseListController',
            templateUrl: _config.templateUrl || 'template/cat-base-list.tpl.html',
            resolve: {
                config: function (catViewConfigService) {
                    return catViewConfigService.getListConfig(_config);
                }
            }
        };
    };
    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route url via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    CatRouteServiceProvider.prototype.detailRoute = function (baseUrl, name, config) {
        var stateName = CatRouteServiceProvider._getStateName(name, config);
        var viewData = { viewData: !!config ? (config.viewData || {}) : {} };
        this.viewNames.push(stateName);
        var listUrl = CatRouteServiceProvider._getListUrl(baseUrl, name, config);
        this._registerAbstractState(listUrl, stateName);
        this._registerDetailState(_.assign({}, config, viewData), name);
    };
    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    CatRouteServiceProvider.prototype.listAndDetailRoute = function (baseUrl, name, config) {
        if (config === void 0) { config = {}; }
        var stateName = CatRouteServiceProvider._getStateName(name, config);
        var viewData = { viewData: config.viewData || {} };
        this.viewNames.push(stateName);
        var listUrl = CatRouteServiceProvider._getListUrl(baseUrl, name, config);
        this._registerAbstractState(listUrl, stateName);
        this._registerDetailState(_.assign({}, config.details, viewData), name);
        this._registerListState(_.assign({}, config.list, viewData), name);
    };
    return CatRouteServiceProvider;
})();
angular
    .module('cat.service.route', [
    'ui.router',
    'cat.service.message',
    'cat.service.breadcrumbs',
    'cat.service.validation'
])
    .provider('catRouteService', CatRouteServiceProvider)
    .run(['$rootScope', '$log', '$globalMessages', 'catBreadcrumbsService', 'catValidationService',
    function ($rootScope, $log, $globalMessages, catBreadcrumbsService, catValidationService) {
        $rootScope.$on('$stateChangeError', function () {
            var exception = arguments[arguments.length - 1];
            $globalMessages.addMessage('warning', exception);
            $log.warn(exception);
        });
        $rootScope.$on('$stateChangeSuccess', function () {
            catBreadcrumbsService.clear();
            catValidationService.clearValidationErrors();
        });
    }]);

/**
 * Created by Thomas on 08/03/2015.
 */
var CatUrlEncodingService = (function () {
    function CatUrlEncodingService() {
    }
    CatUrlEncodingService.prototype.encodeAsUrl = function (params) {
        if (!!params && !_.isEmpty(params)) {
            return $.param(params);
        }
        return '';
    };
    return CatUrlEncodingService;
})();
var CatSearchService = (function () {
    function CatSearchService($location, catUrlEncodingService) {
        this.$location = $location;
        this.catUrlEncodingService = catUrlEncodingService;
    }
    CatSearchService._encodeSort = function (_sort) {
        return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
    };
    CatSearchService._encodePagination = function (_pagination) {
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
    };
    CatSearchService.prototype._encodeSearch = function (_search) {
        return this.catUrlEncodingService.encodeAsUrl(_search);
    };
    CatSearchService.prototype.urlEndoded = function (searchRequest) {
        return _([
            CatSearchService._encodePagination(searchRequest.pagination()),
            CatSearchService._encodeSort(searchRequest.sort()),
            this._encodeSearch(searchRequest.search())
        ]).reduce(CatSearchService._concatenate);
    };
    CatSearchService._concatenate = function (result, next) {
        if (!result) {
            return next;
        }
        if (!next) {
            return result;
        }
        return result + '&' + next;
    };
    /**
     * @ngdoc function
     * @name encodeAsUrl
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request to encode as url
     *
     * @description
     * This methods returns an url encoded version of the given search request
     */
    CatSearchService.prototype.encodeAsUrl = function (searchRequest) {
        if (!searchRequest) {
            return '';
        }
        return this.urlEndoded(searchRequest);
    };
    /**
     * @ngdoc function
     * @name updateLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request from which to update the $location service
     *
     * @description
     * This methods updates the browsers address bar via the $location service to reflect the given SearchRequest
     */
    CatSearchService.prototype.updateLocation = function (searchRequest) {
        if (!searchRequest) {
            return;
        }
        var pagination = searchRequest.pagination();
        var sort = searchRequest.sort();
        var search = searchRequest.search();
        var ret = {};
        ret.page = pagination.page;
        ret.size = pagination.size;
        if (!!sort.property) {
            ret.sort = sort.property;
            ret.rev = sort.isDesc || false;
        }
        _.forEach(_.keys(search), function (s) {
            ret['search.' + s] = search[s];
        });
        this.$location.search(ret);
    };
    /**
     * @ngdoc function
     * @name fromLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @description
     * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
     */
    CatSearchService.prototype.fromLocation = function () {
        return new window.cat.SearchRequest(this.$location.search());
    };
    return CatSearchService;
})();
/**
 * @ngdoc overview
 * @name cat.service.search
 */
angular.module('cat.service.search', [])
    .service('catUrlEncodingService', [
    CatUrlEncodingService
])
    .service('catSearchService', [
    '$location',
    'catUrlEncodingService',
    CatSearchService
]);

function assignDeep(target, source) {
    return _.assign(target, source, function (targetProperty, sourceProperty) {
        if (_.isObject(targetProperty) && _.isObject(sourceProperty)) {
            return assignDeep(targetProperty, sourceProperty);
        }
        return sourceProperty;
    });
}
/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigService
 * @module cat.service.selectConfig
 *
 * @constructor
 */
var CatSelectConfigService = (function () {
    function CatSelectConfigService(configs) {
        this.configs = configs;
    }
    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigService
     *
     * @description
     *
     * @param {String} name the name of the config to retreive
     * @param {Object} [options] Optional options to use as default values
     * @returns {*} the named config object (with applied defaults) or undefined
     */
    CatSelectConfigService.prototype.getConfig = function (name, options) {
        var config = this.configs[name];
        if (_.isUndefined(config) && _.isUndefined(options)) {
            return undefined;
        }
        return assignDeep(_.clone(config) || {}, options);
    };
    return CatSelectConfigService;
})();
/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigServiceProvider
 * @module cat.service.selectConfig
 *
 * @description
 *
 * @constructor
 */
var CatSelectConfigServiceProvider = (function () {
    function CatSelectConfigServiceProvider() {
        var _this = this;
        this.configs = {};
        this.$get = [function () {
                return new CatSelectConfigService(_this.configs);
            }];
    }
    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigServiceProvider
     *
     * @description
     *
     * @param {String} name the name of the config to save or retrieve
     * @param {Object} [config] The config to save for the given name or undefined to receive the config
     * @returns {*} the named config object
     */
    CatSelectConfigServiceProvider.prototype.config = function (name, config) {
        if (!_.isUndefined(config)) {
            this.configs[name] = config;
        }
        return this.configs[name];
    };
    return CatSelectConfigServiceProvider;
})();
angular
    .module('cat.service.selectConfig', [])
    .provider('catSelectConfigService', [
    CatSelectConfigServiceProvider
]);

/**
 * Created by Mustafa on 05.08.2015.
 */
var CatUrlResolverService = (function () {
    function CatUrlResolverService() {
    }
    CatUrlResolverService.prototype.getTabTemplate = function (tab, config) {
        var parentUrl = config.endpoint.getEndpointName();
        var parentTemplateNamePrefix = config.endpoint.getEndpointName();
        var currentEndpoint = config.endpoint;
        while (!_.isUndefined(currentEndpoint.parentEndpoint)) {
            currentEndpoint = config.endpoint.parentEndpoint;
            var parentEndpointName = currentEndpoint.getEndpointName();
            parentUrl = parentEndpointName + '/' + parentUrl;
            parentTemplateNamePrefix = parentEndpointName + '-' + parentTemplateNamePrefix;
        }
        return parentUrl + '/' + tab + '/' + parentTemplateNamePrefix + '-' + tab + '-list.tpl.html';
    };
    return CatUrlResolverService;
})();
angular
    .module('cat.url.resolver.service', [])
    .service('urlResolverService', [
    CatUrlResolverService
]);

/**
 * Validation Context which holds all information about a validation context
 */
var ValidationContext = (function () {
    /**
     * @param uuid context identifier
     */
    function ValidationContext(uuid) {
        this.uuid = uuid;
        this.fieldErrors = {};
        this.knownFields = [];
    }
    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    ValidationContext.prototype.registerField = function (name) {
        if (this.knownFields.indexOf(name) === -1) {
            this.knownFields.push(name);
        }
    };
    return ValidationContext;
})();
var CatValidationService = (function () {
    function CatValidationService($log, $globalMessages, catValidations, catValidationContexts, catMessagesConfig, catI18nService) {
        this.$log = $log;
        this.$globalMessages = $globalMessages;
        this.catValidations = catValidations;
        this.catValidationContexts = catValidationContexts;
        this.catMessagesConfig = catMessagesConfig;
        this.catI18nService = catI18nService;
    }
    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    CatValidationService.prototype.getContext = function (contextId) {
        if (contextId !== undefined) {
            var validations = this.catValidationContexts[contextId];
            if (validations === undefined) {
                throw new Error("Unknown contextId: " + contextId);
            }
            return validations;
        }
        else {
            return this.catValidations;
        }
    };
    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    CatValidationService.prototype.createContext = function () {
        var uuid = window.cat.util.generateUUID();
        this.catValidationContexts[uuid] = new ValidationContext(uuid);
        return uuid;
    };
    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    CatValidationService.prototype.destroyContext = function (contextId) {
        delete this.catValidationContexts[contextId];
    };
    CatValidationService.prototype.updateFromRejection = function (rejection) {
        var _this = this;
        var contextId;
        if (!!rejection.config) {
            contextId = rejection.config.catValidationContextId;
        }
        var context = this.getContext(contextId);
        var fieldErrors = context.fieldErrors = {};
        var rejectionData = rejection.data;
        context.global = undefined;
        if (!rejectionData) {
            this.$log.warn('Network error occurred');
            this.$log.warn(rejection);
            this.catI18nService
                .translate('cc.catalysts.cat-validation-service.networkError')
                .then(function (message) {
                context.global = [message];
            });
            return;
        }
        if (!!rejectionData.fieldErrors) {
            // group by field
            rejectionData.fieldErrors.forEach(function (fieldError) {
                // Allow config to switch between displaying errors at the field and displaying errors at known fields or globally
                if (_this.catMessagesConfig.knownFieldsActive === true) {
                    // If the error is for a known field, show the error at the field.
                    // If not, display it as a global error.
                    if (context.knownFields.indexOf(fieldError.field) !== -1) {
                        fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                        fieldErrors[fieldError.field].push(fieldError.message);
                    }
                    else {
                        rejection.data.globalErrors = rejection.data.globalErrors || [];
                        rejection.data.globalErrors.push(fieldError.message);
                    }
                }
                else {
                    fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                    fieldErrors[fieldError.field].push(fieldError.message);
                }
            });
        }
        if (!!rejectionData.globalErrors) {
            context.global = rejection.data.globalErrors;
            // TODO is this also context dependend? or even necessary?
            this.$globalMessages.addMessages('error', rejection.data.globalErrors);
        }
    };
    CatValidationService.prototype.clearValidationErrors = function (contextId) {
        var context = this.getContext(contextId);
        context.global = undefined;
        context.fieldErrors = {};
    };
    CatValidationService.prototype.hasGlobalErrors = function (contextId) {
        var globalErrors = this.getContext(contextId).global;
        return !!globalErrors && globalErrors.length > 0;
    };
    CatValidationService.prototype.getGlobalErrors = function (contextId) {
        return this.getContext(contextId).global;
    };
    CatValidationService.prototype.hasFieldErrors = function (fieldName, contextId) {
        var fieldErrors = this.getContext(contextId).fieldErrors[fieldName];
        return !!fieldErrors && fieldErrors.length > 0;
    };
    CatValidationService.prototype.hasAnyFieldErrors = function (contextId) {
        var fieldErrors = this.getContext(contextId).fieldErrors;
        return !_.isEmpty(fieldErrors);
    };
    CatValidationService.prototype.getFieldErrors = function (fieldName, contextId) {
        return this.getContext(contextId).fieldErrors[fieldName];
    };
    CatValidationService.prototype.hasErrors = function (contextId) {
        var hasGlobalErrors = this.hasGlobalErrors(contextId);
        var hasFieldErrors = this.hasAnyFieldErrors(contextId);
        return hasGlobalErrors || hasFieldErrors;
    };
    CatValidationService.prototype.prepareConfig = function (contextId, config) {
        return _.assign(config || {}, {
            catValidationContextId: contextId
        });
    };
    return CatValidationService;
})();
/**
 * @ngdoc overview
 * @name cat.service.validation
 *
 * @descripton
 * module wrapping the validation logic
 */
angular.module('cat.service.validation', [
    'cat.service.message',
    'cat.service.i18n'
])
    .value('catValidations', new ValidationContext())
    .value('catValidationContexts', {})
    .service('catValidationService', [
    '$log',
    '$globalMessages',
    'catValidations',
    'catValidationContexts',
    'catMessagesConfig',
    'catI18nService',
    CatValidationService.prototype.constructor
]);

/**
 * @author Thomas Scheinecker, Catalysts GmbH.
 */
var CatViewConfigService = (function () {
    function CatViewConfigService($q, catApiService, catListDataLoadingService) {
        this.$q = $q;
        this.catApiService = catApiService;
        this.catListDataLoadingService = catListDataLoadingService;
    }
    CatViewConfigService.toLowerCaseName = function (name) {
        if (!name) {
            return '';
        }
        return name.toLowerCase();
    };
    CatViewConfigService.prototype.getDetailData = function ($stateParams, Model, endpoint) {
        var detailPromise;
        var detailId = $stateParams.id;
        if (detailId === 'new') {
            detailPromise = this.$q.when(new Model());
        }
        else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    };
    CatViewConfigService.prototype.getEndpoint = function (endpointName, parentEndpointNames, $stateParams) {
        var _this = this;
        var endpoint = this.catApiService[endpointName];
        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName, idx) {
                var currentEndpoint;
                if (idx === 0) {
                    // root api endpoint
                    currentEndpoint = _this.catApiService[parentEndpointName];
                }
                else {
                    // child api endpoint
                    currentEndpoint = endpoint[parentEndpointName];
                }
                endpoint = currentEndpoint.res($stateParams[parentEndpointName + 'Id']);
            });
            endpoint = endpoint[endpointName];
        }
        return endpoint;
    };
    CatViewConfigService.prototype.getParentInfo = function (endpoint) {
        var _this = this;
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            var parents = [];
            return endpoint
                .parentInfo()
                .then(function (parent) {
                parents.push(parent);
                return _this.getParentInfo(endpoint.parentEndpoint);
            })
                .then(function (response) {
                parents.push(response);
                parents = _.flatten(parents);
                return parents;
            });
        }
        else {
            return this.$q.when([]);
        }
    };
    CatViewConfigService.prototype.getDetailConfig = function (config, $stateParams) {
        var endpointName, parentEndpointNames;
        if (_.isString(config.endpoint)) {
            endpointName = config.endpoint;
        }
        else if (_.isObject(config.endpoint)) {
            parentEndpointNames = config.endpoint['parents'];
            endpointName = config.endpoint['name'];
        }
        else {
            endpointName = CatViewConfigService.toLowerCaseName(config.name);
        }
        var Model = config.model || window.cat.util.defaultModelResolver(config.name);
        var parentUrl = '';
        var parentTemplateNamePrefix = '';
        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName) {
                parentUrl += parentEndpointName;
                parentUrl += '/';
                parentTemplateNamePrefix += parentEndpointName;
                parentTemplateNamePrefix += '-';
            });
        }
        var tabs;
        var defaultViewUrl = parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html';
        var templateUrls = {
            edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
            view: defaultViewUrl
        };
        if (config.additionalViewTemplate === true) {
            templateUrls.view = {
                main: defaultViewUrl,
                additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
            };
        }
        else if (config.additionalViewTemplate === 'tabs') {
            templateUrls.view = {
                main: defaultViewUrl,
                additional: 'template/cat-base-additional-details-tabs-view.tpl.html'
            };
            tabs = config.additionalViewTemplateTabs;
        }
        var deferred = this.$q.defer();
        var endpoint = this.getEndpoint(endpointName, parentEndpointNames, $stateParams);
        var resolvedConfig = {
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs
        };
        var detailPromise = this.getDetailData($stateParams, Model, endpoint);
        detailPromise.then(function (data) {
            resolvedConfig.detail = data;
        });
        var parentsPromise = this.getParentInfo(endpoint);
        parentsPromise.then(function (parents) {
            resolvedConfig.parents = parents;
        });
        this.$q.all([detailPromise, parentsPromise]).then(function () {
            deferred.resolve(resolvedConfig);
        }, function (reason) {
            deferred.reject(reason);
        });
        return deferred.promise;
    };
    CatViewConfigService.prototype.getListDataPromise = function (config, name) {
        return this.catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    };
    CatViewConfigService.prototype.getListConfig = function (config) {
        var name = CatViewConfigService.toLowerCaseName(config.name);
        var deferredConfig = this.$q.defer();
        var resolvedConfig = {
            listData: undefined,
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'Controller',
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };
        this.getListDataPromise(config, name).then(function (listData) {
            resolvedConfig.listData = listData;
            deferredConfig.resolve(resolvedConfig);
        });
        return deferredConfig.promise;
    };
    return CatViewConfigService;
})();
angular
    .module('cat.service.view.config', [
    'cat.service.api',
    'cat.service.listDataLoading'
])
    .service('catViewConfigService', [
    '$q',
    'catApiService',
    'catListDataLoadingService',
    CatViewConfigService
]);

/**
 * @ngdoc service
 * @name cat.service.view:catViewService
 * @module cat.service.view
 *
 * @description
 * This service provider can be used to initialize an api endpoint and the according detail and list routes by simply
 * providing a name and a config object.
 *
 * @param {CatRouteServiceProvider} catRouteServiceProvider DOCTODO
 * @param {CatApiServiceProvider} catApiServiceProvider DOCTODO
 * @constructor
 */
var CatViewServiceProvider = (function () {
    function CatViewServiceProvider(catRouteServiceProvider, catApiServiceProvider) {
        var _this = this;
        this.catRouteServiceProvider = catRouteServiceProvider;
        this.catApiServiceProvider = catApiServiceProvider;
        this.viewNames = [];
        this.endpointNames = [];
        /**
         * This service simply exposes the created view and endpoint names, as the provider basically only delegates
         * to other service providers
         * @return {{views: Array, endpoints: Array}}
         */
        this.$get = [function () {
                return {
                    views: _this.viewNames,
                    endpoints: _this.endpointNames
                };
            }];
    }
    /**
     * This function registers a new api endpoint with catApiServiceProvider and a list and detail route with
     * catRouteServiceProvider
     * @param {string} baseUrl the base url which will be prepended to all generated route pats
     * @param {string} name the name used as entry point to all routes and endpoint creations (camel cased)
     * @param {object} [config] the config object which can in turn hold objects used for configuration of the endpoint,
     * detail route or list route
     */
    CatViewServiceProvider.prototype.listAndDetailView = function (baseUrl, name, config) {
        var endpointName = name.toLowerCase();
        var url = window.cat.util.pluralize(endpointName);
        if (!!config) {
            url = config.url || url;
        }
        var endpoint = {
            model: window.cat.util.defaultModelResolver(name),
            url: url
        };
        if (!!config) {
            endpoint = _.assign(endpoint, config.endpoint);
        }
        this.viewNames.push(name);
        this.endpointNames.push(endpointName);
        this.catApiServiceProvider.endpoint(name.toLowerCase(), endpoint);
        this.catRouteServiceProvider.listAndDetailRoute(baseUrl, name, config);
    };
    return CatViewServiceProvider;
})();
angular
    .module('cat.service.view', [
    'cat.service.api',
    'cat.service.route',
    'cat.service.view.config'
])
    .provider('catViewService', [
    'catRouteServiceProvider',
    'catApiServiceProvider',
    CatViewServiceProvider
]);

var CatErrorHttpInterceptor = (function () {
    function CatErrorHttpInterceptor($q, loadingService, catValidationMessageHandler) {
        this.$q = $q;
        this.loadingService = loadingService;
        this.catValidationMessageHandler = catValidationMessageHandler;
    }
    CatErrorHttpInterceptor.prototype.request = function (config) {
        this.loadingService.start();
        return config;
    };
    CatErrorHttpInterceptor.prototype.requestError = function (rejection) {
        this.loadingService.stop();
        return this.$q.reject(rejection);
    };
    CatErrorHttpInterceptor.prototype.response = function (success) {
        this.loadingService.stop();
        return success;
    };
    CatErrorHttpInterceptor.prototype.responseError = function (rejection) {
        this.loadingService.stop();
        this.catValidationMessageHandler.handleRejectedResponse(rejection);
        return this.$q.reject(rejection);
    };
    return CatErrorHttpInterceptor;
})();
function catErrorHttpInterceptorFactory($q, loadingService, catValidationMessageHandler) {
    return new CatErrorHttpInterceptor($q, loadingService, catValidationMessageHandler);
}
angular
    .module('cat.service.httpIntercept', [
    'cat.service.loading',
    'cat.service.validation'
])
    .factory('errorHttpInterceptor', [
    '$q',
    'loadingService',
    'catValidationMessageHandler',
    catErrorHttpInterceptorFactory
])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    }]);

var CatLoadingService = (function () {
    function CatLoadingService($rootScope, $timeout, usSpinnerService, CAT_LOADING_SERVICE_DEFAULTS) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.usSpinnerService = usSpinnerService;
        this.CAT_LOADING_SERVICE_DEFAULTS = CAT_LOADING_SERVICE_DEFAULTS;
        this.activeCount = 0;
        var stateChangeInProgress = false;
        $rootScope.$on('$stateChangeStart', function () {
            if (!stateChangeInProgress) {
                _this.start();
                stateChangeInProgress = true;
            }
        });
        $rootScope.$on('$stateChangeSuccess', function () {
            _this.stop();
            stateChangeInProgress = false;
        });
        $rootScope.$on('$stateChangeError', function () {
            _this.stop();
            stateChangeInProgress = false;
        });
    }
    CatLoadingService.prototype.start = function () {
        var _this = this;
        if (!this.activeCount && !this.startTimer) {
            if (!!this.stopTimer) {
                this.$timeout.cancel(this.stopTimer);
                this.stopTimer = undefined;
            }
            this.startTimer = this.$timeout(function () {
                _this.usSpinnerService.spin('loading-spinner');
                _this.$rootScope['loading'] = true;
                _this.startTime = new Date().getTime();
            }, this.CAT_LOADING_SERVICE_DEFAULTS.timeout);
        }
        this.activeCount++;
    };
    CatLoadingService.prototype.stop = function () {
        var _this = this;
        this.activeCount--;
        if (!this.activeCount && !this.stopTimer) {
            if (!!this.startTimer) {
                this.$timeout.cancel(this.startTimer);
                this.startTimer = undefined;
            }
            var now = new Date().getTime();
            var stopTimeout = this.CAT_LOADING_SERVICE_DEFAULTS.timeout + (Math.max((this.CAT_LOADING_SERVICE_DEFAULTS.animationDuration - (now - this.startTime)), 0));
            this.stopTimer = this.$timeout(function () {
                _this.usSpinnerService.stop('loading-spinner');
                _this.$rootScope['loading'] = false;
            }, stopTimeout);
        }
    };
    return CatLoadingService;
})();
/**
 * @ngdoc service
 * @name cat.service.loading:loadingService
 */
angular.module('cat.service.loading', ['angularSpinner'])
    .constant('CAT_LOADING_SERVICE_DEFAULTS', {
    timeout: 50,
    animationDuration: 200
})
    .service('loadingService', [
    '$rootScope',
    '$timeout',
    'usSpinnerService',
    'CAT_LOADING_SERVICE_DEFAULTS',
    CatLoadingService
]);

var MenuEntry = (function () {
    function MenuEntry(id, options, parent) {
        this.id = id;
        this.options = options;
        this.completeId = parent.completeId + "." + id;
    }
    MenuEntry.prototype.getOptions = function () {
        return this.options;
    };
    MenuEntry.prototype.isGroup = function () {
        return false;
    };
    MenuEntry.prototype.isMenu = function () {
        return false;
    };
    return MenuEntry;
})();
var MenuGroup = (function () {
    function MenuGroup(id, options, parent) {
        this.id = id;
        this.options = options;
        this.menuEntries = [];
        this.completeId = parent.completeId + "." + id;
    }
    MenuGroup.prototype.addMenuEntry = function (menuEntryId, options) {
        this.menuEntries.push(new MenuEntry(menuEntryId, options, this));
    };
    MenuGroup.prototype.getOptions = function () {
        return this.options;
    };
    MenuGroup.prototype.getEntries = function () {
        return _.sortBy(this.menuEntries, function (entry) {
            return entry.getOptions().sortOrder || 10000;
        });
    };
    MenuGroup.prototype.isGroup = function () {
        return true;
    };
    MenuGroup.prototype.isMenu = function () {
        return false;
    };
    MenuGroup.prototype.isSubMenu = function () {
        return (this.options.displayAsSubMenu === true);
    };
    return MenuGroup;
})();
var Menu = (function () {
    function Menu(id, options) {
        this.id = id;
        this.options = options;
        this.menuEntries = [];
        this.menuGroups = {};
        this.completeId = id;
    }
    Menu.prototype.addMenuGroup = function (groupId, options) {
        this.menuGroups[groupId] = new MenuGroup(groupId, options, this);
    };
    Menu.prototype.addMenuEntry = function (groupId, menuEntryId, options) {
        if (_.isUndefined(groupId)) {
            this.menuEntries.push(new MenuEntry(menuEntryId, options, this));
        }
        else {
            this.menuGroups[groupId].addMenuEntry(menuEntryId, options);
        }
    };
    Menu.prototype.getGroups = function () {
        return _.sortBy(_.map(this.menuGroups, function (menuGroup) {
            return menuGroup;
        }), function (menuGroup) {
            return menuGroup.getOptions().sortOrder || 10000;
        });
    };
    Menu.prototype.getEntries = function (groupId) {
        if (_.isUndefined(groupId)) {
            return _.sortBy(this.menuEntries, function (entry) {
                return entry.getOptions().sortOrder || 10000;
            });
        }
        return this.menuGroups[groupId].getEntries();
    };
    Menu.prototype.getFlattened = function () {
        return _.flatten([this.menuEntries, _.map(this.getGroups(), function (group) {
                if (group.getOptions().displayAsSubMenu === true) {
                    group.subEntries = group.getEntries();
                    return [group];
                }
                else {
                    return [group, group.getEntries()];
                }
            })], !!_.flattenDeep);
    };
    Menu.prototype.isMenu = function () {
        return true;
    };
    Menu.prototype.isGroup = function () {
        return false;
    };
    Menu.prototype.getOptions = function () {
        return this.options;
    };
    return Menu;
})();
var MenuBar = (function () {
    function MenuBar(id, options) {
        this.id = id;
        this.options = options;
        this.menus = {};
    }
    MenuBar.prototype.addMenu = function (menuId, options) {
        this.menus[menuId] = new Menu(menuId, options);
    };
    MenuBar.prototype.addMenuGroup = function (menuId, groupId, options) {
        this.menus[menuId].addMenuGroup(groupId, options);
    };
    MenuBar.prototype.addMenuEntry = function (menuId, groupId, menuEntryId, options) {
        this.menus[menuId].addMenuEntry(groupId, menuEntryId, options);
    };
    MenuBar.prototype.getMenus = function () {
        return _.map(this.menus, function (menu) {
            return menu;
        });
    };
    MenuBar.prototype.getOptions = function () {
        return this.options;
    };
    return MenuBar;
})();
/**
 * @ngdoc service
 * @name cat.service.menu:$mainMenu
 * @constructor
 */
var MainMenuProvider = (function () {
    function MainMenuProvider() {
        this.mainMenu = new MenuBar('main.menu', {});
        this.menus = [];
        this._groups = [];
        this._entries = [];
    }
    MainMenuProvider.prototype.menu = function (moduleId, options) {
        this.menus.push({
            menuId: moduleId,
            options: options
        });
    };
    MainMenuProvider.prototype.menuGroup = function (moduleId, groupId, options) {
        this._groups.push({
            menuId: moduleId,
            groupId: groupId,
            options: options
        });
    };
    MainMenuProvider.prototype.menuEntry = function (moduleId, groupId, entryId, options) {
        if (_.isUndefined(options)) {
            options = entryId;
            entryId = groupId;
            groupId = undefined;
        }
        this._entries.push({
            menuId: moduleId,
            groupId: groupId,
            entryId: entryId,
            options: options
        });
    };
    MainMenuProvider.prototype.$get = function () {
        var _this = this;
        _.forEach(this.menus, function (menu) {
            _this.mainMenu.addMenu(menu.menuId, menu.options);
        });
        _.forEach(this._groups, function (group) {
            _this.mainMenu.addMenuGroup(group.menuId, group.groupId, group.options);
        });
        _.forEach(this._entries, function (entry) {
            _this.mainMenu.addMenuEntry(entry.menuId, entry.groupId, entry.entryId, entry.options);
        });
        return this.mainMenu;
    };
    return MainMenuProvider;
})();
angular
    .module('cat.service.menu', [])
    .provider('$mainMenu', [
    MainMenuProvider
]);

var Message = (function () {
    function Message(data) {
        if (data === void 0) { data = {}; }
        this.text = data.text || '';
        this.type = data.type;
        this.timeToLive = data.timeToLive || 0;
    }
    return Message;
})();
/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
var CatMessageService = (function () {
    function CatMessageService($rootScope) {
        var _this = this;
        this.messages = {};
        $rootScope.$on('$stateChangeSuccess', function () {
            _this.clearDeadMessages();
            _this.decreaseTimeToLive();
        });
    }
    CatMessageService.prototype.getMessages = function (type) {
        if (!type) {
            return [];
        }
        return _.map(this.messages[type], function (message) {
            return message.text;
        });
    };
    CatMessageService.prototype.hasMessages = function (type) {
        if (!type) {
            return false;
        }
        return !!this.messages[type] && this.messages[type].length !== 0;
    };
    CatMessageService.prototype.clearMessages = function (type) {
        if (!type) {
            this.messages = {};
            return;
        }
        this.messages[type] = [];
    };
    CatMessageService.prototype.clearDeadMessages = function () {
        for (var type in this.messages) {
            this.messages[type] = _.filter(this.messages[type], function (message) {
                return message.timeToLive > 0;
            });
        }
    };
    CatMessageService.prototype.addMessage = function (type, message, flash) {
        if (flash === void 0) { flash = false; }
        if (!type) {
            return;
        }
        if (!this.messages[type]) {
            this.clearMessages(type);
        }
        this.messages[type].push(new Message({
            text: message,
            type: type,
            timeToLive: flash ? 1 : 0
        }));
    };
    CatMessageService.prototype.decreaseTimeToLive = function () {
        for (var type in this.messages) {
            _.forEach(this.messages[type], function (message) {
                message.timeToLive--;
            });
        }
    };
    CatMessageService.prototype.addMessages = function (type, messages) {
        var _this = this;
        if (!type) {
            return;
        }
        _.forEach(messages, function (message) {
            _this.addMessage(type, message);
        });
    };
    CatMessageService.prototype.setMessages = function (type, messages) {
        if (!type) {
            return;
        }
        this.clearMessages(type);
        if (!!messages) {
            this.addMessages(type, messages);
        }
    };
    return CatMessageService;
})();
/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
var CatValidationMessageHandler = (function () {
    function CatValidationMessageHandler($globalMessages, catValidationService) {
        this.$globalMessages = $globalMessages;
        this.catValidationService = catValidationService;
    }
    CatValidationMessageHandler.prototype.handleRejectedResponse = function (rejection) {
        this.$globalMessages.clearMessages('error');
        if (!!rejection.data && !!rejection.data.error) {
            var error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
            if (!!rejection.data.cause) {
                error += '\n' + rejection.data.cause;
            }
            this.$globalMessages.addMessage('error', error);
        }
        this.catValidationService.updateFromRejection(rejection);
    };
    return CatValidationMessageHandler;
})();
angular
    .module('cat.service.message', [
    'cat.config.messages'
])
    .service('catValidationMessageHandler', [
    '$globalMessages',
    'catValidationService',
    CatValidationMessageHandler
])
    .service('$globalMessages', [
    '$rootScope',
    CatMessageService
]);

window.cat = window.cat || {};
window.cat.models = window.cat.models || {};
window.cat.util = window.cat.util || {
    pluralize: function (string) {
        if (_.isUndefined(string) || string.length === 0) {
            return '';
        }
        var lastChar = string[string.length - 1];
        switch (lastChar) {
            case 'y':
                return string.substring(0, string.length - 1) + 'ies';
            case 's':
                return string + 'es';
            default:
                return string + 's';
        }
    },
    capitalize: function (string) {
        if (_.isUndefined(string) || string.length === 0) {
            return '';
        }
        return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
    },
    generateUUID: function () {
        // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        /* jshint ignore:start */
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        /* jshint ignore:end */
    },
    defaultModelResolver: function (name) {
        return window.cat.models[name];
    }
};

})(window.jQuery, window._, window.angular);
//# sourceMappingURL=cat-angular.js.map
