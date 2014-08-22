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
window.cat = {};

angular.module('cat.directives', ['ui.select2']);
angular.module('cat.controller', []);
angular.module('cat.template', []);
angular.module('cat.service.api', []);
angular.module('cat.service', ['angularSpinner', 'ngRoute', 'cat.service.api']);
angular.module('cat', [
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.controller'
]);

})(window, document);

(function(window, document, undefined) {
'use strict';


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
})(window, document);

(function(window, document, undefined) {
'use strict';


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
})(window, document);

(function(window, document, undefined) {
'use strict';


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
 * @param $breadcrumbs
 * @param $location
 * @param $window
 * @param $globalMessages
 * @param $controller
 * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
 * @param {Object} detail the actual object which is shown / edited
 * @param {Array} parents the list of 'parent' objects used for breadcrumb / ui stack generation
 * @constructor
 */
function CatBaseDetailController($scope, $routeParams, $breadcrumbs, $location, $window, $globalMessages, $controller, config, detail, parents) {
    $scope.detail = detail;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    var endpoint = config.endpoint;
    var baseUrl = config.baseUrl;
    var templateUrls = config.templateUrls;
    var Model = config.Model;

    var breadcrumbs = [];

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.substring(1);
    }

    $scope.uiStack = [];

    function splitShiftAndJoin(path, amount) {
        return _.initial(path.split('/'), amount).join('/');
    }

    if (!_.isUndefined(config.endpoint.parentEndpoint)) {
        var currentEndpoint = config.endpoint;
        var parentEndpoint = currentEndpoint.parentEndpoint;
        var parentUrl = baseUrl;
        var count = 0;

        while (!_.isUndefined(parentEndpoint)) {
            var parent = parents[count++];
            parentUrl = splitShiftAndJoin(parentUrl, 1);

            var detailBreadcrumb = {
                url: '#' + parentUrl + '?tab=' + currentEndpoint.getEndpointName() + 's',
                title: parent.name
            };
            $scope.uiStack.unshift(detailBreadcrumb);
            breadcrumbs.unshift(detailBreadcrumb);

            parentUrl = splitShiftAndJoin(parentUrl, 1);
            var breadcrumb = {
                title: capitalize(parentEndpoint.getEndpointName()) + 's',
                url: '#' + parentUrl
            };
            breadcrumbs.unshift(breadcrumb);

            currentEndpoint = parentEndpoint;
            parentEndpoint = currentEndpoint.parentEndpoint;
        }
    } else {
        breadcrumbs.push({
            title: capitalize(config.endpoint.getEndpointName()) + 's',
            url: '#' + baseUrl
        });
    }

    breadcrumbs.push(
        {
            title: $routeParams.id === 'new' ? 'New' : ''
        }
    );

    $breadcrumbs.set(breadcrumbs);

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
        $breadcrumbs.replaceLast({
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
            $scope.editDetail.setParent(parents[0]);
        }
    };

    /**
     * Creates a copy of the current object and triggers a switch into edit mode
     */
    $scope.edit = function () {
        $scope.editDetail = angular.copy($scope.detail);
        if (_.isFunction($scope.editDetail.setParent)) {
            $scope.editDetail.setParent(parents[0]);
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
            $location.path(baseUrl);
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

    // extend with custom controller
    $controller(config.controller, {$scope: $scope, detail: detail, parents: parents, config: config});
}

angular.module('cat').controller('CatBaseDetailController', CatBaseDetailController);
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catAutofocus', function CatAutofocusDirective($timeout) {
        return {
            restrict: 'A',
            link: function CatAutofocusLink(scope, element) {
                $timeout(function () {
                    element[0].focus();
                }, 100);
            }
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catFacets', function CatFacetsDirective() {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                facets: '=',
                names: '='
            },
            templateUrl: 'template/cat-facets.tpl.html',
            link: function CatFacetsLink(scope) {
                if (scope.facets === undefined) throw 'Attribute facets must be set!';
            },
            controller: function ($scope, $location, $rootScope) {

                $scope.isActive = function (facet, term) {
                    var search = $location.search();
                    var name = 'search.' + facet.name;
                    if (!!search[name]) {
                        return !!term && search[name] === term.id;
                    } else {
                        return true;
                    }
                };

                $scope.showAll = function (facet) {
                    var search = new window.cat.SearchRequest($location.search()).search();
                    delete search[facet.name];
                    $rootScope.$broadcast('SearchChanged', search);
                };

                $scope.facetName = function (facet) {
                    if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                        return $scope.names[facet.name];
                    } else {
                        return facet.name;
                    }
                };

                $scope.setActive = function (facet, term) {
                    facet.activeTerm = term;
                    var search = new window.cat.SearchRequest($location.search()).search();
                    search[facet.name] = term.id;
                    $rootScope.$broadcast('SearchChanged', search);

                };

                $scope.remove = function (facet) {
                    var search = new window.cat.SearchRequest($location.search()).search();
                    delete search[facet.name];
                    $rootScope.$broadcast('SearchChanged', search);
                };

                $scope.showItem = function (facet, term) {
                    return $scope.isActive(facet) || $scope.isActive(facet, term);
                };
            }
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat')
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
})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat')
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
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catPaginated', function CatPaginatedDirective() {
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
                }
            },
            controller: function CatPaginatedController($scope, $location, catListDataLoadingService, $timeout, $rootScope) {
                var searchTimeout = null, DELAY_ON_SEARCH = 500;

                if (_.isUndefined($scope.listData)) {
                    $scope.listData = $scope.$parent.listData;
                    if (_.isUndefined($scope.listData)) {
                        throw new Error('listData was not defined and couldn\'t be found with default value');
                    }
                }

                if (_.isUndefined($scope.syncLocation)) {
                    $scope.syncLocation = _.isUndefined($scope.$parent.detail);
                }

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

                $scope.$on('SortChanged', function (event, value) {
                    searchRequest.sort(value);
                    updateLocation();
                    $scope.listData.pagination.page = 1;
                    reload();
                });
            }
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';


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
        $log.error('The given endpoint has to be one of the following types: array, object, string - but was ' + (typeof options.endpoint));
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
 * - endpoint: This can either be an array, in which case it will directly be treated as the source, an endpoint name, or an endpoint object
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

angular.module('cat.directives')
    .directive('catSelect', CatSelectDirective);

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catSortable', function CatSortableDirective($compile) {
        return {
            restrict: 'AC',
            link: function CatSortableLink(scope, element, attrs) {
                var title = element.text();
                var property = attrs.catSortable || title.toLowerCase().trim();

                // todo - make configurable
                scope.sort = scope.listData.searchRequest.sort();

                var icon = 'glyphicon-sort-by-attributes';

                if (!!attrs.sortMode) {
                    if (attrs.sortMode === 'numeric') {
                        icon = 'glyphicon-sort-by-order';
                    } else if (attrs.sortMode === 'alphabet') {
                        icon = 'glyphicon-sort-by-alphabet';
                    }
                }

                element.text('');
                element.append($compile('<a class="sort-link" href="" ng-click="toggleSort(\'' + property + '\')">' + title + ' <span class="glyphicon" ng-class="{\'' + icon + '\': sort.property == \'' + property + '\' && !sort.isDesc, \'' + icon + '-alt\': sort.property == \'' + property + '\' && sort.isDesc}"></span></a>')(scope));
            },
            controller: function CatSortableController($scope) {
                $scope.toggleSort = function (property) {
                    if ($scope.sort.property === property) {
                        $scope.sort.isDesc = !$scope.sort.isDesc;
                    } else {
                        $scope.sort.property = property;
                        $scope.sort.isDesc = false;
                    }
                    $scope.$parent.$broadcast('SortChanged', $scope.sort); // broadcast from the parent scope (= controller or transclude scope)
                };

                $scope.$on('SortChanged', function (event, value) {
                    $scope.sort = value;
                });
            }
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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

})(window, document);

(function(window, document, undefined) {
'use strict';


angular.module('cat')
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
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
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

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat.service').service('$breadcrumbs', function CatBreadcrumbsService() {
    var _bc = [];

    this.clear = function (bc) {
        _bc = [];
    };

    this.set = function (bc) {
        _bc = bc;
    };

    this.get = function () {
        return _bc;
    };

    this.push = function (entry) {
        _bc.push(entry);
    };

    this.pop = function () {
        _bc.pop();
    };

    this.length = function () {
        return _bc.length;
    };

    this.replaceLast = function (newVal) {
        _bc[_bc.length - 1] = newVal;
    };
});
})(window, document);

(function(window, document, undefined) {
'use strict';


function CatApiEndpoint(url, endpointConfig, $http) {
    var that = this;

    var _endpointName = endpointConfig.name;
    var _endpointUrl = url + (endpointConfig.config.url || endpointConfig.name);
    var ModelClass = endpointConfig.config.model;
    var _childEndpointSettings = endpointConfig.children;

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

    this.res = function (id) {
        return _res(id);
    };

    var mapResponse = function (data) {
        var object = new ModelClass(data);
        return _.merge(object, _res(object.id));
    };

    var removeEndpoints = function (object) {
        var endpoints = _res(object.id);
        _.forEach(_.keys(endpoints), function (key) {
            delete object[key];
        });
        return object;
    };

    this.getEndpointUrl = function () {
        return _endpointUrl;
    };

    this.getEndpointName = function () {
        return _endpointName;
    };

    this.list = function (searchRequest) {
        var searchQuery = !!searchRequest && searchRequest instanceof window.cat.SearchRequest ? '?' + searchRequest.urlEncoded() : '';
        return $http.get(_endpointUrl + searchQuery).then(function (response) {
            if (!!response.data.totalCount || response.data.totalCount === 0) {
                var facets = [];

                if (!!response.data.facets) {
                    facets = _.map(response.data.facets, function (facet) {
                        return new window.cat.Facet(facet);
                    });
                }

                return {
                    totalCount: response.data.totalCount,
                    facets: facets,
                    elements: _.map(response.data.elements, function (elem) {
                        return mapResponse(elem);
                    })
                };
            } else {
                return _.map(response.data, function (elem) {
                    return mapResponse(elem);
                });
            }
        });
    };

    this.all = function () {
        return $http.get(_endpointUrl + '/all').then(function (response) {
            return _.map(response.data, function (elem) {
                return mapResponse(elem);
            });
        });
    };

    this.get = function (id) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return mapResponse(response.data);
        });
    };

    this.info = function (id) {
        return $http.get(_endpointUrl + '/' + id + '?info').then(function (response) {
            return response.data;
        });
    };

    this.save = function (object) {
        if (!!object.id) {
            return $http.put(_endpointUrl + '/' + object.id, removeEndpoints(object)).then(function (response) {
                return mapResponse(response.data);
            });
        } else {
            return $http.post(_endpointUrl, removeEndpoints(object)).then(function (response) {
                return mapResponse(response.data);
            });
        }
    };

    this.remove = function (id) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + id});
    };
}

function EndpointConfig(name, config) {
    var that = this;
    this.config = config || {};
    this.children = {};
    this.name = name;

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

// this is saved outside so that both $api and catApiService use the same config
var _endpoints = {};

function CatApiServiceProvider() {
    var _urlPrefix = '/api/';

    this.endpoint = function (path, settings) {
        if (!_.isUndefined(settings)) {
            _endpoints[path] = new EndpointConfig(path, settings);
        }
        return _endpoints[path];
    };

    this.$get = ['$http', function ($http) {
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

})(window, document);

(function(window, document, undefined) {
'use strict';


angular.module('cat.service')
    .factory('catListDataLoadingService', ['catApiService', '$route', '$q', function CatListDataLoadingService(catApiService, $route, $q) {
        var load = function (endpoint, searchRequest) {
            var deferred = $q.defer();
            endpoint.list(searchRequest).then(
                function success(data) {
                    var pagination = searchRequest.pagination();

                    deferred.resolve({
                        count: data.totalCount,
                        collection: data.elements,
                        pagination: pagination,
                        firstResult: (pagination.page - 1) * pagination.size + 1,
                        lastResult: Math.min(pagination.page * pagination.size, data.totalCount),
                        facets: data.facets,
                        isSinglePageList: data.totalCount <= pagination.size,
                        endpoint: endpoint,
                        searchRequest: searchRequest
                    });
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

})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.08.2014.
 */



function CatRouteServiceProvider($routeProvider) {
    var viewNames = [];

    this.listAndDetailRoute = function (baseUrl, name, config) {
        viewNames.push(name);


        var listUrl = baseUrl + '/' + name.toLowerCase() + 's';

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


    this.$get = function () {
        return viewNames;
    };
}


angular.module('cat.service').provider('catRouteService', CatRouteServiceProvider);
})(window, document);

(function(window, document, undefined) {
'use strict';
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
        configs[name] = config;
    };

    this.$get = function () {
        return new CatSelectConfigService(configs);
    };
}


angular.module('cat.service').provider('catSelectConfigService', CatSelectConfigServiceProvider);
})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.08.2014.
 */



function CatViewServiceProvider(catRouteServiceProvider, catApiServiceProvider) {
    var viewNames = [];
    var endpointNames = [];

    this.listAndDetailView = function (baseUrl, name, config) {
        var endpointName = name.toLowerCase();
        var url = endpointName + 's';

        if (!!config) {
            url = config.url || url;
        }

        var listUrl = baseUrl + '/' + url;

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


    this.$get = function () {
        return {
            views: viewNames,
            endpoints: endpointNames
        };
    };
}


angular.module('cat.service').provider('catViewService', CatViewServiceProvider);
})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.service')
    .factory('errorHttpInterceptor', function CatErrorHttpInterceptor($q, $globalMessages, loadingService) {
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
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    });

})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 01.06.2014.
 */


angular.module('cat.service')
    .factory('loadingService', function CatLoadingService($rootScope, usSpinnerService, $timeout) {
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
    });

})(window, document);

(function(window, document, undefined) {
'use strict';


function MenuEntry(menuEntryId, options) {
    this.id = menuEntryId;
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

function MenuGroup(groupId, options) {
    this.id = groupId;
    var _menuEntries = [];
    var _options = options;

    this.addMenuEntry = function (menuEntryId, options) {
        _menuEntries.push(new MenuEntry(menuEntryId, options));
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
    this.id = menuId;
    var _menuEntries = [];
    var _menuGroups = {};
    var _options = options;

    this.addMenuGroup = function (groupId, options) {
        _menuGroups[groupId] = new MenuGroup(groupId, options);
    };

    this.addMenuEntry = function (groupId, menuEntryId, options) {
        if (_.isUndefined(groupId)) {
            _menuEntries.push(new MenuEntry(menuEntryId, options));
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

angular.module('cat.service').provider('$mainMenu', MainMenuProvider);

})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 05.05.2014.
 */


angular.module('cat.service').service('$globalMessages', function CatGlobalMessages($rootScope) {
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
});

})(window, document);

(function(window, document, undefined) {
'use strict';
/**
 * Created by tscheinecker on 01.08.2014.
 */



window.cat.util = window.cat.util || {};

window.cat.models = window.cat.models || {};

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
 * Helper function for list routes
 * @param config
 * @returns {{templateUrl: string, controller: string, reloadOnSearch: boolean, resolve: {listData: *[]}}}
 */
var listRoute = function (config) {
    var name = toLowerCaseName(config.name);
    return {
        templateUrl: config.templateUrl || (name + '/' + name + '-list.tpl.html'),
        controller: config.controller || config.name + 'Controller',
        reloadOnSearch: false,
        resolve: {
            listData: ['catListDataLoadingService', function (catListDataLoadingService) {
                return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
            }]
        }
    };
};

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

    var templateUrls = {
        edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
        view: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html'
    };

    if (config.additionalViewTemplate === true) {
        templateUrls.view = {
            main: templateUrls.view,
            additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
        };
    }

    var resolvedConfig;

    function getConfig(catApiService, $route) {
        if (!_.isUndefined(resolvedConfig)) {
            return resolvedConfig;
        }

        var currentRoute = $route.current.originalPath;
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

        var baseUrl = config.baseUrl;

        if (_.isUndefined(baseUrl)) {
            var baseUrlTemplate = currentRoute.substring(0, currentRoute.lastIndexOf('/'));
            if (_.isArray(parentEndpointNames)) {
                _.forEach(parentEndpointNames, function (parentEndpointName) {
                    var idName = parentEndpointName + 'Id';
                    baseUrl = baseUrlTemplate.replace(':' + idName, $route.current.params[idName]);
                });
            } else {
                baseUrl = baseUrlTemplate;
            }
        }

        resolvedConfig = {
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            baseUrl: baseUrl
        };

        return resolvedConfig;
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
        templateUrl: config.templateUrl || 'template/base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: function (catApiService, $route) {
                return getConfig(catApiService, $route);
            },
            parents: ['catApiService', '$route', '$q', function (catApiService, $route, $q) {
                if (_.isUndefined(parentEndpointNames)) {
                    return null;
                }

                return getParentInfo($q, getConfig(catApiService, $route).endpoint);
            }],
            detail: ['catApiService', '$route', function (catApiService, $route) {
                var detailId = $route.current.params.id;
                if (detailId === 'new') {
                    return new Model();
                }

                return getConfig(catApiService, $route).endpoint.get(detailId);
            }]
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};
})(window, document);
