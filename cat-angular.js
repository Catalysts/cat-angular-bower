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
angular.module('cat.api', []);
angular.module('cat.service', ['angularSpinner', 'ngRoute', 'cat.api']);
angular.module('cat', [
    'cat.api',
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.controller'
]);

})(window, document);

(function(window, document, undefined) {
'use strict';


function ApiEndpoint(url, endpointName, settings, $http) {
    var _endpointUrl = url + (settings.url || endpointName);
    var ModelClass = settings.model;
    var _childEndpointSettings = settings.children;

    var _res = _.memoize(function (id) {
        var url = _endpointUrl + '/' + id + '/';
        var ret = {};
        _.forEach(_.keys(_childEndpointSettings), function (path) {
            var settings = _childEndpointSettings[path];
            ret[path] = new ApiEndpoint(url, path, settings, $http);
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

    this.get = function (id, pathParams) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return mapResponse(response.data);
        });
    };

    this.info = function (id) {
        return $http.get(_endpointUrl + '/' + id + '?info').then(function (response) {
            return response.data;
        });
    };

    this.save = function (object, pathParams) {
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

    this.remove = function (id, pathParams) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + id});
    };
}

function ApiProvider() {
    var _urlPrefix = '/api/';
    var _endpoints = {};

    this.endpoint = function (path, settings) {
        _endpoints[path] = settings;
    };

    this.$get = ['$http', function ($http) {
        var $api = {};

        _.forEach(_.keys(_endpoints), function (path) {
            var settings = _endpoints[path];
            $api[path] = new ApiEndpoint(_urlPrefix, path, settings, $http);
        });

        return $api;
    }];
}

angular.module('cat.api').provider('$api', ApiProvider);

})(window, document);

(function(window, document, undefined) {
'use strict';


window.cat = window.cat || {};

window.cat.FacetTerm = function (data) {
    if (data === undefined) data = {};

    this.id = data.id;
    this.name = data.name;
    this.count = data.count;
};

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
            return _.reduce(_.map(_.keys(_search), function (key) {
                var value = _search[key];
                if (_.isUndefined(value) || _.isNull(value)) {
                    return undefined;
                }
                if (_.isString(value)) {
                    value = value.trim();
                    if (value.length === 0) {
                        return undefined;
                    }
                }
                return key + '=' + value;
            }), _concatenate);
        }

        return '';
    };

    var urlEndoded = function () {
        return _([_encodePagination(), _encodeSort(), _encodeSearch()]).reduce(_concatenate);
    };

    this.pagination = function (pagination) {
        if (pagination === undefined) {
            return _pagination;
        } else {
            _pagination = pagination;
            return _pagination;
        }
    };

    this.sort = function (sort) {
        if (sort === undefined) {
            return _sort;
        } else {
            _sort = sort;
            return _sort;
        }
    };

    this.search = function (search) {
        if (search === undefined) {
            return _search;
        } else {
            _search = search;
            return _search;
        }
    };

    this.urlEncoded = function () {
        lastEncoded = urlEndoded();
        return lastEncoded;
    };

    this.isDirty = function () {
        return lastEncoded !== urlEndoded();
    };

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

angular.module('cat')
    .directive('catAutofocus', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
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
    .directive('catCheckbox', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                checked: '='
            },
            link: function (scope, element, attrs) {
                if (!!scope.checked) {
                    element.addClass('glyphicon glyphicon-check');
                }
                else {
                    element.addClass('glyphicon glyphicon-unchecked');
                }
            }
        };
    });
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catConfirmClick', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
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
    .directive('catFacets', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                facets: '=',
                names: '='
            },
            templateUrl: 'template/cat-facets.tpl.html',
            link: function (scope, element, attrs) {
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
    .directive('catFieldErrors', function () {
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
    .directive('input', function () {
        return {
            require: 'ngModel',
            restrict: 'E',
            link: function (scope, element, attrs, ctrl) {
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
    .directive('catInputGroup', function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                errors: '=',
                label: '@',
                name: '@'
            },
            link: function (scope, element, attrs) {
                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    });
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catLoadMore', function () {
        return {
            replace: true,
            restrict: 'A',
            link: function (scope, element, attrs) {
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
    .directive('catMainMenu', ['$mainMenu', '$rootScope', function ($mainMenu, $rootScope) {
        return {
            restrict: 'E',
            scope: {
            },
            link: function (scope, element, attrs) {
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
    .directive('catPaginated', function () {
        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            scope: {
                listData: '=?'
            },
            templateUrl: 'template/cat-paginated.tpl.html',
            link: function (scope, element, attrs) {
                if (!!attrs.searchProps) {
                    scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                        return !!prop;
                    });
                }
            },
            controller: function ($scope, $location, catListDataLoadingService, $timeout, $rootScope) {
                var searchTimeout = null, DELAY_ON_SEARCH = 500;

                if (_.isUndefined($scope.listData)) {
                    $scope.listData = $scope.$parent.listData;
                    if (_.isUndefined($scope.listData)) {
                        throw new Error('listData was not defined and couldn\'t be found with default value');
                    }
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

                $scope.$watch('listData.sort', function (newVal, oldVal) {
                    if (!!newVal) {
                        console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                        $scope.$parent.$broadcast('SortChanged', newVal);
                    }
                }, true);

                $scope.$on('SearchChanged', function (event, value, delay) {
                    searchChanged(value, delay);
                });

                $scope.$watch('listData.pagination', function () {
                    searchRequest.setSearch($location);
                    reload();
                }, true);

                var searchChanged = function (value, delay) {
                    searchRequest.search(value);
                    searchRequest.setSearch($location);
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
                    searchRequest.setSearch($location);
                    $scope.listData.pagination.page = 1;
                    reload();
                });
            }
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';


angular.module('cat')
    .directive('catSelect', function ($log, $api) {
        var fetchElements = function (endpoint, sort) {
            return function (queryParams) {
                var searchRequest = new window.cat.SearchRequest(queryParams.data);
                searchRequest.sort(sort || { property: 'name', isDesc: false });
                return endpoint.list(searchRequest).then(queryParams.success);
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            priority: 1,
            scope: {
                options: '=',
                id: '@'
            },
            link: function (scope, element) {
                element.addClass('form-control');
            },
            controller: function ($scope) {
                var transport,
                    quietMillis,
                    searchRequestFunc = $scope.options.search || function (term, page) {
                        return { 'search.name': term };
                    },
                    filterFunc = $scope.options.filter || function (term) {
                        return true;
                    };
                if (Object.prototype.toString.call($scope.options.endpoint) === '[object Array]') {
                    transport = function (queryParams) {
                        return queryParams.success({
                            elements: $scope.options.endpoint
                        });
                    };
                    quietMillis = 0;
                } else {
                    var api = $api[$scope.options.endpoint];
                    if (!api) {
                        $log.error('No api endpoint "' + $scope.options.endpoint + '" defined');
                        $scope.elements = [];
                        return;
                    }
                    transport = fetchElements(api, $scope.options.sort);
                    quietMillis = 500;
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
                            return {results: _.filter(data.elements, filterFunc)};
                        }
                    },
                    formatResult: function (element) {
                        return element.name;
                    },
                    formatSelection: function (element) {
                        return element.name;
                    }
                }, $scope.options['ui-select2']);
            },
            template: '<input type="text" ui-select2="selectOptions">'
        };
    });

})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat')
    .directive('catSortable', function ($compile, $log) {
        return {
            restrict: 'AC',
            link: function (scope, element, attrs) {
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
            controller: function ($scope) {
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
    .directive('form', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: true,
            require: 'form',
            link: function (scope, element, attrs, formCtrl) {
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
    .directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
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


function CatBaseDetailController($scope, $routeParams, $breadcrumbs, $location, $window, $globalMessages, $controller, config, detail, parent) {
    $scope.detail = detail;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    var endpoint = config.endpoint;
    var baseUrl = config.baseUrl;
    var templateUrls = config.templateUrls;
    var Model = config.Model;

    $scope.uiStack = config.uiStack;

    $scope.editTemplate = templateUrls.edit;

    if (_.isObject(templateUrls.view)) {
        $scope.mainViewTemplate = templateUrls.view.main;
        $scope.additionalViewTemplate = templateUrls.view.additional;
    } else {
        $scope.mainViewTemplate = templateUrls.view;
    }

    $scope.baseUrl = baseUrl;

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

    var reload = function () {
        endpoint.get($routeParams.id).then(function (data) {
            $scope.detail = data;
            update();
        });
    };

    $scope.reloadDetails = reload;

    $scope.exists = !!$routeParams.id && $routeParams.id !== 'new';

    $scope.add = function () {
        $scope.editDetail = new Model();
    };

    $scope.edit = function () {
        $scope.editDetail = angular.copy($scope.detail);
    };

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

    $scope.remove = function () {
        endpoint.remove($scope.detail.id).then(function () {
            $location.path(baseUrl);
        });
    };

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
    $controller(config.controller, {$scope: $scope, detail: detail, parent: parent, config: config});
}

angular.module('cat').controller('CatBaseDetailController', CatBaseDetailController);
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat').
    filter('replaceText', function () {
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
    var endpointName, parentEndpointName;

    if (_.isString(config.endpoint)) {
        endpointName = config.endpoint;
    } else if (_.isObject(config.endpoint)) {
        parentEndpointName = config.endpoint.parent;
        endpointName = config.endpoint.name;
    } else {
        endpointName = toLowerCaseName(config.name);
    }

    var Model = config.model || window.cat.util.defaultModelResolver(config.name);

    var parentUrl = (parentEndpointName ? parentEndpointName + '/' : '');
    var parentTemplateNamePrefix = (parentEndpointName ? parentEndpointName + '-' : '');

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

    return {
        templateUrl: config.templateUrl || 'template/base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: function ($api, $route) {
                var currentRoute = $route.current.originalPath;
                var endpoint = $api[endpointName];

                if (!_.isUndefined(parentEndpointName)) {
                    endpoint = $api[parentEndpointName].res($route.current.params[config.endpoint.id])[endpointName];
                }

                var baseUrl = config.baseUrl;

                if (_.isUndefined(baseUrl)) {
                    var baseUrlTemplate = currentRoute.substring(0, currentRoute.lastIndexOf('/'));
                    if (!_.isUndefined(parentEndpointName)) {
                        baseUrl = baseUrlTemplate.replace(':' + config.endpoint.id, $route.current.params[config.endpoint.id]);
                    } else {
                        baseUrl = baseUrlTemplate;
                    }
                }

                return {
                    controller: config.controller || config.name + 'DetailsController',
                    endpoint: endpoint,
                    Model: Model,
                    templateUrls: templateUrls,
                    baseUrl: baseUrl
                };
            },
            parent: ['$api', '$route', function ($api, $route) {
                if (_.isUndefined(parentEndpointName)) {
                    return null;
                }

                return $api[parentEndpointName].info($route.current.params[config.endpoint.id]);
            }],
            detail: ['$api', '$route', function ($api, $route) {
                var detailId = $route.current.params.id;
                if (detailId === 'new') {
                    return new Model();
                }
                if (_.isUndefined(parentEndpointName)) {
                    return $api[endpointName].get(detailId);
                } else {
                    return $api[parentEndpointName].res($route.current.params[config.endpoint.id])[endpointName].get(detailId);
                }
            }]
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};
})(window, document);

(function(window, document, undefined) {
'use strict';

angular.module('cat.service').service('$breadcrumbs', function () {
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


angular.module('cat.service')
    .factory('catListDataLoadingService', ['$api', '$route', '$q', function ($api, $route, $q) {
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
            return load($api[endpointName], searchRequest);
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



function CatViewServiceProvider(catRouteServiceProvider, $apiProvider) {
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

        $apiProvider.endpoint(name.toLowerCase(), endpoint);
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
    .factory('errorHttpInterceptor', function ($q, $globalMessages, loadingService) {
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
    .factory('loadingService', function ($rootScope, usSpinnerService, $timeout) {
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


angular.module('cat.service').service('$globalMessages', function ($rootScope) {
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
