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
    'cat.directives.breadcrumbs',
    'cat.directives.validation'
]);

angular.module('cat', [
    'cat.service',
    'cat.directives',
    'cat.filters',
    'cat.controller',
    'ui.bootstrap'
]);

'use strict';

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
window.cat.FacetTerm = function (data) {
    if (data === undefined) data = {};

    this.id = data.id;
    this.name = data.name;
    this.count = data.count;
};

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
window.cat.Facet = function (data) {
    if (data === undefined) data = {};

    this.name = data.name;
    this.terms = _.map(data.facets, function (facet) {
        return new window.cat.FacetTerm(facet);
    });
};

'use strict';

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
window.cat.SearchRequest = function (searchUrlParams) {

    var _pagination = {
        page: 1,
        size: 100
    };
    var _sort = {};
    var _search = {};
    var _dirty = false;

    var lastEncoded;

    if (!!searchUrlParams && !_.isEmpty(searchUrlParams)) {
        _pagination.page = searchUrlParams.page || _pagination.page;
        _pagination.size = searchUrlParams.size || _pagination.size;
        _sort.property = searchUrlParams.sort || _sort.property;
        _sort.isDesc = searchUrlParams.rev || _sort.isDesc;
        _.forEach(_.keys(searchUrlParams), function (param) {
            if (param.indexOf('search.') > -1 && param.length > 7) {
                _search[param.substring(7)] = searchUrlParams[param];
            }
        });
    }

    var _encodeSort = function () {
        return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
    };

    var _encodePagination = function () {
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
    };

    var _concatenate = function (result, next) {
        if (!result) {
            return next;
        }

        if (!next) {
            return result;
        }
        return result + '&' + next;
    };

    var _encodeSearch = function () {
        if (!!_search && !_.isEmpty(_search)) {
            return $.param(_search, true);
        }

        return '';
    };

    var urlEndoded = function () {
        return _([_encodePagination(), _encodeSort(), _encodeSearch()]).reduce(_concatenate);
    };

    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    this.pagination = function (pagination) {
        if (pagination === undefined) {
            return _pagination;
        } else {
            _pagination = pagination;
            _dirty = true;
            return _pagination;
        }
    };


    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    this.sort = function (sort) {
        if (sort === undefined) {
            return _sort;
        } else {
            _sort = sort;
            _dirty = true;
            return _sort;
        }
    };

    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    this.search = function (search) {
        if (search === undefined) {
            return _search;
        } else {
            _search = search;
            _dirty = true;
            return _search;
        }
    };

    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    this.urlEncoded = function () {
        lastEncoded = urlEndoded();
        return lastEncoded;
    };

    this.setPristine = function () {
        _dirty = false;
    };

    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    this.isDirty = function () {
        return _dirty;
    };

    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    this.setSearch = function ($location) {
        var ret = {};
        ret.page = _pagination.page;
        ret.size = _pagination.size;
        if (!!_sort.property) {
            ret.sort = _sort.property;
            ret.rev = _sort.isDesc || false;
        }
        _.forEach(_.keys(_search), function (s) {
            ret['search.' + s] = _search[s];
        });
        $location.search(ret);
    };
};
'use strict';

angular.module('cat.config.messages', [])

/**
 * @description
 * Configuration for cat-messages.
 */
    .constant('catMessagesConfig', {
        knownFieldsActive: false
    });

'use strict';

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
CatBaseDetailController.$inject = ["$scope", "$state", "$stateParams", "$location", "$window", "$globalMessages", "$controller", "$log", "catValidationService", "catBreadcrumbsService", "config"];
function CatBaseDetailController($scope, $state, $stateParams, $location, $window, $globalMessages, $controller, $log, catValidationService, catBreadcrumbsService, config) {
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
    } else {
        catBreadcrumbsService.push({});
    }

    $scope.editTemplate = templateUrls.edit;

    if (_.isObject(templateUrls.view)) {
        $scope.mainViewTemplate = templateUrls.view.main;
        $scope.additionalViewTemplate = templateUrls.view.additional;
    } else {
        $scope.mainViewTemplate = templateUrls.view;
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
        $scope.$broadcast('cat-detail-updated', $scope.detail);
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
        } else {
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
            if (!!data.id) {
                $state.go('.', {id: data.id});
            } else {
                $state.go('.', {id: 'new'}, {notify: false});
                $scope.exists = false;
                $scope.editDetail = data;
            }
        });
    };

    /**
     * Calls the remove function of the current endpoint and redirects to the ^.list upon success
     */
    $scope.remove = function () {
        endpoint.remove($scope.detail.id).then(function () {
            if (_.isEmpty($scope.uiStack)) {
                $state.go('^.list');
            } else {
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
            } else {
                if (!$scope.exists) {
                    $scope.$broadcast('formReset');
                    $state.go('.', {id: data.id});
                } else {
                    $scope.editDetail = undefined;
                    $scope.detail = data;
                    config.detail = data;
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
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }

    if ($scope.exists) {
        update();
    } else {
        $scope.edit();
    }
}

angular.module('cat.controller.base.detail', ['cat.service.breadcrumbs', 'cat.controller.base.tabs'])
    .controller('CatBaseDetailController', CatBaseDetailController);
'use strict';


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
    if (!_.isUndefined(config.listData)) {
        this.titleKey = 'cc.catalysts.cat-breadcrumbs.entry.' + config.listData.endpoint.getEndpointName();

        catBreadcrumbsService.set([
            {
                title: config.title,
                key: this.titleKey
            }
        ]);

        $scope.listData = config.listData;
    } else {
        $log.warn('No listData available!');
    }

    this.title = config.title;
    this.searchProps = config.searchProps;
    this.config = config;

    this.getUrlForId = function (id) {
        $log.warn('use ui-sref directly - this method will be removed in the near future');
        return $state.href('^.detail', {id: id});
    };

    this.getUrlForNewPage = function () {
        return this.getUrlForId('new');
    };

    this.remove = function (id) {
        config.listData.endpoint.remove(id)
            .then(function () {
                catListDataLoadingService.load(config.listData.endpoint, config.listData.searchRequest).then(
                    function (data) {
                        _.assign($scope.listData, data);
                    }
                );
            });
    };

    try {
        // extend with custom controller
        $controller(config.controller, {$scope: $scope, listData: config.listData, config: config});
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }
}


angular.module('cat.controller.base.list', ['cat.service.breadcrumbs'])
    .controller('CatBaseListController',
        ['$scope', '$state', '$controller', '$log', 'catBreadcrumbsService', 'catListDataLoadingService', 'config', CatBaseListController]);

'use strict';

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
 */
CatBaseTabsController.$inject = ["$scope", "$controller", "$stateParams", "$location", "catElementVisibilityService", "config", "urlResolverService"];
function CatBaseTabsController($scope, $controller, $stateParams, $location, catElementVisibilityService, config, urlResolverService) {
    var endpoint = config.endpoint;

    function initTabs() {
        $scope.tabs = _.filter(config.tabs, function (tab) {
            var visible = catElementVisibilityService.isVisible('cat.base.tab', tab);

            return visible && (!_.isFunction(tab.isVisible) || tab.isVisible(config));
        });
    }

    initTabs();
    $scope.$on('cat-detail-updated', function (event, detail) {
        // #61 update visible tabs if details object changed
        config.detail = detail;
        initTabs();
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
        } else if (_.isUndefined(newValue.tab)) {
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

    $scope.tabController = ['$scope', 'catListDataLoadingService', function ($tabScope, catListDataLoadingService) {
        var activeTab = $scope.tabs[tabIndex++];
        var tabControllerName = _getTabControllerName(activeTab);

        $tabScope.getSearchRequest = function () {
            return new window.cat.SearchRequest();
        };

        $tabScope.getEndpoint = function () {
            return config.detail[activeTab.name];
        };

        $tabScope.loadListData = function () {
            catListDataLoadingService.load($tabScope.getEndpoint(), $tabScope.getSearchRequest()).then(function (data) {
                $tabScope.listData = data;
            });
        };

        $tabScope.$on('tab-' + activeTab.name + '-active', function () {
            if (_.isUndefined($scope.listData)) {
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

angular
    .module('cat.controller.base.tabs', [
        'cat.service.elementVisibility',
        'cat.url.resolver.service'
    ]).controller('CatBaseTabsController', CatBaseTabsController);
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.autofocus:catAutofocus
 */
angular.module('cat.directives.autofocus', [])
    .directive('catAutofocus', ["$timeout", function CatAutofocusDirective($timeout) {
        return {
            restrict: 'A',
            link: function CatAutofocusLink(scope, element) {
                $timeout(function () {
                    if (!_.isUndefined(element.data('select2'))) {
                        element.select2('open');
                    } else {
                        element[0].focus();
                    }
                }, 100);
            }
        };
    }]);



'use strict';

angular.module('cat.directives.breadcrumbs', ['cat.service.breadcrumbs'])

/**
 * @description
 * Configuration for cat-breadcrumbs.
 */
    .constant('catBreadcrumbsConfig', {
        homeState: 'dashboard'
    })

/**
 * @ngdoc directive
 * @name cat.directives.breadcrumbs:catBreadcrumbs
 */
    .directive('catBreadcrumbs', ["catBreadcrumbsConfig", "catBreadcrumbs", function CatBreadcrumbsDirective(catBreadcrumbsConfig, catBreadcrumbs) {
        return {
            restrict: 'A',
            templateUrl: 'template/cat-breadcrumbs.tpl.html',
            link: function CatAutofocusLink(scope, element) {
                if (catBreadcrumbsConfig.homeState) {
                    scope.homeState = catBreadcrumbsConfig.homeState;
                }
                scope.breadcrumbs = catBreadcrumbs;
                scope.showHome = function () {
                    return !!catBreadcrumbsConfig.homeState;
                };
            }
        };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.checkbox:catCheckbox
 */
angular.module('cat.directives.checkbox', [])
    .directive('catCheckbox', function CatCheckboxDirective() {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                checked: '='
            },
            link: function CatCheckboxLink(scope, element) {
                if (!!scope.checked) {
                    element.addClass('glyphicon glyphicon-check');
                } else {
                    element.addClass('glyphicon glyphicon-unchecked');
                }
            }
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.confirmClick:catConfirmClick
 */
angular.module('cat.directives.confirmClick', [])
    .directive('catConfirmClick', function CatConfirmClickDirective() {
        return {
            restrict: 'A',
            link: function CatConfirmClickLink(scope, element, attr) {
                var msg = attr.catConfirmClick || 'Are you sure?';
                var clickAction = attr.catOnConfirm;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction);
                    }
                });
            }
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.elementVisible:catElementVisible
 */
angular.module('cat.directives.elementVisible', ['cat.service.elementVisibility'])
    .directive('catElementVisible', ['catElementVisibilityService',
        function CatElementVisibleDirective(catElementVisibilityService) {
            return {
                restrict: 'A',
                scope: {
                    identifier: '@catElementVisible',
                    data: '=?catElementData'
                },
                link: function CatElementVisibleLink(scope, element) {
                    if (!catElementVisibilityService.isVisible(scope.identifier, scope.data)) {
                        element.hide();
                    }
                }
            };
        }]);

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.facets:catFacets
 */
angular.module('cat.directives.facets', ['cat.directives.paginated'])
    .directive('catFacets', function CatFacetsDirective() {
        function _initDefaults(scope) {
            if (_.isUndefined(scope.listData)) {
                scope.listData = scope.$parent.listData;
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

        return {
            replace: true,
            restrict: 'E',
            scope: {
                listData: '=?',
                names: '='
            },
            require: '^catPaginated',
            templateUrl: 'template/cat-facets.tpl.html',
            link: function CatFacetsLink(scope, element, attrs, catPaginatedController) {
                _initDefaults(scope);
                _checkConditions(scope);

                scope.catPaginatedController = catPaginatedController;
            },
            controller: ["$scope", function CatFacetsController($scope) {
                $scope.isActive = function (facet) {
                    return !!$scope.catPaginatedController.getSearch()[facet.name];
                };

                function _search(search) {
                    return $scope.catPaginatedController.getSearchRequest().search(search);
                }

                $scope.facetName = function (facet) {
                    if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                        return $scope.names[facet.name];
                    } else {
                        return facet.name;
                    }
                };

                $scope.facets = {};

                $scope.facetChanged = function (facet) {
                    var search = _search();
                    var value = $scope.facets[facet.name];
                    if (!!value) {
                        search[facet.name] = value;
                    } else {
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
            }]
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldErrors.info:catFieldErrorsInfo
 */
angular.module('cat.directives.fieldErrors.info', ['cat.service.validation'])
    .directive('catFieldErrorsInfo', function CatFieldErrorsInfoDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: true,
            bindToController: true,
            controllerAs: 'catFieldErrorsInfo',
            require: ['catFieldErrorsInfo', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-field-errors-info');

                var catFieldErrors = controllers[0];
                var catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catFieldErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: ["catValidationService", function CatFieldErrorsController(/* CatValidationService */  catValidationService) {
                var that = this;

                this.hasErrors = function () {
                    return catValidationService.hasAnyFieldErrors(that.contextId);
                };
            }],
            templateUrl: 'template/cat-field-errors-info.tpl.html'
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular.module('cat.directives.fieldErrors', ['cat.service.validation'])
    .directive('catFieldErrors', function CatFieldErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: {
                name: '@'
            },
            bindToController: true,
            controllerAs: 'catFieldErrors',
            require: ['catFieldErrors', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-field-errors');

                var catFieldErrors = controllers[0];
                var /* CatValidationController */ catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catFieldErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: ["$scope", "catValidationService", function CatFieldErrorsController($scope, /* CatValidationService */  catValidationService) {
                var that = this;

                if (angular.version.major === 1 && angular.version.minor === 2) {
                    $scope.$watch('name', function (name) {
                        that.name = name;
                    });
                }

                this.hasErrors = function() {
                    return catValidationService.hasFieldErrors(that.name, this.contextId);
                };

                this.getErrors = function() {
                    return catValidationService.getFieldErrors(that.name, this.contextId);
                };
            }],
            templateUrl: 'template/cat-field-errors.tpl.html'
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.globalError:catGlobalErrors
 */
angular.module('cat.directives.globalErrors', ['cat.service.validation'])
    .directive('catGlobalErrors', function CatGlobalErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: true,
            bindToController: true,
            controllerAs: 'catGlobalErrors',
            require: ['catGlobalErrors', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-global-errors');

                var catGlobalErrors = controllers[0];
                var /* CatValidationController */ catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catGlobalErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: ["$scope", "catValidationService", function CatGlobalErrorsController($scope, /* CatValidationService */  catValidationService) {
                var that = this;

                this.hasErrors = function () {
                    return catValidationService.hasGlobalErrors(this.contextId);
                };

                this.getErrors = function () {
                    return catValidationService.getGlobalErrors(this.contextId);
                };
            }],
            templateUrl: 'template/cat-global-errors.tpl.html'
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.i18n:catI18n
 */
angular.module('cat.directives.i18n', ['cat.service.i18n'])
    .service('catI18nResponseHandler', ['$log', function CatI18nResponseHandler($log) {
        this.handleTranslationSuccess = function (translation, scope, element) {
            element.text(translation);
        };
        this.handleTranslationError = function (reason, scope, element) {
            element.text('##missingkey: ' + scope.key);
        };
    }])
    .directive('catI18n', ['$log', '$rootScope', 'catI18nService', 'catI18nResponseHandler', function catI18nDirective($log, $rootScope, catI18nService, catI18nResponseHandler) {
        function _translate(scope, element) {
            if (!scope.key) {
                $log.warn('No key was given for cat-i18n!');
                return;
            }
            catI18nService.translate(scope.key, scope.params).then(
                function (message) {
                    catI18nResponseHandler.handleTranslationSuccess(message, scope, element);
                }, function (reason) {
                    catI18nResponseHandler.handleTranslationError(reason, scope, element);
                }
            );
        }


        return {
            restrict: 'A',
            scope: {
                key: '@catI18n',
                params: '=?i18nParams',
                watchParams: '=?i18nWatchParams'
            },
            link: function CatI18nLink(scope, element) {
                _translate(scope, element);

                if (!!scope.params && scope.watchParams === true) {
                    scope.$watch('params', function () {
                        _translate(scope, element);
                    }, true);
                }

                $rootScope.$on('cat-i18n-refresh', function () {
                    _translate(scope, element);
                });
            }
        };
    }]);

'use strict';

angular.module('cat.directives.icon', [])

/**
 * @description
 * Configuration for cat-icon.
 */
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

/**
 * @ngdoc directive
 * @name cat.directives.icon:catIcon
 *
 * @param {string} icon name of the icon
 * @param {string} title title of the icon
 * @param {string} size size of the icon [undefined | '': normal, 'xs': small]
 */
    .directive('catIcon', function CatIcon() {
        return {
            restrict: 'A',
            replace: true,
            template: '<span class="{{iconClass}}" title="{{title}}"></span>',
            scope: {
                icon: '@catIcon',
                title: '@',
                size: '@'
            },
            controller: ["$scope", "catIconConfig", function ($scope, catIconConfig) {
                var icons = catIconConfig.icons;
                var iconsConfig = icons.config;

                var iconClasses = [];

                // add size class
                if (!!$scope.size && $scope.size === 'xs' && !!iconsConfig.xsClass) {
                    iconClasses.push(iconsConfig.xsClass);
                }

                // add icon class
                iconClasses.push(icons[$scope.icon]);

                $scope.iconClass = iconClasses.join(' ');
            }]
        };
    });

'use strict';

angular.module('cat.directives.inputGroup', [])

/**
 * @ngdoc directive
 * @name cat.directives.inputGroup:catInputGroup
 */
    .directive('catInputGroup', ["catValidationService", function CatInputGroupDirective(catValidationService) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                label: '@',
                name: '@',
                catI18nKey: '@'
            },
            require: '?^^catValidationGroup',
            link: function CatInputGroupLink(scope, element, attr, /* CatValidationController */ catValidationGroupCtrl) {
                if (!!catValidationGroupCtrl && !!catValidationService) {
                    var context = catValidationService.getContext(catValidationGroupCtrl.getContextId());
                    context.registerField(scope.name);
                }

                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    }]);
'use strict';

angular.module('cat.directives.input', [])

/**
 * @ngdoc directive
 * @name cat.directives.input:input
 */
    .directive('input', function CatInputDirective() {
        return {
            require: '?ngModel',
            restrict: 'E',
            link: function CatInputLink(scope, element, attrs, ctrl) {
                if (!!ctrl) {
                    scope.$on('fieldErrors', function (event, fieldErrors) {
                        if (!fieldErrors || !attrs.id) {
                            return;
                        }
                        var valid = !fieldErrors[attrs.id];
                        ctrl.$setValidity(attrs.id, valid);
                    });
                }
            }
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.loadMore:catLoadMore
 */
angular.module('cat.directives.loadMore', [])
    .directive('catLoadMore', function CatLoadMoreDirective() {
        return {
            replace: true,
            restrict: 'A',
            link: function CatLoadMoreLink(scope, element, attrs) {
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
            }
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.menu:catLoadMore
 */
angular.module('cat.directives.menu', ['cat.service.menu', 'cat.service.elementVisibility'])
    .directive('catMainMenu', ['$mainMenu', 'catElementVisibilityService', '$location',
        function CatMainMenuDirective($mainMenu, catElementVisibilityService, $location) {
            return {
                restrict: 'E',
                scope: {},
                link: function CatMainMenuLink(scope) {
                    scope.getMenus = function () {
                        return $mainMenu.getMenus();
                    };

                    scope.isVisible = function (entry) {
                        var visible = false;
                        if (entry.isMenu() || entry.isGroup()) {
                            _.forEach(entry.getEntries(), function (subEntry) {
                                visible = visible || scope.isVisible(subEntry);
                            });
                            if (entry.isMenu()) {
                                _.forEach(entry.getGroups(), function (groups) {
                                    visible = visible || scope.isVisible(groups);
                                });
                            }
                        } else {
                            return catElementVisibilityService.isVisible('cat.menu.entry', entry);
                        }
                        return visible;
                    };

                    scope.isActive = function (path) {
                        return $location.path().substr(0, path.length) === path;
                    };
                },
                templateUrl: 'template/cat-main-menu.tpl.html'
            };
        }]);

'use strict';

angular.module('cat.directives.messages', [
    'cat.config.messages',
    'cat.service.validation'
])

/**
 * @ngdoc directive
 * @name cat.directives.messages:catMessages
 */
    .directive('catMessages', function () {
        return {
            restrict: 'A',
            templateUrl: 'template/cat-messages.tpl.html',
            scope: {
                type: '=?'
            },
            require: '?^^catValidationGroup',
            link: function (scope, elem, attr, /* CatValidationController */ catValidationGroupCtrl) {
                if (!!catValidationGroupCtrl) {
                    scope.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: ["$scope", "catValidationService", function ($scope, /* CatValidationService */ catValidationService) {
                if (!$scope.type) {
                    $scope.type = 'error';
                }

                $scope.hasMessages = function () {
                    return catValidationService.hasGlobalErrors($scope.contextId);
                };

                $scope.getMessages = function () {
                    return catValidationService.getGlobalErrors($scope.contextId);
                };
            }]
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.paginated:catPaginated
 */
angular.module('cat.directives.paginated',
    [
        'ui.bootstrap.pagination',
        'cat.service.listDataLoading',
        'cat.service.i18n',
        'cat.service.search'
    ]).directive('catPaginated', ["$log", "catI18nService", function CatPaginatedDirective($log, catI18nService) {
    var SEARCH_PROP_KEY = 'cc.catalysts.cat-paginated.search.prop';

    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            listData: '=?',
            syncLocation: '=?'
        },
        templateUrl: 'template/cat-paginated.tpl.html',
        link: function CatPaginatedLink(scope, element, attrs) {
            if (!!attrs.searchProps) {
                scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                    return !!prop;
                });

                scope.searchPropertyPlaceholders = {};

                _.forEach(scope.searchProps, function (searchProp) {
                    scope.searchPropertyPlaceholders[searchProp] = 'Search by ' + searchProp;
                    catI18nService.translate(SEARCH_PROP_KEY, {prop: searchProp})
                        .then(function (message) {
                            scope.searchPropertyPlaceholders[searchProp] = message;
                        });
                });
            }
        },
        controllerAs: 'catPaginatedController',
        controller: ["$scope", "$location", "$timeout", "$rootScope", "catListDataLoadingService", "catI18nService", "catSearchService", function CatPaginatedController($scope, $location, $timeout, $rootScope, catListDataLoadingService, catI18nService, catSearchService) {
            var that = this;
            var searchTimeout = null, DELAY_ON_SEARCH = 500;
            var PAGINATION_PREVIOUS_KEY = 'cc.catalysts.cat-paginated.pagination.previous';
            var PAGINATION_NEXT_KEY = 'cc.catalysts.cat-paginated.pagination.next';
            var PAGINATION_FIRST_KEY = 'cc.catalysts.cat-paginated.pagination.first';
            var PAGINATION_LAST_KEY = 'cc.catalysts.cat-paginated.pagination.last';

            if (_.isUndefined($scope.listData)) {
                $scope.listData = $scope.$parent.listData;
                if (_.isUndefined($scope.listData)) {
                    throw new Error('listData was not defined and couldn\'t be found with default value');
                }
            }

            if (_.isUndefined($scope.syncLocation)) {
                $scope.syncLocation = _.isUndefined($scope.$parent.detail);
            }

            $scope.paginationText = {
                previous: 'Previous',
                next: 'Next',
                first: 'First',
                last: 'Last'
            };

            function handlePaginationTextResponse(prop) {
                return function (message) {
                    $scope.paginationText[prop] = message;
                };
            }


            function _loadPaginationTranslations() {
                catI18nService.translate(PAGINATION_PREVIOUS_KEY).then(handlePaginationTextResponse('previous'));
                catI18nService.translate(PAGINATION_NEXT_KEY).then(handlePaginationTextResponse('next'));
                catI18nService.translate(PAGINATION_FIRST_KEY).then(handlePaginationTextResponse('first'));
                catI18nService.translate(PAGINATION_LAST_KEY).then(handlePaginationTextResponse('last'));
            }

            _loadPaginationTranslations();

            $rootScope.$on('cat-i18n-refresh', function () {
                _loadPaginationTranslations();
            });

            $scope.listData.search = $scope.listData.search || $scope.listData.searchRequest.search() || {};

            var searchRequest = $scope.listData.searchRequest;

            var reload = function (delay, force) {
                $timeout.cancel(searchTimeout);
                searchTimeout = $timeout(function () {
                    if (searchRequest.isDirty() || !!force) {
                        catListDataLoadingService.load($scope.listData.endpoint, searchRequest).then(
                            function (data) {
                                searchRequest.setPristine();
                                _.assign($scope.listData, data);
                            }
                        );
                    }
                }, delay || 0);
            };

            $scope.$on('cat-paginated-refresh', function () {
                reload(0, true);
            });

            $scope.$watch('listData.sort', function (newVal) {
                if (!!newVal) {
                    console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                    $scope.$parent.$broadcast('SortChanged', newVal);
                }
            }, true);

            function updateLocation() {
                if ($scope.syncLocation !== false) {
                    catSearchService.updateLocation(searchRequest);
                    $location.replace();
                }
            }

            $scope.$watch('listData.pagination', function (newVal, oldVal) {
                // TODO check wheter or not this is necessary with angular >= 1.3
                if (angular.equals(newVal, oldVal)) {
                    return;
                }
                searchRequest.pagination($scope.listData.pagination);
                updateLocation();
                reload();
            }, true);

            var searchChanged = function (value, delay) {
                searchRequest.search(value);
                updateLocation();
                $scope.listData.pagination.page = 1;
                reload(delay);
            };

            var updateSearch = function (newVal, oldVal) {
                // TODO check wheter or not this is necessary with angular >= 1.3
                if (angular.equals(newVal, oldVal)) {
                    return;
                }
                var search = searchRequest.search();
                _.assign(search, newVal);
                searchChanged(newVal, DELAY_ON_SEARCH);
            };

            $scope.$watch('listData.search', updateSearch, true);

            this.sort = function (newVal, oldVal) {
                // TODO check wheter or not this is necessary with angular >= 1.3
                if (angular.equals(newVal, oldVal)) {
                    return;
                }
                searchRequest.sort(newVal);
                updateLocation();
                $scope.listData.pagination.page = 1;
                reload();
            };

            this.getSearch = function () {
                return searchRequest.search();
            };

            this.getSearchRequest = function () {
                return searchRequest;
            };

            $scope.$on('SortChanged', function (event, value) {
                that.sort(value);
            });
        }]
    };
}]);

'use strict';

CatSelectController.$inject = ["$scope", "$log", "catApiService", "catSelectConfigService"];
function CatSelectLink(scope, element, attrs, ngModel) {
    element.addClass('form-control');
    // clear formatters, otherwise $viewModel will be converted to a string
    // see https://github.com/angular/angular.js/commit/1eda18365a348c9597aafba9d195d345e4f13d1e
    ngModel.$formatters = [];
}

function CatSelectController($scope, $log, catApiService, catSelectConfigService) {
    function fetchElements(endpoint, sort, searchRequestAdapter) {
        return function (queryParams) {
            var searchRequest = new window.cat.SearchRequest(queryParams.data);
            searchRequest.sort(sort || {property: 'name', isDesc: false});

            if (_.isFunction(searchRequestAdapter)) {
                searchRequest = searchRequestAdapter(searchRequest);
            } else if (_.isObject(searchRequestAdapter)) {
                _.assign(searchRequest, searchRequestAdapter);
            } else {
                $log.warn('searchRequestAdapter has to be either a function or an object but was ' + (typeof searchRequestAdapter));
            }

            return endpoint.list(searchRequest).then(queryParams.success);
        };
    }


    var options = catSelectConfigService.getConfig($scope.config, $scope.options);

    if (_.isUndefined(options)) {
        throw new Error('At least one of "config" or "options" has to be specified');
    }

    var searchRequestAdapter = options.searchRequestAdapter || {};

    var transport,
        quietMillis,
        searchRequestFunc = options.search || function (term, page) {
                return {
                    'search.name': term,
                    page: page
                };
            },
        filterFunc = options.filter || function (term) {
                return true;
            };
    if (_.isArray(options.endpoint)) {
        transport = function (queryParams) {
            return queryParams.success({
                elements: options.endpoint
            });
        };
        quietMillis = 0;
    } else if (_.isFunction(options.endpoint)) {
        transport = options.endpoint;
        quietMillis = 500;
    } else if (_.isObject(options.endpoint)) {
        transport = fetchElements(options.endpoint, options.sort, searchRequestAdapter);
        quietMillis = 500;
    } else if (_.isString(options.endpoint)) {
        var api = catApiService[options.endpoint];
        if (!api) {
            $log.error('No api endpoint "' + options.endpoint + '" defined');
            $scope.elements = [];
            return;
        }
        transport = fetchElements(api, options.sort, searchRequestAdapter);
        quietMillis = 500;
    } else {
        $log.error('The given endpoint has to be one of the following types: array, object, string or function - but was ' + (typeof options.endpoint));
        $scope.elements = [];
        return;
    }

    $scope.selectOptions = _.assign({
        placeholder: ' ', // space in default placeholder is required, otherwise allowClear property does not work
        minimumInputLength: 0,
        adaptDropdownCssClass: function (cssClass) {
            if (_.includes(['ng-valid', 'ng-invalid', 'ng-pristine', 'ng-dirty'], cssClass)) {
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
            return _.escape(element.name);
        },
        formatSelection: function (element) {
            return _.escape(element.name);
        }
    }, options['ui-select2']);
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
function CatSelectDirective() {
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
        link: CatSelectLink,
        controller: CatSelectController,
        template: '<input type="text" ui-select2="selectOptions">'
    };
}

angular.module('cat.directives.select', ['ui.select2', 'cat.service.api', 'cat.service.selectConfig'])
    .directive('catSelect', CatSelectDirective);

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.sortable:catSortable
 */
angular.module('cat.directives.sortable', ['cat.directives.paginated'])
    .directive('catSortable', ["$compile", function CatSortableDirective($compile) {
        return {
            restrict: 'AC',
            require: '^catPaginated',
            link: function CatSortableLink(scope, element, attrs, catPaginatedController) {
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
                    } else if (attrs.sortMode === 'alphabet') {
                        icon = 'glyphicon-sort-by-alphabet';
                    }
                }

                element.text('');
                element.append($compile('<a class="sort-link" href="" ng-click="toggleSort(\'' + property + '\')"><span cat-i18n="' + i18n + '">' + title + '</span><span class="glyphicon" ng-class="{\'' + icon + '\': sort.property == \'' + property + '\' && !sort.isDesc, \'' + icon + '-alt\': sort.property == \'' + property + '\' && sort.isDesc}"></span></a>')(scope));
            },
            controller: ["$scope", function CatSortableController($scope) {
                $scope.toggleSort = function (property) {
                    if ($scope.sort.property === property) {
                        $scope.sort.isDesc = !$scope.sort.isDesc;
                    } else {
                        $scope.sort.property = property;
                        $scope.sort.isDesc = false;
                    }

                    $scope.catPaginatedController.sort($scope.sort);
                };

                $scope.$on('SortChanged', function (event, value) {
                    $scope.sort = value;
                });
            }]
        };
    }]);
'use strict';

function CatValidationController($scope, catValidationService) {
    var contextId = catValidationService.createContext();

    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    this.getContextId = function () {
        return contextId;
    };

    $scope.$on('$destroy', function () {
        catValidationService.destroyContext(contextId);
    });
}

angular.module('cat.directives.validation', ['cat.service.validation'])
/**
 * @ngdoc directive
 * @name cat.directives.validation.inputs:catValidationGroup
 *
 * @description
 * This directive provides a container which defines a new validation context. Via the controller the context can be
 * retrieved.
 */
    .directive('catValidationGroup', function CatValidationGroup() {
        return {
            restrict: 'A',
            controllerAs: 'catValidationGroupCtrl',
            bindToController: true,
            controller: ['$scope', 'catValidationService', CatValidationController]
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.form:form
 */
angular.module('cat.directives.form', [])
    .directive('form', ['$timeout', function CatFormDirective($timeout) {
        return {
            restrict: 'E',
            scope: true,
            require: 'form',
            link: function CatFormLink(scope, element, attrs, formCtrl) {
                var warningMessage = attrs.eocsWarnOnNavIfDirty || 'You have unsaved changes. Leave the page?';

                // TODO - remove this ugly hack if ui-select2 fixes this problem...
                $timeout(function () {
                    formCtrl.$setPristine(true);
                }, 50);

                scope.$on('formReset', function () {
                    formCtrl.$setPristine(true);
                });

                scope.$on('formDirty', function () {
                    formCtrl.$setDirty(true);
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
            }
        };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.numbersOnly:numbersOnly
 */
angular.module('cat.directives.numbersOnly', [])
    .directive('numbersOnly', function CatNumbersOnlyDirective() {
        return {
            require: 'ngModel',
            link: function CatNumbersOnlyLink(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (!inputValue) return '';

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
            }
        };
    });
'use strict';


angular.module('cat.filters.replaceText', [])

/**
 * @ngdoc filter
 * @name cat.filters.replaceText:replaceText
 *
 * @description
 * Replaces text passages with other text, based on regular expressions
 *
 * @param {string} text original text
 * @param {string} pattern regular expression
 * @param {object} options regular expression options
 * @param {string} replacement replacement text
 */
    .filter('replaceText', function CatReplaceTetFilter() {
        return function (text, pattern, options, replacement) {
            if (pattern === undefined)
                pattern = '\n';
            if (options === undefined)
                options = 'g';
            if (replacement === undefined)
                replacement = ', ';
            if (!text) {
                return text;
            } else {
                return String(text).replace(new RegExp(pattern, options), replacement);
            }
        };
    });

/**
 * Created by tscheinecker on 23.10.2014.
 */
'use strict';

window.cat.i18n = window.cat.i18n || {};
window.cat.i18n.de = window.cat.i18n.de || {};

_.assign(window.cat.i18n.de, {
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
});

/**
 * Created by tscheinecker on 23.10.2014.
 */
'use strict';

window.cat.i18n = window.cat.i18n || {};
window.cat.i18n.en = window.cat.i18n.en || {};

_.assign(window.cat.i18n.en, {
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
});

'use strict';

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
function CatApiEndpoint(url, endpointConfig, $http, catConversionService, catSearchService) {
    var that = this;

    var _endpointName = endpointConfig.name;
    var config = endpointConfig.config;
    var _endpointUrl = url + (config.url || endpointConfig.name);
    var _childEndpointSettings = endpointConfig.children;
    var _endpointListConfig = config.list || {};

    /**
     * This helper function initializes all configured child endpoints by creating the appropriate url by appending
     * the given id before initializing them.
     * @return {object} a object holding all resolved child endpoints for the given id
     * @private
     */
    var _res = _.memoize(function (id) {
        var url = _endpointUrl + '/' + id + '/';
        var ret = {};
        _.forEach(_.keys(_childEndpointSettings), function (path) {
            ret[path] = new CatApiEndpoint(url, _childEndpointSettings[path], $http, catConversionService, catSearchService);
            ret[path].parentEndpoint = that;
            ret[path].parentId = id;
            ret[path].parentInfo = function () {
                return that.info(id);
            };
        });
        return ret;
    });

    var _addChildEndpoints = function (data) {
        _.merge(data, _res(data.id));
    };

    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    var _mapResponse = function (data) {
        var object = catConversionService.toClient(data, config);

        if (!_.isUndefined(object.id)) {
            _addChildEndpoints(object);
        }

        if (_.isArray(object)) {
            _.forEach(object, _addChildEndpoints);
        }

        if (_.isArray(object.elements)) {
            _.forEach(object.elements, _addChildEndpoints);
        }

        return object;
    };

    /**
     * This helper methods deletes all child endpoints from the given object.
     * @param {object} object the object to remove the child endpoints from
     * @return {object} the passed in object without the child endpoints
     * @private
     */
    var _removeEndpoints = function (object) {
        var endpoints = _res(object.id);
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
    var _getSearchQuery = function (searchRequest) {
        if (!!searchRequest && searchRequest instanceof window.cat.SearchRequest) {
            return '?' + catSearchService.encodeAsUrl(searchRequest);
        }

        return '';
    };

    /**
     * This method is used to instantiate actual child api endpoints which are dependent on a certain parent id
     * @param id the id for which to 'resolve' the child endpoints.
     * @return {object} a object which maps all child endpoint names to the actual endpoints where the url was resolved
     * with the provided id
     */
    this.res = function (id) {
        return _res(id);
    };

    /**
     * A small helper function to retrieve the actual url this endpoint resolved to.
     * @return {string} the resolved url of this endpoint
     */
    this.getEndpointUrl = function () {
        return _endpointUrl;
    };

    /**
     * A small helper to retrieve the name of the endpoint.
     * @return {string} the name of this endpoint
     */
    this.getEndpointName = function () {
        return _endpointName;
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
    this.list = function (searchRequest) {
        var url = !!_endpointListConfig.endpoint ? _endpointListConfig.endpoint : '';
        return $http.get(_endpointUrl + url + _getSearchQuery(searchRequest)).then(function (response) {
            return _mapResponse(response.data);
        });
    };

    /**
     * A helper function which adds '/all' to the request url available via #getEndpointUrl and maps the response to
     * the configured model.
     * @return [{object}] a promise wrapping an array of new instances of the configured model initialized with the data retrieved from
     * the backend
     */
    this.all = function () {
        return $http.get(_endpointUrl + '/all').then(function (response) {
            return _.map(response.data, function (elem) {
                return _mapResponse(elem);
            });
        });
    };

    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of the provided id at the end.
     * @param id the id which will be appended as '/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    this.get = function (id) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return _mapResponse(response.data);
        });
    };

    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of '/copy' and the provided id at the end.
     * @param id the id which will be appended as '/copy/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    this.copy = function (id) {
        return $http.get(_endpointUrl + '/copy/' + id).then(function (response) {
            return _mapResponse(response.data);
        });
    };


    /**
     * This method makes a GET the url available via #getEndpointUrl with the addition of the provided id at the end + the
     * 'info' request parameter.
     * @param id the id which will be appended as '/:id' to the url
     * @return {*} a promise wrapping the data retrieved from the backend
     */
    this.info = function (id) {
        return $http.get(_endpointUrl + '/' + id + '?info').then(function (response) {
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
    this.save = function (object) {
        if (!!object.id) {
            return $http.put(_endpointUrl + '/' + object.id, _removeEndpoints(object)).then(function (response) {
                return _mapResponse(response.data);
            });
        } else {
            return $http.post(_endpointUrl, _removeEndpoints(object)).then(function (response) {
                return _mapResponse(response.data);
            });
        }
    };

    /**
     * This method executes a DELETE request to the url available via #getEndpointUrl with the addition of the provided url at the end.
     * @param url the url to be appended to the endpoint url - usually only the id of the object to delete
     * @return {*} The promise returned by the $http 'DELETE' call
     */
    this.remove = function (url) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + url});
    };

    /**
     * Simple wrapper object which contains the custom get, put and post methods
     * @type {{}}
     */
    this.custom = {};

    /**
     * This method executes a GET request to the url available via #getEndpointUrl joined with the provided one.
     * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
     * @param url the url to be appended to the endpoint url
     * @param searchRequest an optional cat.SearchRequest to be applied to the request
     * @return {*} The promise returned by the $http.get call
     */
    this.custom.get = function (url, searchRequest) {
        return $http.get([_endpointUrl, url].join('/') + _getSearchQuery(searchRequest));
    };

    /**
     * This method executes a POST request to the url available via #getEndpointUrl joined with the provided one.
     * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
     * @param url the url to be appended to the endpoint url
     * @param object hte object to send as payload - not that it will be used as is for this request
     * @return {*} The promise returned by the $http.post call
     */
    this.custom.post = function (url, object) {
        return $http.post([_endpointUrl, url].join('/'), object);
    };

    /**
     * This method executes a PUT request to the url available via #getEndpointUrl joined with the provided one.
     * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
     * @param url the url to be appended to the endpoint url
     * @param object hte object to send as payload - not that it will be used as is for this request
     * @return {*} The promise returned by the $http.put call
     */
    this.custom.put = function (url, object) {
        return $http.put([_endpointUrl, url].join('/'), object);
    };
}

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
function EndpointConfig(name, config) {
    var that = this;
    this.config = config || {};
    this.children = {};
    this.name = name;

    /**
     * This method method either returns or creates and returns a child api endpoint of the current one.
     *
     * @param {string} childName the name of the child endpoint
     * @param {object} [childConfig] if given a new EndpointConfig will be created as a child of the current one. The
     * parent property of the created config will point to the current config
     * @return {EndpointConfig} the child endpoint config with the given name
     */
    this.child = function (childName, childConfig) {
        if (!_.isUndefined(childConfig)) {
            this.children[childName] = new EndpointConfig(childName, childConfig);
            this.children[childName].parent = this;
        }

        return this.children[childName];
    };

    // this takes care of mapping the 'old' config style to the new builder style
    if (!_.isUndefined(this.config.children)) {
        var childrenConfig = this.config.children;
        delete this.config.children;
        _.forEach(_.keys(childrenConfig), function (childName) {
            that.child(childName, childrenConfig[childName]);
        });
    }
}

function CatApiServiceProvider() {
    var _endpoints = {};

    /**
     * This method is used to either create or retrieve named endpoint configurations.
     * @param {string} name the name of the api endpoint to create or retrieve the configuration for
     * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
     * @return {EndpointConfig} the endpoint config for the given name
     */
    this.endpoint = function (name, settings) {
        if (!_.isUndefined(settings)) {
            _endpoints[name] = new EndpointConfig(name, settings);
        }
        return _endpoints[name];
    };


    this.$get = ['$http', 'catConversionService', 'catSearchService', 'CAT_API_SERVICE_DEFAULTS',
        /**
         * @return {object} returns a map from names to CatApiEndpoints
         */
            function $getCatApiService($http, catConversionService, catSearchService, CAT_API_SERVICE_DEFAULTS) {
            var catApiService = {};

            var dynamicEndpoints = {};

            /**
             * This method allows to define (dynamic) endpoints after the configuration phase.
             * @param {string} name (optional the name of the api endpoint to create or retrieve the configuration for
             * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
             * @returns {CatApiEndpoint}
             */
            catApiService.dynamicEndpoint = function (name, settings) {
                if (typeof name === 'object' && _.isUndefined(settings)) {
                    settings = name;
                    name = settings.url;
                }
                if (_.isUndefined(dynamicEndpoints[name])) {
                    if (_.isUndefined(settings)) {
                        throw new Error('Undefined dynamic endpoint settings');
                    }
                    dynamicEndpoints[name] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix,
                        new EndpointConfig(name, settings), $http, catConversionService, catSearchService);
                }
                return dynamicEndpoints[name];
            };

            _.forEach(_.keys(_endpoints), function (path) {
                catApiService[path] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix, _endpoints[path], $http, catConversionService, catSearchService);
            });

            return catApiService;
        }];
}

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
    .constant('CAT_API_SERVICE_DEFAULTS', {endpointUrlPrefix: 'api/'})
    .provider('catApiService', CatApiServiceProvider);

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
angular.module('cat.service.api').provider('$api', CatApiServiceProvider);

'use strict';


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
CatBreadcrumbsService.$inject = ["catBreadcrumbs", "$state"];
function CatBreadcrumbsService(catBreadcrumbs, $state) {
    var that = this;

    this.clear = function () {
        catBreadcrumbs.length = 0;
    };

    this.set = function (bcs) {
        that.clear();
        _.forEach(bcs, function (bc) {
            catBreadcrumbs.push(bc);
        });
    };

    this.get = function () {
        return catBreadcrumbs;
    };

    this.addFirst = function (entry) {
        catBreadcrumbs.unshift(entry);
    };

    this.removeFirst = function () {
        return catBreadcrumbs.shift();
    };

    this.push = function (entry) {
        catBreadcrumbs.push(entry);
    };

    this.pop = function () {
        return catBreadcrumbs.pop();
    };

    this.length = function () {
        return catBreadcrumbs.length;
    };

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.substring(1);
    }

    this.replaceLast = function (newVal) {
        catBreadcrumbs[catBreadcrumbs.length - 1] = newVal;
    };

    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    this.generateFromConfig = function (config) {
        that.clear();
        var uiStack = [];

        var currentState = $state.$current.parent;
        var currentEndpoint = config.endpoint;
        var count = 0;
        var parents = '^';

        while (!!currentState && !!currentState.parent) {
            var stateName = currentState.name;

            if (!/\.tab$/g.test(stateName)) {
                var href = $state.href(parents);

                var breadcrumb = {};

                if (config.parents.length > count) {
                    var parent = config.parents[count++];
                    var regex = new RegExp('/' + window.cat.util.pluralize(currentEndpoint.getEndpointName()) + '$');
                    href = href.replace(regex, '?tab=' + currentEndpoint.getEndpointName());

                    breadcrumb = {
                        url: href,
                        title: parent.name
                    };

                    uiStack.unshift(breadcrumb);
                } else {
                    breadcrumb = {
                        title: capitalize(window.cat.util.pluralize(currentEndpoint.getEndpointName())),
                        key: 'cc.catalysts.cat-breadcrumbs.entry.' + currentEndpoint.getEndpointName(),
                        url: href
                    };
                }

                that.addFirst(breadcrumb);
                currentEndpoint = currentEndpoint.parentEndpoint;
            }

            currentState = currentState.parent;
            parents += '.^';
        }
        return uiStack;
    };
}

angular.module('cat.service.breadcrumbs', [])

/**
 * @ngdoc overview
 * @name cat.service.breadcrumbs:catBreadcrumbs
 */
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', CatBreadcrumbsService);
'use strict';

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
CatConversionService.$inject = ["catConversionFunctions"];
function CatConversionService(catConversionFunctions) {
    this.toClient = function (serverData, context) {
        return catConversionFunctions.toClient(serverData, context);
    };

    this.toServer = function (clientData) {
        return catConversionFunctions.toServer(clientData);
    };
}

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
/**
 * @ngdoc object
 * @name cat.service.conversion:catConversionFunctions
 * @module cat.service.conversion
 *
 * @description
 * Value holding functions used by {@link cat.service.conversion:catConversionService catConversionService}
 *
 * @constructor
 */
    .value('catConversionFunctions', {
        toClient: _convertToClientData,
        toServer: function (clientData, context) {
            return clientData;
        }
    })
    .service('catConversionService', CatConversionService);
'use strict';


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
function CatElementVisibilityService() {

    /**
     * A helper function to determine wheter or not a ui element should be visible.
     *
     * @param {string} identifier an identifier upon which the the implementation can mofiy it's behaviour
     * @param data the data representing the element for which the visibility check is performed
     * @returns {boolean} <code>true</code> if the element should be rendered, <code>false</code> otherwise
     */
    this.isVisible = function (identifier, data) {
        return true;
    };
}

angular.module('cat.service.elementVisibility', [])
    .service('catElementVisibilityService', [CatElementVisibilityService]);
'use strict';

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nLocaleService
 * @module cat.service.i18n
 */
function CatI18nLocaleService($q, $locale, CAT_I18N_DEFAULT_LOCALE) {
    this.getLanguageOfLocale = function (locale) {
        if (_.isUndefined(locale)) {
            return undefined;
        }

        if (locale.indexOf('-') !== -1) {
            return locale.split('-')[0];
        }

        return locale;
    };

    this.getCurrentLocale = function () {
        return $locale.id;
    };

    this.getDefaultLocale = function () {
        return CAT_I18N_DEFAULT_LOCALE;
    };
}

angular.module('cat.service.i18n.locale', [])
/**
 * @ngdoc overview
 * @name cat.service.i18n:CAT_I18N_DEFAULT_LOCALE
 * @constant
 *
 * @description
 * The default locale used for message translation
 */
    .constant('CAT_I18N_DEFAULT_LOCALE', 'de')
    .service('catI18nLocaleService', ['$q', '$locale', 'CAT_I18N_DEFAULT_LOCALE', CatI18nLocaleService]);
'use strict';

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
function CatI18nMessageSourceService($q, catI18nLocaleService, CAT_I18N_DEFAULT_LOCALE) {
    function _getLocale(locale) {
        return locale || catI18nLocaleService.getDefaultLocale();
    }

    function _getMessages(locale) {
        var localeId = _getLocale(locale);

        var messages = window.cat.i18n[localeId];
        if (_.isUndefined(messages)) {
            messages = _getMessages(catI18nLocaleService.getDefaultLocale());
        }
        if (localeId !== CAT_I18N_DEFAULT_LOCALE && _.isUndefined(messages)) {
            messages = _getMessages(CAT_I18N_DEFAULT_LOCALE);
        }

        return messages;
    }

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
    this.getMessages = function (locale) {
        return $q.when(_getMessages(locale));
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
    this.getMessage = function (key, locale) {
        var bundle = _getMessages(locale);
        if (_.isUndefined(bundle) || _.isUndefined(bundle[key])) {
            return $q.reject('No message found for key \'' + key + '\' and the given locale \'' + _getLocale(locale) + '\'');
        }
        return $q.when(bundle[key]);
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
    this.hasMessage = function (key, locale) {
        var bundle = _getMessages(locale);
        return $q.when(!_.isUndefined(bundle) && !_.isUndefined(bundle[key]));
    };
}

angular.module('cat.service.i18n.message', ['cat.service.i18n.locale'])
    .service('catI18nMessageSourceService', ['$q', 'catI18nLocaleService', 'CAT_I18N_DEFAULT_LOCALE', CatI18nMessageSourceService]);

/**
 * Created by tscheinecker on 21.10.2014.
 */
'use strict';

function CatI18nService($q, $log, catI18nMessageSourceService, catI18nMessageParameterResolver) {
    var that = this;

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
    this.translate = function (key, parameters, locale) {
        var deferred = $q.defer();
        var model = parameters;

        if (_.isArray(parameters)) {
            parameters.forEach(function (value, idx) {
                model['p' + idx] = value;
            });
        }

        that.canTranslate(key, locale).then(
            function (canTranslate) {
                if (canTranslate) {
                    catI18nMessageSourceService.getMessage(key, locale).then(
                        function (message) {
                            try {
                                var translation = catI18nMessageParameterResolver(message, model);
                                if (_.isString(translation)) {
                                    deferred.resolve(translation);
                                } else {
                                    $log.warn('Didn\'t get a string from catI18nMessageParameterResolver');
                                    deferred.reject(translation);
                                }
                            } catch (e) {
                                $log.warn(e);
                                deferred.reject(e);
                            }
                        },
                        function (reason) {
                            $log.warn(reason);
                            deferred.reject(reason);
                        }
                    );
                } else {
                    var reason = 'No translation for key \'' + key + '\' available!';
                    $log.warn(reason);
                    deferred.reject(reason);
                }
            },
            deferred.reject
        );
        return deferred.promise;
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
    this.canTranslate = function (key, locale) {
        var deferred = $q.defer();

        catI18nMessageSourceService.getMessages(locale).then(
            function (messages) {
                deferred.resolve(!_.isUndefined(messages) && !_.isUndefined(messages[key]));
            },
            function (reason) {
                $q.reject(reason);
            }
        );

        return deferred.promise;
    };
}

angular.module('cat.service.i18n', ['cat.service.i18n.message'])
/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nMessageParameterResolver
 * @value
 *
 * @description
 * A function which accepts a message and parameters and returns the resolved message
 */
    .value('catI18nMessageParameterResolver', function (message, parameters) {
        var result = _.template(message, null, {interpolate: /{{([\s\S\d]+?)}}/g})(parameters || {});

        // lodash >=3
        if (_.isFunction(result)) {
            return result();
        }
        return result;  // lodash <3
    })


    /**
     * @ngdoc service
     * @name cat.service.i18n:catI18nService
     * @service
     *
     * @description
     * A service to translate message keys to messages of specific locales
     *
     * @param {object} $q DOCTODO
     * @param {object} catI18nMessageSourceService DOCTODO
     * @param {object} catI18nMessageParameterResolver DOCTODO
     * @constructor
     */
    .service('catI18nService', ['$q', '$log', 'catI18nMessageSourceService', 'catI18nMessageParameterResolver', CatI18nService]);

'use strict';

/**
 * @ngdoc service
 * @name cat.service.listDataLoading:catListDataLoadingService
 */
angular
    .module('cat.service.listDataLoading', [
        'cat.service.api',
        'ui.router'
    ])
    .factory('catListDataLoadingService', ['$state', '$location', '$q', 'catApiService', 'catSearchService', function CatListDataLoadingService($state, $location, $q, catApiService, catSearchService) {
        var load = function (endpoint, searchRequest) {
            var deferred = $q.defer();
            endpoint.list(searchRequest).then(
                function success(data) {
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

                    deferred.resolve(_.assign(result, data));
                },
                function error(reason) {
                    deferred.reject(reason);
                });
            return deferred.promise;
        };
        /**
         *
         * @param {String} endpointName
         * @param {Object} [defaultSort={property:'name',isDesc:false}]
         */
        var resolve = function (endpointName, defaultSort) {
            var searchRequest = catSearchService.fromLocation();
            if (!defaultSort) {
                defaultSort = {property: 'name', isDesc: false};
            }
            if (!!defaultSort && !$location.search().sort) {
                searchRequest.sort(defaultSort);
            }
            return load(catApiService[endpointName], searchRequest);
        };

        return {
            'load': load,
            'resolve': resolve
        };
    }]);

'use strict';

/**
 * @ngdoc service
 * @name cat.service.route:catRouteServiceProvider
 * @description
 * This service provider delegates to the $stateProvider and actually creates 2 separate routes after applying various
 * conventions / defaults
 */
CatRouteServiceProvider.$inject = ["$stateProvider"];
function CatRouteServiceProvider($stateProvider) {
    var viewNames = [];

    function _getListUrl(baseUrl, name, config) {
        var listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());

        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url;
        }

        return listUrl;
    }

    function _registerAbstractState(url, name) {
        $stateProvider
            .state(name, {
                abstract: true,
                template: '<ui-view></ui-view>',
                url: url
            });
    }

    function _getStateName(name, config) {
        if (!!config && !!config.parent) {
            return config.parent + '.' + name;
        }

        return name;
    }


    /**
     * A helper function for detail routes which applies a few optimizations and some auto configuration.
     * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
     * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
     * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
     * object which pre-loads all the necessary data.
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param name the name used to resolve default values like templates, etc.
     * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
     */
    function _getDetailConfig(config, name) {
        var _config = _.assign({name: name}, config);

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
    }

    function _registerDetailState(config, name) {
        var stateName = _getStateName(name, config);
        var detailConfig = _getDetailConfig(config, name);

        $stateProvider
            .state(stateName + '.detail', detailConfig);

        if (!!config && config.additionalViewTemplate === 'tabs') {
            $stateProvider
                .state(stateName + '.tab', {
                    abstract: true,
                    template: '<ui-view></ui-view>',
                    url: '/:' + name.toLowerCase() + 'Id'
                });
        }
    }

    /**
     * A helper function for list routes which applies a few optimizations and some auto configuration.
     * In the current state it handles 4 settings:
     * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
     * * controller - Auto-generation of the correct controller based on conventions and the config.name property
     * * reloadOnSearch - this property is set to false
     * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
     *
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param name the name used to resolve default values like templates, etc.
     * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
     */
    function _getListConfig(config, name) {
        var _config = _.assign({name: name}, config);

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
    }

    function _registerListState(config, name) {
        var stateName = _getStateName(name, config);
        var listConfig = _getListConfig(config, name);
        $stateProvider
            .state(stateName + '.list', listConfig);
    }


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
    this.detailRoute = function (baseUrl, name, config) {
        var stateName = _getStateName(name, config);

        var viewData = {viewData: !!config ? (config.viewData || {}) : {}};
        viewNames.push(stateName);

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(_.assign({}, config, viewData), name);
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
    this.listAndDetailRoute = function (baseUrl, name, config) {
        var stateName = _getStateName(name, config);

        var viewData = {viewData: !!config ? (config.viewData || {}) : {}};
        viewNames.push(stateName);
        if (_.isUndefined(config)) {
            config = {};
        }

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(_.assign({}, config.details, viewData), name);
        _registerListState(_.assign({}, config.list, viewData), name);
    };

    /**
     * @ngdoc service
     * @name cat.service.route:catRouteService
     * @module cat.service.route
     *
     * @description
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $stateProvider
     */
    this.$get = function () {
        return viewNames;
    };
}

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

'use strict';

/**
 * @ngdoc overview
 * @name cat.service.search
 */
angular.module('cat.service.search', [])
/**
 * @ngdoc service
 * @name cat.service.search:catUrlEncodingService
 * @module cat.service.search
 *
 * @description
 * A small helper service which encapsulates the url encoding of an object.
 * In it's default version it just delegates to jQuery.param
 */
    .service('catUrlEncodingService', function () {
        this.encodeAsUrl = function (params) {
            if (!!params && !_.isEmpty(params)) {
                return $.param(params);
            }

            return '';
        };
    })
    /**
     * @ngdoc service
     * @name cat.service.search:catSearchService
     * @requires cat.service.search:catUrlEncodingService
     * @module cat.service.search
     *
     * @descripton
     * A helper service which encapsulates several operations which can be performed on a cat.SearchRequest
     */
    .service('catSearchService', ["$location", "catUrlEncodingService", function ($location, catUrlEncodingService) {

        var _encodeSort = function (_sort) {
            return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
        };

        var _encodePagination = function (_pagination) {
            return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
        };
        var _encodeSearch = function (_search) {
            return catUrlEncodingService.encodeAsUrl(_search);
        };

        var _concatenate = function (result, next) {
            if (!result) {
                return next;
            }

            if (!next) {
                return result;
            }
            return result + '&' + next;
        };

        var urlEndoded = function (searchRequest) {
            return _([
                _encodePagination(searchRequest.pagination()),
                _encodeSort(searchRequest.sort()),
                _encodeSearch(searchRequest.search())
            ]).reduce(_concatenate);
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
        this.encodeAsUrl = function (searchRequest) {
            if (!searchRequest) {
                return '';
            }

            return urlEndoded(searchRequest);
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
        this.updateLocation = function (searchRequest) {
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
            $location.search(ret);
        };

        /**
         * @ngdoc function
         * @name fromLocation
         * @methodOf cat.service.search:catSearchService
         *
         * @description
         * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
         */
        this.fromLocation = function () {
            return new cat.SearchRequest($location.search());
        };
    }]);

'use strict';


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
function CatSelectConfigService(configs) {
    var _configs = configs;

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
    this.getConfig = function (name, options) {
        var config = configs[name];

        if (_.isUndefined(config) && _.isUndefined(options)) {
            return undefined;
        }

        return assignDeep(_.clone(config) || {}, options);
    };
}

/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigServiceProvider
 * @module cat.service.selectConfig
 *
 * @description
 *
 * @constructor
 */
function CatSelectConfigServiceProvider() {
    var configs = {};

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
    this.config = function (name, config) {
        if (!_.isUndefined(config)) {
            configs[name] = config;
        }

        return configs[name];
    };

    this.$get = function () {
        return new CatSelectConfigService(configs);
    };
}

angular.module('cat.service.selectConfig', []).provider('catSelectConfigService', CatSelectConfigServiceProvider);
/**
 * Created by Mustafa on 05.08.2015.
 */
angular.module('cat.url.resolver.service', []).service('urlResolverService', function () {

    'use strict';

    this.getTabTemplate = function (tab, config) {

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
});


'use strict';

/**
 * Validation Context which holds all information about a validation context
 * @param {string} uuid context identifier (optional)
 * @constructor
 */
function ValidationContext(uuid) {
    var that = this;
    this.uuid = uuid;
    this.global = undefined;
    this.fieldErrors = {};
    this.knownFields = [];

    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    this.registerField = function (name) {
        if (!_.includes(that.knownFields, name)) {
            that.knownFields.push(name);
        }
    };
}

function CatValidationService($log,
                              $globalMessages,
                              catValidations,
                              catValidationContexts,
                              catMessagesConfig,
                              catI18nService) {
    var that = this;

    /**
     * Adds a field error to the context
     * @param fieldName name of the faulty field
     * @param errorMessage associated error message to display
     * @param context affected context
     */
    function appendFieldErrorToContext(fieldName, errorMessage, context) {
        if (catMessagesConfig.knownFieldsActive === true) {
            // If the error is for a known field, show the error at the field.
            // If not, display it as a global error.
            if (_.includes(context.knownFields, fieldName)) {
                context.fieldErrors[fieldName] = context.fieldErrors[fieldName] || [];
                context.fieldErrors[fieldName].push(errorMessage);
            } else {
                context.global = [errorMessage];
                // TODO is this also context dependend? or even necessary?
                $globalMessages.addMessages('error', context.global, context);
            }
        } else {
            context.fieldErrors[fieldName] = context.fieldErrors[fieldName] || [];
            context.fieldErrors[fieldName].push(errorMessage);
        }
    }

    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    this.getContext = function (contextId) {
        if (contextId !== undefined) {
            var validations = catValidationContexts[contextId];
            if (validations === undefined) {
                throw new Error('Unknown contextId: ' + contextId);
            }
            return validations;
        } else {
            return catValidations;
        }
    };

    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    this.createContext = function () {
        var uuid = window.cat.util.generateUUID();
        catValidationContexts[uuid] = new ValidationContext(uuid);
        return uuid;
    };

    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    this.destroyContext = function (contextId) {
        delete catValidationContexts[contextId];
    };

    /**
     * Adds a error message for a specific field to the context.
     * @param fieldName name of the faulty field
     * @param errorMessage associated error message
     * @param contextId id of the affected context
     */
    this.addFieldError = function (fieldName, errorMessage, contextId) {
        var context = that.getContext(contextId);
        context.fieldErrors = context.fieldErrors || {};
        appendFieldErrorToContext(fieldName, errorMessage, context);
    };

    this.updateFromRejection = function (rejection) {
        var contextId;
        if (!!rejection.config) {
            contextId = rejection.config.catValidationContextId;
        }

        var context = that.getContext(contextId);
        context.fieldErrors = {};

        var rejectionData = rejection.data;
        context.global = undefined;

        if (!rejectionData) {
            $log.warn('Network error occurred');
            $log.warn(rejection);
            catI18nService
                .translate('cc.catalysts.cat-validation-service.networkError')
                .then(function(message) {
                    context.global = [message];
                });
            return;
        }

        if (!!rejectionData.fieldErrors) {
            // group by field
            _.forEach(rejection.data.fieldErrors, function (fieldError) {
                // Allow config to switch between displaying errors at the field and displaying errors at known fields or globally
                appendFieldErrorToContext(fieldError.field, fieldError.message, context);
            });
        }

        if (!!rejectionData.globalErrors) {
            context.global = rejection.data.globalErrors;

            // TODO is this also context dependend? or even necessary?
            $globalMessages.addMessages('error', rejection.data.globalErrors, context);
        }
    };

    this.clearValidationErrors = function (contextId) {
        var context = that.getContext(contextId);
        delete context.global;
        context.fieldErrors = {};
    };

    /**
     * Clears existing errors for the field of the specified context
     * @param fieldName name of the field
     * @param contextId id of the affected context
     */
    this.clearFieldError = function (fieldName, contextId) {
        var context = that.getContext(contextId);
        delete context.fieldErrors[fieldName];
    };

    this.hasGlobalErrors = function (contextId) {
        var globalErrors = that.getContext(contextId).global;
        return !!globalErrors && globalErrors.length > 0;
    };

    this.getGlobalErrors = function (contextId) {
        return that.getContext(contextId).global;
    };

    this.hasFieldErrors = function (fieldName, contextId) {
        var fieldErrors = that.getContext(contextId).fieldErrors[fieldName];
        return !!fieldErrors && fieldErrors.length > 0;
    };

    this.hasAnyFieldErrors = function (contextId) {
        var fieldErrors = that.getContext(contextId).fieldErrors;
        return !_.isEmpty(fieldErrors);
    };

    this.getFieldErrors = function (fieldName, contextId) {
        return that.getContext(contextId).fieldErrors[fieldName];
    };

    this.hasErrors = function (contextId) {
        var hasGlobalErrors = this.hasGlobalErrors(contextId);
        var hasFieldErrors = this.hasAnyFieldErrors(contextId);
        return hasGlobalErrors || hasFieldErrors;
    };

    this.prepareConfig = function (contextId, config) {
        return _.assign(config || {}, {
            catValidationContextId: contextId
        });
    };
}

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
    /**
     * @ngdoc object
     * @name cat.service.validation:catValidations
     *
     * @description
     * value holding 'global' and 'field' errors
     */
    .value('catValidations', new ValidationContext())

    /**
     * @ngdoc object
     * @name cat.service.validation:catValidationContexts
     *
     * @description
     * value holding 'global' and 'field' errors
     */
    .value('catValidationContexts', {})

    /**
     * @ngdoc service
     * @name cat.service.validation:catValidationService
     *
     * @description
     * Service which maps the 'fieldErrors' list recieved from the backend to a usable map for the client. All methods
     * have a 'context' parameter as the last parameter. If no context is provided the global context will be used,
     * otherwise the field error messages will be assigned to the specified context.
     */
    .service('catValidationService', [
        '$log',
        '$globalMessages',
        'catValidations',
        'catValidationContexts',
        'catMessagesConfig',
        'catI18nService',
        CatValidationService
    ]);
/**
 * @author Thomas Scheinecker, Catalysts GmbH.
 */

'use strict';

CatViewConfigService.$inject = ["$q", "catApiService", "catListDataLoadingService"];
function CatViewConfigService($q, catApiService, catListDataLoadingService) {
    function toLowerCaseName(name) {
        if (!name) {
            return '';
        }
        return name.toLowerCase();
    }

    function getDetailData($stateParams, Model, endpoint) {
        var detailPromise;

        var detailId = $stateParams.id;
        if (detailId === 'new') {
            detailPromise = $q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    function getEndpoint(endpointName, parentEndpointNames, $stateParams) {
        var endpoint = catApiService[endpointName];

        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName, idx) {
                var currentEndpoint;
                if (idx === 0) {
                    // root api endpoint
                    currentEndpoint = catApiService[parentEndpointName];
                } else {
                    // child api endpoint
                    currentEndpoint = endpoint[parentEndpointName];
                }
                endpoint = currentEndpoint.res($stateParams[parentEndpointName + 'Id']);
            });

            endpoint = endpoint[endpointName];
        }

        return endpoint;
    }

    function getParentInfo(endpoint) {
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            var deferred = $q.defer();
            var parents = [];
            endpoint.parentInfo().then(
                function (parent) {
                    parents.push(parent);
                    getParentInfo(endpoint.parentEndpoint).then(
                        function (response) {
                            parents.push(response);
                            parents = _.flatten(parents);
                            deferred.resolve(parents);
                        },
                        function (error) {
                            deferred.reject(error);
                        }
                    );
                }, function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        } else {
            return $q.when([]);
        }
    }

    this.getDetailConfig = function (config, $stateParams) {
        var endpointName, parentEndpointNames;

        if (_.isString(config.endpoint)) {
            endpointName = config.endpoint;
        } else if (_.isObject(config.endpoint)) {
            parentEndpointNames = config.endpoint.parents;
            endpointName = config.endpoint.name;
        } else {
            endpointName = toLowerCaseName(config.name);
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

        var templateUrls = {
            edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
            view: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html'
        };

        if (config.additionalViewTemplate === true) {
            templateUrls.view = {
                main: templateUrls.view,
                additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
            };
        } else if (config.additionalViewTemplate === 'tabs') {
            templateUrls.view = {
                main: templateUrls.view,
                additional: 'template/cat-base-additional-details-tabs-view.tpl.html'
            };
            tabs = config.additionalViewTemplateTabs;
        }

        var deferred = $q.defer();
        var endpoint = getEndpoint(endpointName, parentEndpointNames, $stateParams);

        var resolvedConfig = {
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs
        };


        var detailPromise = getDetailData($stateParams, Model, endpoint);
        detailPromise.then(function (data) {
            resolvedConfig.detail = data;
        });

        var parentsPromise = getParentInfo(endpoint);
        parentsPromise.then(function (parents) {
            resolvedConfig.parents = parents;
        });

        $q.all([detailPromise, parentsPromise]).then(
            function () {
                deferred.resolve(resolvedConfig);
            },
            function (reason) {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    };


    function getListDataPromise(config, name) {
        return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    }

    this.getListConfig = function (config) {
        var name = toLowerCaseName(config.name);

        var deferredConfig = $q.defer();
        var resolvedConfig = {
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'Controller',
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };

        getListDataPromise(config, name).then(
            function (listData) {
                resolvedConfig.listData = listData;
                deferredConfig.resolve(resolvedConfig);
            }
        );

        return deferredConfig.promise;
    };
}

angular
    .module('cat.service.view.config', [
        'cat.service.api',
        'cat.service.listDataLoading'
    ])
    .service('catViewConfigService', CatViewConfigService);

'use strict';

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
CatViewServiceProvider.$inject = ["catRouteServiceProvider", "catApiServiceProvider"];
function CatViewServiceProvider(catRouteServiceProvider, catApiServiceProvider) {
    var viewNames = [];
    var endpointNames = [];

    /**
     * This function registers a new api endpoint with catApiServiceProvider and a list and detail route with
     * catRouteServiceProvider
     * @param {string} baseUrl the base url which will be prepended to all generated route pats
     * @param {string} name the name used as entry point to all routes and endpoint creations (camel cased)
     * @param {object} [config] the config object which can in turn hold objects used for configuration of the endpoint,
     * detail route or list route
     */
    this.listAndDetailView = function (baseUrl, name, config) {
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


        viewNames.push(name);
        endpointNames.push(endpointName);

        catApiServiceProvider.endpoint(name.toLowerCase(), endpoint);
        catRouteServiceProvider.listAndDetailRoute(baseUrl, name, config);
    };

    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to other service providers
     * @return {{views: Array, endpoints: Array}}
     */
    this.$get = function () {
        return {
            views: viewNames,
            endpoints: endpointNames
        };
    };
}

angular.module('cat.service.view',
    [
        'cat.service.api',
        'cat.service.route',
        'cat.service.view.config'
    ]).provider('catViewService', CatViewServiceProvider);
'use strict';

angular.module('cat.service.httpIntercept', ['cat.service.message', 'cat.service.loading', 'cat.service.validation'])

/**
 * @ngdoc service
 * @name cat.service.httpIntercept:errorHttpInterceptor
 */
    .factory('errorHttpInterceptor', ["$q", "$globalMessages", "loadingService", "$injector", function CatErrorHttpInterceptor($q, $globalMessages, loadingService, $injector) {
        function toBeIgnored(config) {
            return !!config && config.skipLoadingService;
        }

        return {
            'request': function (config) {
                if (!toBeIgnored(config)) {
                    loadingService.start();
                }
                return config;
            },
            'requestError': function (rejection) {
                if (!toBeIgnored(rejection.config)) {
                    loadingService.stop();
                }
                return $q.reject(rejection);
            },
            'response': function (success) {
                if (!toBeIgnored(success.config)) {
                    loadingService.stop();
                }
                return success;
            },
            'responseError': function (rejection) {
                if (!toBeIgnored(rejection.config)) {
                    loadingService.stop();
                }
                $injector.get('catValidationMessageHandler').handleRejectedResponse(rejection);
                return $q.reject(rejection);
            }
        };
    }])
    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    }]);

'use strict';

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
        function CatLoadingService($rootScope, $timeout, usSpinnerService, CAT_LOADING_SERVICE_DEFAULTS) {
            var that = this;
            var activeCount = 0;
            var startTime;
            var startTimer, stopTimer;

            this.start = function () {
                if (!activeCount && !startTimer) {
                    if (!!stopTimer) {
                        $timeout.cancel(stopTimer);
                        stopTimer = undefined;
                    }
                    startTimer = $timeout(function () {
                        usSpinnerService.spin('loading-spinner');
                        $rootScope.loading = true;
                        startTime = new Date().getTime();
                    }, CAT_LOADING_SERVICE_DEFAULTS.timeout);
                }
                activeCount++;
            };

            this.stop = function () {
                activeCount--;
                if (!activeCount && !stopTimer) {
                    if (!!startTimer) {
                        $timeout.cancel(startTimer);
                        startTimer = undefined;
                    }
                    var now = new Date().getTime();
                    var stopTimeout = CAT_LOADING_SERVICE_DEFAULTS.timeout + (Math.max((CAT_LOADING_SERVICE_DEFAULTS.animationDuration - (now - startTime)), 0));
                    stopTimer = $timeout(function () {
                        usSpinnerService.stop('loading-spinner');
                        $rootScope.loading = false;
                    }, stopTimeout);
                }
            };

            var stateChangeInProgress = false;

            $rootScope.$on('$stateChangeStart', function () {
                if (!stateChangeInProgress) {
                    that.start();
                    stateChangeInProgress = true;
                }

            });
            $rootScope.$on('$stateChangeSuccess', function () {
                that.stop();
                stateChangeInProgress = false;
            });
            $rootScope.$on('$stateChangeError', function () {
                that.stop();
                stateChangeInProgress = false;
            });
        }]);

'use strict';

function MenuEntry(menuEntryId, options, parent) {
    this.id = menuEntryId;
    this.completeId = parent.completeId + '.' + this.id;
    var _options = options;

    this.getOptions = function () {
        return _options;
    };

    this.isGroup = function () {
        return false;
    };

    this.isMenu = function () {
        return false;
    };
}

function MenuGroup(groupId, options, parent) {
    var that = this;
    this.id = groupId;
    this.completeId = parent.completeId + '.' + this.id;
    var _menuEntries = [];
    var _options = options;

    this.addMenuEntry = function (menuEntryId, options) {
        _menuEntries.push(new MenuEntry(menuEntryId, options, that));
    };

    this.getOptions = function () {
        return _options;
    };

    this.getEntries = function () {
        return _.sortBy(_menuEntries, function (entry) {
            return entry.getOptions().sortOrder || 10000;
        });
    };

    this.isGroup = function () {
        return true;
    };

    this.isMenu = function () {
        return false;
    };

    this.isSubMenu = function () {
        return (_options.displayAsSubMenu === true);
    };
}

function Menu(menuId, options) {
    var that = this;
    this.id = menuId;
    this.completeId = this.id;
    var _menuEntries = [];
    var _menuGroups = {};
    var _options = options;

    this.addMenuGroup = function (groupId, options) {
        _menuGroups[groupId] = new MenuGroup(groupId, options, that);
    };

    this.addMenuEntry = function (groupId, menuEntryId, options) {
        if (_.isUndefined(groupId)) {
            _menuEntries.push(new MenuEntry(menuEntryId, options, that));
        } else {
            _menuGroups[groupId].addMenuEntry(menuEntryId, options);
        }
    };

    this.getGroups = function () {
        return _.sortBy(_.map(_menuGroups, function (menuGroup) {
            return menuGroup;
        }), function (menuGroup) {
            return menuGroup.getOptions().sortOrder || 10000;
        });
    };

    this.getEntries = function (groupId) {
        if (_.isUndefined(groupId)) {
            return _.sortBy(_menuEntries, function (entry) {
                return entry.getOptions().sortOrder || 10000;
            });
        }
        return _menuGroups[groupId].getEntries();
    };

    this.getFlattened = function () {
        return _.flatten([_menuEntries, _.map(this.getGroups(), function (group) {
            if (group.getOptions().displayAsSubMenu === true) {
                group.subEntries = group.getEntries();
                return [group];
            } else {
                return [group, group.getEntries()];
            }
        })], !!_.flattenDeep);
    };

    this.isMenu = function () {
        return true;
    };

    this.isGroup = function () {
        return false;
    };

    this.getOptions = function () {
        return _options;
    };
}

function MenuBar(menuBarId, options) {
    this.id = menuBarId;
    var _menus = {};
    var _options = options;

    this.addMenu = function (menuId, options) {
        _menus[menuId] = new Menu(menuId, options);
    };

    this.addMenuGroup = function (menuId, groupId, options) {
        _menus[menuId].addMenuGroup(groupId, options);
    };

    this.addMenuEntry = function (menuId, groupId, menuEntryId, options) {
        _menus[menuId].addMenuEntry(groupId, menuEntryId, options);
    };

    this.getMenus = function () {
        return _.map(_menus, function (menu) {
            return menu;
        });
    };

    this.getOptions = function () {
        return _options;
    };
}

/**
 * @ngdoc service
 * @name cat.service.menu:$mainMenu
 * @constructor
 */
function MainMenuProvider() {
    var _mainMenu = new MenuBar('main.menu', {});

    var _menus = [];
    var _groups = [];
    var _entries = [];

    this.menu = function (moduleId, options) {
        _menus.push({
            menuId: moduleId,
            options: options
        });
    };

    this.menuGroup = function (moduleId, groupId, options) {
        _groups.push({
            menuId: moduleId,
            groupId: groupId,
            options: options
        });
    };

    this.menuEntry = function (moduleId, groupId, entryId, options) {
        if (_.isUndefined(options)) {
            options = entryId;
            entryId = groupId;
            groupId = undefined;
        }
        _entries.push({
            menuId: moduleId,
            groupId: groupId,
            entryId: entryId,
            options: options
        });
    };

    this.$get = function () {
        _.forEach(_menus, function (menu) {
            _mainMenu.addMenu(menu.menuId, menu.options);
        });

        _.forEach(_groups, function (group) {
            _mainMenu.addMenuGroup(group.menuId, group.groupId, group.options);
        });

        _.forEach(_entries, function (entry) {
            _mainMenu.addMenuEntry(entry.menuId, entry.groupId, entry.entryId, entry.options);
        });

        return _mainMenu;
    };
}

angular.module('cat.service.menu', []).provider('$mainMenu', MainMenuProvider);

'use strict';

function CatGlobalMessages($rootScope) {

    function Message(data) {
        data = data || {};
        this.text = data.text || '';
        this.type = data.type;
        this.timeToLive = data.timeToLive || 0;
    }

    var messages = {};

    var self = this;

    this.getMessages = function (type) {
        if (!type) {
            return [];
        }

        return _.map(messages[type], function (message) {
            return message.text;
        });
    };

    this.hasMessages = function (type) {
        if (!type) {
            return false;
        }

        return !!messages[type] && messages[type].length !== 0;
    };

    this.clearMessages = function (type) {
        if (!type) {
            messages = {};
            return;
        }

        messages[type] = [];
    };

    this.clearDeadMessages = function () {
        for (var type in messages) {
            messages[type] = _.filter(messages[type], function (message) {
                return message.timeToLive > 0;
            });
        }
    };

    this.addMessage = function (type, message, flash) {
        if (!type) {
            return;
        }

        if (!messages[type]) {
            self.clearMessages(type);
        }

        messages[type].push(new Message({
            text: message,
            type: type,
            timeToLive: flash ? 1 : 0
        }));
    };

    this.decreaseTimeToLive = function () {
        for (var type in messages) {
            _.forEach(messages[type], function (message) {
                message.timeToLive--;
            });
        }
    };

    this.addMessages = function (type, messages) {
        if (!type) {
            return;
        }

        _.forEach(messages, function (message) {
            self.addMessage(type, message);
        });
    };

    this.setMessages = function (type, messages) {
        if (!type) {
            return;
        }

        self.clearMessages(type);
        if (!!messages) {
            self.addMessages(type, messages);
        }
    };

    $rootScope.$on('$stateChangeSuccess', function () {
        self.clearDeadMessages();
        self.decreaseTimeToLive();
    });
}

angular.module('cat.service.message', [
    'cat.config.messages'
])

/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
    .service('catValidationMessageHandler', ["$globalMessages", "catValidationService", function CatValidationMessageHandler($globalMessages, catValidationService) {
        this.handleRejectedResponse = function (rejection) {
            $globalMessages.clearMessages('error');

            if (!!rejection.data && !!rejection.data.error) {
                var error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
                if (!!rejection.data.cause) {
                    error += '\n' + rejection.data.cause;
                }
                $globalMessages.addMessage('error', error);
            }

            catValidationService.updateFromRejection(rejection);
        };
    }])

/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
    .service('$globalMessages', ['$rootScope', CatGlobalMessages]);

'use strict';

window.cat.util = window.cat.util || {};

/**
 * Capitalizes a string (first letter to uppercase)
 * @param string
 * @returns {string}
 */
window.cat.util.pluralize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }
    var lastChar = string[string.length - 1];

    switch (lastChar) {
        case 'y':
            // Exception if the word ends with 'ay' e.g. 'gateway'
            if (string[string.length - 2] === 'a') {
                return string + 's';
            }
            return string.substring(0, string.length - 1) + 'ies';
        case 's':
            return string + 'es';
        default :
            return string + 's';
    }
};

/**
 * Pluralizes a string
 * @param string
 * @returns {*}
 */
window.cat.util.capitalize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }

    return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
};

/**
 * Generates a new UUID
 *
 * @returns {string} uuid
 */
window.cat.util.generateUUID = function () {
    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    /* jshint ignore:start */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    /* jshint ignore:end */
};

/**
 * Created by tscheinecker on 01.08.2014.
 */

'use strict';

window.cat.util = window.cat.util || {};

window.cat.models = window.cat.models || {};

/**
 * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
 * @param name the name of the 'entity' for which the constructor has to be returned
 * @returns {Constructor}
 */
window.cat.util.defaultModelResolver = function (name) {
    return window.cat.models[name];
};
})(window.jQuery, window._, window.angular);
//# sourceMappingURL=cat-angular.js.map
