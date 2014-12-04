window.cat = {};

angular.module('cat.filters.replaceText', []);
angular.module('cat.filters', ['cat.filters.replaceText']);

angular.module('cat.template', ['ui.bootstrap.tpls']);

angular.module('cat.service.api', []);
angular.module('cat.service.breadcrumbs', []);
angular.module('cat.service.i18n', []);
angular.module('cat.service.listDataLoading', ['cat.service.api']);
angular.module('cat.service.route', ['ngRoute']);
angular.module('cat.service.selectConfig', []);
angular.module('cat.service.view', ['cat.service.api', 'cat.service.route']);
angular.module('cat.service.loading', ['angularSpinner']);
angular.module('cat.service.message', []);
angular.module('cat.service.httpIntercept', ['cat.service.loading', 'cat.service.message']);
angular.module('cat.service.menu', []);
angular.module('cat.service', [
    'cat.service.api',
    'cat.service.breadcrumbs',
    'cat.service.i18n',
    'cat.service.listDataLoading',
    'cat.service.route',
    'cat.service.selectConfig',
    'cat.service.view',
    'cat.service.loading',
    'cat.service.httpIntercept',
    'cat.service.menu',
    'cat.service.message'
]);

angular.module('cat.directives.autofocus', []);
angular.module('cat.directives.checkbox', []);
angular.module('cat.directives.confirmClick', []);
angular.module('cat.directives.fieldErrors', []);
angular.module('cat.directives.inputs', []);
angular.module('cat.directives.loadMore', []);
angular.module('cat.directives.menu', ['cat.service.menu']);
angular.module('cat.directives.select', ['ui.select2', 'cat.service.api', 'cat.service.selectConfig']);

angular.module('cat.directives.i18n', ['cat.service.i18n']);

angular.module('cat.directives.paginated', ['ui.bootstrap.pagination']);
angular.module('cat.directives.facets', ['cat.directives.paginated']);
angular.module('cat.directives.sortable', ['cat.directives.paginated']);

angular.module('cat.directives.form', []);
angular.module('cat.directives.numbersOnly', []);

angular.module('cat.controller.base.list', ['cat.service.breadcrumbs']);
angular.module('cat.controller.base.tabs', []);
angular.module('cat.controller.base.detail', ['cat.service.breadcrumbs', 'cat.controller.base.tabs']);
angular.module('cat.controller', ['cat.controller.base.detail', 'cat.controller.base.list']);

angular.module('cat.directives', [
    'cat.template',
    'cat.directives.autofocus',
    'cat.directives.checkbox',
    'cat.directives.confirmClick',
    'cat.directives.fieldErrors',
    'cat.directives.inputs',
    'cat.directives.loadMore',
    'cat.directives.menu',
    'cat.directives.select',
    'cat.directives.i18n',
    'cat.directives.paginated',
    'cat.directives.facets',
    'cat.directives.sortable',
    'cat.directives.form',
    'cat.directives.numbersOnly'
]);

angular.module('cat', [
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.filters',
    'cat.controller'
]);



window.cat = window.cat || {};

/**
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


window.cat = window.cat || {};

/**
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
            return $.param(_search);
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
            return _search;
        }
    };

    /**
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    this.urlEncoded = function () {
        lastEncoded = urlEndoded();
        return lastEncoded;
    };

    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    this.isDirty = function () {
        return lastEncoded !== urlEndoded();
    };

    /**
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


/**
 * @ngdoc function
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
 * * $fieldErrors - a map of validation errors returned by the server
 *
 * Common functions include:
 * * save - the save function to update / create an object
 * * edit - a function to switch from view to edit mode
 * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
 * * add - a function to switch into edit mode of a new object
 * * remove - a function to delete the current object
 * * title - a function to resolve a 'title' of the current object
 *
 * @param $scope
 * @param $routeParams
 * @param $location
 * @param $window
 * @param $globalMessages
 * @param $controller
 * @param $log
 * @param catBreadcrumbsService
 * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
 * @constructor
 */
function CatBaseDetailController($scope, $routeParams, $location, $window, $globalMessages, $controller, $log, catBreadcrumbsService, config) {
    $scope.detail = config.detail;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    var endpoint = config.endpoint;
    var baseUrl = config.baseUrl;
    var templateUrls = config.templateUrls;
    var Model = config.Model;

    $scope.uiStack = catBreadcrumbsService.generateFromConfig(config);

    if ($routeParams.id === 'new') {
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

    $scope.baseUrl = baseUrl;

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
    var reload = function () {
        endpoint.get($routeParams.id).then(function (data) {
            $scope.detail = data;
            update();
        });
    };

    $scope.reloadDetails = reload;

    $scope.exists = !!$routeParams.id && $routeParams.id !== 'new';

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
        $scope.editDetail = angular.copy($scope.detail);
        if (_.isFunction($scope.editDetail.setParent)) {
            $scope.editDetail.setParent(config.parents[0]);
        }
    };

    /**
     * Either cancels the current edit of an object by resetting it or triggers a history back event if the 'new' mode
     * is active
     */
    $scope.cancelEdit = function () {
        $scope.$broadcast('formReset');
        if ($scope.exists) {
            $scope.editDetail = undefined;
            $globalMessages.clearMessages();
            $scope.$fieldErrors = undefined;
        } else {
            $window.history.back();
        }
    };

    /**
     * Calls the remove function of the current endpoint and redirects to the given baseUrl upon success
     */
    $scope.remove = function () {
        endpoint.remove($scope.detail.id).then(function () {
            if (_.isEmpty($scope.uiStack)) {
                $location.path(baseUrl);
            } else {
                var parentUrl = $scope.uiStack[$scope.uiStack.length - 1].url;
                $location.path(parentUrl.substring(1, parentUrl.indexOf('?')));
                $location.search('tab', endpoint.getEndpointName());
            }
        });
    };

    /**
     * Calls the save function of the current endpoint.
     * Upon success the view mode of the details of the currently created / updated object will be shown.
     * Upon an error the reported errors (global & field errors) will be shown to the user and the edit mode
     * will remain active.
     */
    $scope.save = function () {
        endpoint.save($scope.editDetail).then(function (data) {
            $globalMessages.clearMessages();
            $scope.$fieldErrors = undefined;
            if (!$scope.exists) {
                $scope.$broadcast('formReset');
                $location.path(baseUrl + '/' + data.id);
            } else {
                $scope.editDetail = undefined;
                $scope.detail = data;
                update();
            }
        }, function (response) {
            if (!response.data.fieldErrors) {
                $scope.$fieldErrors = undefined;
                return;
            }
            // group by field
            var fieldErrors = {};
            _.forEach(response.data.fieldErrors, function (fieldError) {
                fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                fieldErrors[fieldError.field].push(fieldError.message);
            });

            $scope.$fieldErrors = fieldErrors;
            $scope.$broadcast('fieldErrors', fieldErrors);
        });
    };

    if ($scope.exists) {
        if (_.isUndefined($scope.detail)) {
            reload();
        } else {
            update();
        }
    } else {
        if (_.isUndefined($scope.detail)) {
            $scope.add();
        } else {
            $scope.edit();
        }
    }


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
}
CatBaseDetailController.$inject = ["$scope", "$routeParams", "$location", "$window", "$globalMessages", "$controller", "$log", "catBreadcrumbsService", "config"];

angular.module('cat.controller.base.detail').controller('CatBaseDetailController', CatBaseDetailController);


/**
 * @ngdoc function
 * @name CatBaseListController
 * @controller
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
 * @param $scope
 * @param $controller
 * @param $log
 * @param catBreadcrumbsService
 * @param {Object} config holds data like the listData object, the template url, base url, the model constructor, etc.
 * @constructor
 */
function CatBaseListController($scope, $controller, $log, catBreadcrumbsService, config) {
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
        return '#' + config.baseUrl + '/' + id;
    };

    this.getUrlForNewPage = function () {
        return this.getUrlForId('new');
    };


    try {
        // extend with custom controller
        $controller(config.controller, {$scope: $scope, listData: config.listData, config: config});
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }
}

angular.module('cat.controller.base.list')
    .controller('CatBaseListController',
    ['$scope', '$controller', '$log', 'catBreadcrumbsService', 'config', CatBaseListController]);



function CatBaseTabsController($scope, $controller, $routeParams, $location, config) {
    var endpoint = config.endpoint;

    $scope.tabs = config.tabs;
    $scope.tabNames = _.map(config.tabs, 'name');
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
        if (tab.name === $scope.tabNames[0] && _.isUndefined($routeParams.tab)) {
            // first tab is active if no parameter is given
            return true;
        }
        return $routeParams.tab === tab.name;
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

    // TODO replace by url resolver service as soon as it is available
    var parentUrl = endpoint.getEndpointName();
    var parentTemplateNamePrefix = endpoint.getEndpointName();

    var currentEndpoint = endpoint;

    while (!_.isUndefined(currentEndpoint.parentEndpoint)) {
        currentEndpoint = endpoint.parentEndpoint;
        var parentEndpointName = currentEndpoint.getEndpointName();

        parentUrl = parentEndpointName + '/' + parentUrl;

        parentTemplateNamePrefix = parentEndpointName + '-' + parentTemplateNamePrefix;
    }

    $scope.getTabTemplate = function (tab) {
        return parentUrl + '/' + tab + '/' + parentTemplateNamePrefix + '-' + tab + '-list.tpl.html';
    };

    var _getDefaultTabControllerName = function (tab) {
        return window.cat.util.capitalize(endpoint.getEndpointName()) + window.cat.util.capitalize(tab.name) + 'Controller';
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
CatBaseTabsController.$inject = ["$scope", "$controller", "$routeParams", "$location", "config"];

angular.module('cat.controller.base.tabs').controller('CatBaseTabsController', CatBaseTabsController);

angular.module('cat.filters.replaceText')
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


angular.module('cat.directives.autofocus')
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


angular.module('cat.directives.checkbox')
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

angular.module('cat.directives.confirmClick')
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


angular.module('cat.directives.facets')
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

/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.directives.fieldErrors')
    .directive('catFieldErrors', function CatFieldErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'E',
            scope: {
                errors: '=',
                name: '@'
            },
            template: '<div class="label label-danger" ng-if="errors[name]"><ul><li ng-repeat="error in errors[name]">{{error}}</li></ul></div>'
        };
    });
/**
 * Created by tscheinecker on 21.10.2014.
 */

angular.module('cat.directives.i18n')
    .directive('catI18n', ['$log', '$rootScope', 'catI18nService', function CatI18nDirective($log, $rootScope, catI18nService) {
        function _translate(scope, element) {
            if (!scope.key) {
                $log.warn('No key was given for cat-i18n!');
                return;
            }
            catI18nService.translate(scope.key, scope.params).then(
                function (message) {
                    element.text(message);
                }, function (reason) {
                    // TODO - introduce a handler service for this case - eg show '##missingkey: somekey##'
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

/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.directives.inputs')
    .directive('input', function CatInputDirective() {
        return {
            require: 'ngModel',
            restrict: 'E',
            link: function CatInputLink(scope, element, attrs, ctrl) {
                scope.$on('fieldErrors', function (event, fieldErrors) {
                    if (!fieldErrors || !attrs.id) {
                        return;
                    }
                    var valid = !fieldErrors[attrs.id];
                    ctrl.$setValidity(attrs.id, valid);
                });
            }
        };
    })
    .directive('catInputGroup', function CatInputGroupDirective() {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                errors: '=',
                label: '@',
                name: '@'
            },
            link: function CatInputGroupLink(scope, element) {
                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    });

angular.module('cat.directives.loadMore')
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


angular.module('cat.directives.menu')
    .directive('catMainMenu', ['$mainMenu', '$rootScope', function CatMainMenuDirective($mainMenu, $rootScope) {
        return {
            restrict: 'E',
            scope: {
            },
            link: function CatMainMenuLink(scope) {
                scope.menus = $mainMenu.getMenus();
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
                        return scope.isAllowed(entry);
                    }
                    return visible;
                };
                scope.isAllowed = function (entry) {
                    var rights = entry.getOptions().rights;
                    if (!!rights) {
                        if (_.isArray(rights)) {
                            var allowed = true;
                            for (var i = 0; i < rights.length; i++) {
                                allowed = allowed && $rootScope.isAllowed(rights[i]);
                            }
                            return allowed;
                        }
                        return $rootScope.isAllowed(rights);
                    }
                    return true;
                };
            },
            templateUrl: 'template/cat-main-menu.tpl.html'
        };
    }]);


angular.module('cat.directives.paginated')
    .directive('catPaginated', ["$log", "catI18nService", function CatPaginatedDirective($log, catI18nService) {
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
            controller: ["$scope", "$location", "$timeout", "$rootScope", "catListDataLoadingService", "catI18nService", function CatPaginatedController($scope, $location, $timeout, $rootScope, catListDataLoadingService, catI18nService) {
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

                var reload = function (delay) {
                    $timeout.cancel(searchTimeout);
                    searchTimeout = $timeout(function () {
                        if (searchRequest.isDirty()) {
                            catListDataLoadingService.load($scope.listData.endpoint, searchRequest).then(
                                function (data) {
                                    _.assign($scope.listData, data);
                                }
                            );
                        }
                    }, delay || 0);
                };

                $scope.$watch('listData.sort', function (newVal) {
                    if (!!newVal) {
                        console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                        $scope.$parent.$broadcast('SortChanged', newVal);
                    }
                }, true);

                $scope.$on('SearchChanged', function (event, value, delay) {
                    searchChanged(value, delay);
                });

                function updateLocation() {
                    if ($scope.syncLocation !== false) {
                        searchRequest.setSearch($location);
                        $location.replace();
                    }
                }

                $scope.$watch('listData.pagination', function () {
                    updateLocation();
                    reload();
                }, true);

                var searchChanged = function (value, delay) {
                    searchRequest.search(value);
                    updateLocation();
                    $scope.listData.pagination.page = 1;
                    reload(delay);
                };

                var updateSearch = function (value) {
                    var search = searchRequest.search();
                    _.assign(search, value);
                    $rootScope.$broadcast('SearchChanged', search, DELAY_ON_SEARCH);
                };

                $scope.$watch('listData.search', updateSearch, true);

                this.sort = function (value) {
                    searchRequest.sort(value);
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



function CatSelectLink(scope, element) {
    element.addClass('form-control');
}

var fetchElements = function (endpoint, sort) {
    return function (queryParams) {
        var searchRequest = new window.cat.SearchRequest(queryParams.data);
        searchRequest.sort(sort || { property: 'name', isDesc: false });
        return endpoint.list(searchRequest).then(queryParams.success);
    };
};

function CatSelectController($scope, $log, catApiService, catSelectConfigService) {

    var options = catSelectConfigService.getConfig($scope.config, $scope.options);

    if (_.isUndefined(options)) {
        throw new Error('At least one of "config" or "options" has to be specified');
    }

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
        transport = fetchElements(options.endpoint, options.sort);
        quietMillis = 500;
    } else if (_.isString(options.endpoint)) {
        var api = catApiService[options.endpoint];
        if (!api) {
            $log.error('No api endpoint "' + options.endpoint + '" defined');
            $scope.elements = [];
            return;
        }
        transport = fetchElements(api, options.sort);
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
                var more = (page * options.size || 100) < data.totalCount;
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
CatSelectController.$inject = ["$scope", "$log", "catApiService", "catSelectConfigService"];

/**
 * @ngdoc directive
 * @scope
 * @restrict EA
 * @description
 *
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
 *
 * @returns {{
 *      restrict: string,
 *      replace: boolean,
 *      priority: number,
 *      scope: {
 *          options: string,
 *          id: string,
 *          config: string
 *      },
 *      link: CatSelectLink,
 *      controller: CatSelectController,
 *      template: string
 * }}
 * @constructor
 */
function CatSelectDirective() {
    return {
        restrict: 'EA',
        replace: true,
        priority: 1,
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

angular.module('cat.directives.select')
    .directive('catSelect', CatSelectDirective);


angular.module('cat.directives.sortable')
    .directive('catSortable', ["$compile", function CatSortableDirective($compile) {
        return {
            restrict: 'AC',
            require: '^catPaginated',
            link: function CatSortableLink(scope, element, attrs, catPaginatedController) {
                var title = element.text();
                var property = attrs.catSortable || title.toLowerCase().trim();

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
                element.append($compile('<a class="sort-link" href="" ng-click="toggleSort(\'' + property + '\')" cat-i18n="cc.catalysts.cat-sortable.sort.' + property + '">' + title + ' <span class="glyphicon" ng-class="{\'' + icon + '\': sort.property == \'' + property + '\' && !sort.isDesc, \'' + icon + '-alt\': sort.property == \'' + property + '\' && sort.isDesc}"></span></a>')(scope));
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

angular.module('cat.directives.form')
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



angular.module('cat.directives.numbersOnly')
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
/**
 * Created by tscheinecker on 23.10.2014.
 */


window.cat.i18n = window.cat.i18n || {};
window.cat.i18n.de = window.cat.i18n.de || {};

_.assign(window.cat.i18n.de, {
    'cc.catalysts.cat-paginated.itemsFound': '{{count}} Einträge gefunden. Einträge {{firstResult}}-{{lastResult}}',
    'cc.catalysts.cat-paginated.noItemsFound': 'Keine Einträge gefunden',
    'cc.catalysts.general.new': 'Neu'
});

/**
 * Created by tscheinecker on 23.10.2014.
 */


window.cat.i18n = window.cat.i18n || {};
window.cat.i18n.en = window.cat.i18n.en || {};

_.assign(window.cat.i18n.en, {
    'cc.catalysts.cat-paginated.itemsFound': '{{count}} entries found. Entries {{firstResult}}-{{lastResult}}',
    'cc.catalysts.cat-paginated.noItemsFound': 'No entries found',
    'cc.catalysts.general.new': 'New'
});

/**
 * Created by tscheinecker on 26.08.2014.
 */


window.cat.util = window.cat.util || {};

window.cat.util.pluralize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }
    var lastChar = string[string.length - 1];

    switch (lastChar) {
        case 'y':
            return string.substring(0, string.length - 1) + 'ies';
        case 's':
            return string + 'es';
        default :
            return string + 's';
    }

};

window.cat.util.capitalize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }

    return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
};
/**
 * Created by tscheinecker on 01.08.2014.
 */



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

var toLowerCaseName = function (name) {
    if (!name) {
        return '';
    }
    return name.toLowerCase();
};

/**
 * Helper function to extract the base url from the current route and the parent endpoints
 * @param $route The angular $route service
 * @param {string} [baseUrl]
 * @param {array} [parentEndpointNames]
 * @return {string} the extracted baseUrl which is either the provided one, or one, generated from the parentEndpointNames
 */
var getBaseUrl = function ($route, baseUrl, parentEndpointNames) {
    if (_.isUndefined(baseUrl)) {
        baseUrl = $route.current.originalPath;
        if (_.keys($route.current.pathParams).length !== 0) {
            baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
        }
        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName) {
                var idName = parentEndpointName + 'Id';
                baseUrl = baseUrl.replace(':' + idName, $route.current.params[idName]);
            });
        }
    }

    return baseUrl;
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
 * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
 */
var listRoute = function (config) {
    var name = toLowerCaseName(config.name);

    function getListDataPromise(catListDataLoadingService) {
        return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    }

    function getResolvedConfig($q, $route, catListDataLoadingService) {
        var deferredConfig = $q.defer();
        var resolvedConfig = {
            controller: config.controller || config.name + 'Controller',
            baseUrl: getBaseUrl($route, config.baseUrl),
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };

        getListDataPromise(catListDataLoadingService).then(
            function (listData) {
                resolvedConfig.listData = listData;
                deferredConfig.resolve(resolvedConfig);
            }
        );

        return deferredConfig.promise;
    }

    return {
        reloadOnSearch: false,
        controller: 'CatBaseListController',
        controllerAs: 'catBaseListController',
        templateUrl: config.templateUrl || 'template/cat-base-list.tpl.html',
        resolve: {
            config: getResolvedConfig
        }
    };
};

/**
 * A helper function for detail routes which applies a few optimizations and some auto configuration.
 * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
 * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
 * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
 * object which pre-loads all the necessary data.
 * @param {Object} config the route config object which will be used to generate the actual route configuration
 * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
 */
var detailRoute = function (config) {
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

    function getEndpoint($route, catApiService) {
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
                endpoint = currentEndpoint.res($route.current.params[parentEndpointName + 'Id']);
            });

            endpoint = endpoint[endpointName];
        }

        return endpoint;
    }

    function getDetailData($route, $q, endpoint) {
        var detailPromise;
        var detailId = $route.current.params.id;
        if (detailId === 'new') {
            detailPromise = $q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    function getConfig($route, $q, catApiService) {
        var deferred = $q.defer();
        var endpoint = getEndpoint($route, catApiService);

        var baseUrl = getBaseUrl($route, config.baseUrl, parentEndpointNames);

        var resolvedConfig = {
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs,
            baseUrl: baseUrl
        };


        var detailPromise = getDetailData($route, $q, endpoint);
        detailPromise.then(function (data) {
            resolvedConfig.detail = data;
        });

        var parentsPromise = getParentInfo($q, endpoint);
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
    }

    function getParentInfo($q, endpoint) {
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            var deferred = $q.defer();
            var parents = [];
            endpoint.parentInfo().then(
                function (parent) {
                    parents.push(parent);
                    getParentInfo($q, endpoint.parentEndpoint).then(
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

    return {
        templateUrl: config.templateUrl || 'template/cat-base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: function ($route, $q, catApiService) {
                return getConfig($route, $q, catApiService);
            }
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};


/**
 * A CatApiEndpoint wraps several helper functions to easily execute backend calls for the base CRUD operations.
 * It also adds support for 'children' which can only be used by resolving them for a parent id.
 * @param {string} url the base url which is added before the configured urls
 * @param {object} endpointConfig the configuration of this endpoint - holds properties like name, url, the model and children
 * @param {object} $http the angular $http service which handles the actual xhr requests
 * @constructor
 */
function CatApiEndpoint(url, endpointConfig, $http) {
    var that = this;

    var _endpointName = endpointConfig.name;
    var _endpointUrl = url + (endpointConfig.config.url || endpointConfig.name);
    var ModelClass = endpointConfig.config.model;
    var _childEndpointSettings = endpointConfig.children;

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
            ret[path] = new CatApiEndpoint(url, _childEndpointSettings[path], $http);
            ret[path].parentEndpoint = that;
            ret[path].parentId = id;
            ret[path].parentInfo = function () {
                return that.info(id);
            };
        });
        return ret;
    });

    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    var _mapResponse = function (data) {
        var object = new ModelClass(data);
        return _.merge(object, _res(object.id));
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
        return !!searchRequest && searchRequest instanceof window.cat.SearchRequest ? '?' + searchRequest.urlEncoded() : '';
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
     * This function calls the url available via #getEndpointUrl without further modification apart from adding search
     * parameters if the searchRequest parameter is provided. It can handle either an array response in which case all
     * elements will be mapped to the appropriate configured model or a 'paginated' result in which case an object
     * with totalCount, facests and elements will be returned.
     *
     * @param {SearchRequest} [searchRequest] if given searchRequest#urlEncoded() will be added to the request url
     * @return {[{object}]|{totalCount: {Number}, facets: [{Facet}], elements: []}} a promise wrapping either a list of
     * instances of the configured model or a wrapper object which holds not only the list but pagination information
     * as well
     */
    this.list = function (searchRequest) {
        return $http.get(_endpointUrl + _getSearchQuery(searchRequest)).then(function (response) {
            if (!!response.data.totalCount || response.data.totalCount === 0) {
                var facets = [];

                if (!!response.data.facets) {
                    facets = _.map(response.data.facets, function (facet) {
                        return new window.cat.Facet(facet);
                    });
                }

                var result = {
                    totalCount: response.data.totalCount,
                    facets: facets,
                    elements: _.map(response.data.elements, function (elem) {
                        return _mapResponse(elem);
                    })
                };

                delete response.data.totalCount;
                delete response.data.elements;
                delete response.data.facets;

                return _.assign(result, response.data);
            } else {
                return _.map(response.data, function (elem) {
                    return _mapResponse(elem);
                });
            }
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

// this is saved outside so that both $api and catApiService use the same config - will be moved back inside
// CatApiServiceProvider in a future release
var _endpoints = {};

/**
 * @ngdoc service
 * @description
 *
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
function CatApiServiceProvider() {
    var _urlPrefix = '/api/';

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


    this.$get = ['$http',
        /**
         * @return {object} returns a map from names to CatApiEndpoints
         */
            function $getCatApiService($http) {
            var catApiService = {};

            _.forEach(_.keys(_endpoints), function (path) {
                catApiService[path] = new CatApiEndpoint(_urlPrefix, _endpoints[path], $http);
            });

            return catApiService;
        }];
}
angular.module('cat.service.api').provider('catApiService', CatApiServiceProvider);
// $api is deprecated, will be removed in a future release
angular.module('cat.service.api').provider('$api', CatApiServiceProvider);



/**
 * @ngdoc service
 * @name catBreadcrumbService
 * @service
 *
 * @description
 *
 * This service is a simple wrapper around a list of Objects.
 * It provides some convenience methods for manipulating the list.
 * It's main purpose is to make breadcrumb handling less cumbersome.
 *
 * @constructor
 */
function CatBreadcrumbsService() {
    var _bc = [];
    var that = this;

    this.clear = function () {
        _bc = [];
    };

    this.set = function (bc) {
        _bc = bc;
    };

    this.get = function () {
        return _bc;
    };

    this.addFirst = function (entry) {
        _bc.unshift(entry);
    };

    this.removeFirst = function () {
        return _bc.shift();
    };

    this.push = function (entry) {
        _bc.push(entry);
    };

    this.pop = function () {
        return _bc.pop();
    };

    this.length = function () {
        return _bc.length;
    };

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.substring(1);
    }

    this.replaceLast = function (newVal) {
        _bc[_bc.length - 1] = newVal;
    };

    function splitShiftAndJoin(path, amount) {
        return _.initial(path.split('/'), amount).join('/');
    }

    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    this.generateFromConfig = function (config) {
        that.clear();
        var uiStack = [];
        if (!_.isUndefined(config.endpoint.parentEndpoint)) {
            var currentEndpoint = config.endpoint;
            var parentEndpoint = currentEndpoint.parentEndpoint;
            var parentUrl = config.baseUrl;
            var count = 0;

            while (!_.isUndefined(parentEndpoint)) {
                var parent = config.parents[count++];
                parentUrl = splitShiftAndJoin(parentUrl, 1);

                var detailBreadcrumb = {
                    url: '#' + parentUrl + '?tab=' + currentEndpoint.getEndpointName(),
                    title: parent.name
                };
                uiStack.unshift(detailBreadcrumb);
                that.addFirst(detailBreadcrumb);

                parentUrl = splitShiftAndJoin(parentUrl, 1);
                var breadcrumb = {
                    title: capitalize(window.cat.util.pluralize(parentEndpoint.getEndpointName())),
                    key: 'cc.catalysts.cat-breadcrumbs.entry.' + config.endpoint.getEndpointName(),
                    url: '#' + parentUrl
                };
                that.addFirst(breadcrumb);

                currentEndpoint = parentEndpoint;
                parentEndpoint = currentEndpoint.parentEndpoint;
            }
        } else {
            that.push({
                title: capitalize(window.cat.util.pluralize(config.endpoint.getEndpointName())),
                key: 'cc.catalysts.cat-breadcrumbs.entry.' + config.endpoint.getEndpointName(),
                url: '#' + config.baseUrl
            });
        }
        return uiStack;
    };
}

angular.module('cat.service.breadcrumbs').service('catBreadcrumbsService', CatBreadcrumbsService);

// TODO remove in future release
angular.module('cat.service.breadcrumbs').service('$breadcrumbs', CatBreadcrumbsService);
/**
 * Created by tscheinecker on 23.10.2014.
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

angular.module('cat.service.i18n')
/**
 * @ngdoc constant
 * @name CAT_I18N_DEFAULT_LOCALE
 * @constant
 *
 * @description
 * The default locale used for message translation
 */
    .constant('CAT_I18N_DEFAULT_LOCALE', 'de')
    .service('catI18nLocaleService', ['$q', '$locale', 'CAT_I18N_DEFAULT_LOCALE', CatI18nLocaleService]);

/**
 * Created by tscheinecker on 23.10.2014.
 */


function CatI18nMessageSourceService($q, catI18nLocaleService, CAT_I18N_DEFAULT_LOCALE) {
    function _getLocale(locale) {
        return locale || catI18nLocaleService.getDefaultLocale();
    }

    function _getMessages(locale) {
        var localeId = _getLocale(locale);

        var messages = window.cat.i18n[localeId];
        if (_.isUndefined(messages)) {
            messages = _getMessages(catI18nLocaleService.getLanguageOfLocale(localeId));
        }
        if (localeId !== CAT_I18N_DEFAULT_LOCALE && _.isUndefined(messages)) {
            messages = _getMessages(CAT_I18N_DEFAULT_LOCALE);
        }

        return messages;
    }

    /**
     * @ngdoc method
     * @name catI18nMessageSourceService#getMessages
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
     * @ngdoc method
     * @name catI18nMessageSourceService#getMessage
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
     * @ngdoc method
     * @name catI18nMessageSourceService#hasMessage
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

angular.module('cat.service.i18n')
/**
 * @ngdoc service
 * @name catI18nMessageSourceService
 * @service
 *
 * @description
 * A service to retrieve message templates for a given key and locale
 *
 *
 * @param $q
 * @param $locale
 * @param CAT_I18N_DEFAULT_LOCALE
 * @constructor
 */
    .service('catI18nMessageSourceService', ['$q', 'catI18nLocaleService', 'CAT_I18N_DEFAULT_LOCALE', CatI18nMessageSourceService]);

/**
 * Created by tscheinecker on 21.10.2014.
 */


function CatI18nService($q, $log, catI18nMessageSourceService, catI18nMessageParameterResolver) {
    var that = this;

    /**
     * @ngdoc method
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
     * @returns {Promise} Returns a promise of the translated key
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
                                deferred.resolve(catI18nMessageParameterResolver(message, model));
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
     * @ngdoc method
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
     * @returns {Promise} Returns a promise which resolves to true when a message for the given key exists for the
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

angular.module('cat.service.i18n')
/**
 * @ngdoc value
 * @name catI18nMessageParameterResolver
 * @value
 *
 * @description
 * A function which accepts a message and parameters and returns the resolved message
 */
    .value('catI18nMessageParameterResolver', function (message, parameters) {
        return _.template(message, parameters || {}, {interpolate: /{{([\s\S\d]+?)}}/g});
    })


/**
 * @ngdoc service
 * @name catI18nService
 * @service
 *
 * @description
 * A service to translate message keys to messages of specivic locales
 *
 *
 * @param $q
 * @param catI18nMessageSourceService
 * @param catI18nMessageParameterResolver
 * @constructor
 */
    .service('catI18nService', ['$q', '$log', 'catI18nMessageSourceService', 'catI18nMessageParameterResolver', CatI18nService]);



angular.module('cat.service.listDataLoading')
    .factory('catListDataLoadingService', ['catApiService', '$route', '$q', function CatListDataLoadingService(catApiService, $route, $q) {
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
            var searchRequest = new window.cat.SearchRequest($route.current.params);
            if (!defaultSort) {
                defaultSort = {property: 'name', isDesc: false};
            }
            if (!!defaultSort && !$route.current.params.sort) {
                searchRequest.sort(defaultSort);
            }
            return load(catApiService[endpointName], searchRequest);
        };

        return {
            'load': load,
            'resolve': resolve
        };
    }]);

/**
 * Created by tscheinecker on 05.08.2014.
 */



/**
 * @ngdoc service
 * @description
 * This service provider delegates to the $routeProvider and actually creates 2 separate routes after applying various
 * conventions / defaults
 *
 * @param $routeProvider
 * @constructor
 */
function CatRouteServiceProvider($routeProvider) {
    var viewNames = [];

    /**
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $routeProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    this.listAndDetailRoute = function (baseUrl, name, config) {
        viewNames.push(name);


        var listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());

        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url || listUrl;
        }

        var listConfig = !!config ? config.list : {};
        var detailsConfig = !!config ? config.details : {};
        var nameConf = {
            name: name
        };

        $routeProvider
            .when(listUrl, window.cat.util.route.list(_.assign({}, nameConf, listConfig)))
            .when(listUrl + '/:id', window.cat.util.route.detail(_.assign({}, nameConf, detailsConfig)));
    };

    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $routeProvider
     * @return {Array} the registered view names
     */
    this.$get = function () {
        return viewNames;
    };
}
CatRouteServiceProvider.$inject = ["$routeProvider"];


angular.module('cat.service.route').provider('catRouteService', CatRouteServiceProvider);
/**
 * Created by tscheinecker on 05.08.2014.
 */



function assignDeep(target, source) {
    return _.assign(target, source, function (targetProperty, sourceProperty) {
        if (_.isObject(targetProperty) && _.isObject(sourceProperty)) {
            return assignDeep(targetProperty, sourceProperty);
        }

        return sourceProperty;
    });
}

function CatSelectConfigService(configs) {
    var _configs = configs;

    this.getConfig = function (name, options) {
        var config = configs[name];

        if (_.isUndefined(config) && _.isUndefined(options)) {
            return undefined;
        }

        return assignDeep(_.clone(config) || {}, options);
    };
}

function CatSelectConfigServiceProvider() {
    var configs = {};

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


angular.module('cat.service.selectConfig').provider('catSelectConfigService', CatSelectConfigServiceProvider);
/**
 * Created by tscheinecker on 05.08.2014.
 */



/**
 * @ngdoc service
 * @description
 * This service provider can be used to initialize an api endpoint and the according detail and list routes by simply
 * providing a name and a config object.
 *
 * @param {CatRouteServiceProvider} catRouteServiceProvider
 * @param {CatApiServiceProvider} catApiServiceProvider
 * @constructor
 */
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
CatViewServiceProvider.$inject = ["catRouteServiceProvider", "catApiServiceProvider"];


angular.module('cat.service.view').provider('catViewService', CatViewServiceProvider);
/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.service.httpIntercept')
    .factory('errorHttpInterceptor', ["$q", "$globalMessages", "loadingService", function CatErrorHttpInterceptor($q, $globalMessages, loadingService) {
        return {
            'request': function (config) {
                loadingService.start();
                return config;
            },
            'requestError': function (rejection) {
                loadingService.stop();
                return $q.reject(rejection);
            },
            'response': function (success) {
                loadingService.stop();
                return success;
            },
            'responseError': function (rejection) {
                loadingService.stop();
                $globalMessages.clearMessages('error');

                if (!!rejection.data.error) {
                    var error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
                    if (!!rejection.data.cause) {
                        error += '\n' + rejection.data.cause;
                    }
                    $globalMessages.addMessage('error', error);
                }
                if (!!rejection.data.globalErrors) {
                    $globalMessages.addMessages('error', rejection.data.globalErrors);
                }

                return $q.reject(rejection);
            }
        };
    }])
    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    }]);

/**
 * Created by tscheinecker on 01.06.2014.
 */


angular.module('cat.service.loading')
    .factory('loadingService', ["$rootScope", "usSpinnerService", "$timeout", function CatLoadingService($rootScope, usSpinnerService, $timeout) {
        var timeout = 50;
        var animationDuration = 200;
        var activeCount = 0;
        var startTime;
        var startTimer, stopTimer;

        var start = function () {
            if (!activeCount && !startTimer) {
                if (!!stopTimer) {
                    $timeout.cancel(stopTimer);
                    stopTimer = undefined;
                }
                startTimer = $timeout(function () {
                    usSpinnerService.spin('loading-spinner');
                    $rootScope.loading = true;
                    startTime = new Date().getTime();
                }, timeout);
            }
            activeCount++;
        };

        var stop = function () {
            activeCount--;
            if (!activeCount && !stopTimer) {
                if (!!startTimer) {
                    $timeout.cancel(startTimer);
                    startTimer = undefined;
                }
                var now = new Date().getTime();
                var stopTimeout = timeout + (Math.max((animationDuration - (now - startTime)), 0));
                stopTimer = $timeout(function () {
                    usSpinnerService.stop('loading-spinner');
                    $rootScope.loading = false;
                }, stopTimeout);
            }
        };

        $rootScope.$on('$routeChangeStart', function (event) {
            start();

        });
        $rootScope.$on('$routeChangeSuccess', function (event) {
            stop();
        });
        $rootScope.$on('$routeChangeError', function (event) {
            stop();
        });

        return {
            start: start,
            stop: stop
        };
    }]);



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
            return[group, group.getEntries()];
        })]);
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

angular.module('cat.service.menu').provider('$mainMenu', MainMenuProvider);

/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.service.message').service('$globalMessages', ["$rootScope", function CatGlobalMessages($rootScope) {
    var messages = {};

    var self = this;

    this.getMessages = function (type) {
        if (!type) {
            return [];
        }

        return messages[type];
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

    this.addMessage = function (type, message) {
        if (!type) {
            return;
        }

        if (!messages[type]) {
            self.clearMessages(type);
        }

        messages[type].push(message);
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

    $rootScope.$on('$routeChangeSuccess', function () {
        self.clearMessages();
    });
}]);

//# sourceMappingURL=cat-angular.js.map