interface Sort {
    property?: string;
    isDesc?: boolean | string;
}
interface Pagination {
    page: number;
    size: number;
}
interface SearchUrlParams {
    page?: number;
    size?: number;
    sort?: string;
    rev?: boolean;
}
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
declare class SearchRequest {
    private _pagination;
    private _sort;
    private _search;
    private _dirty;
    private lastEncoded;
    constructor(searchUrlParams?: SearchUrlParams);
    private _encodeSort();
    private _encodePagination();
    private static _concatenate(result, next);
    private _encodeSearch();
    private _urlEndoded();
    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    pagination(pagination: Pagination): Pagination;
    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    sort(sort?: Sort): Sort;
    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    search(search?: any): {};
    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    urlEncoded(): any;
    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    isDirty(): boolean;
    setPristine(): void;
    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    setSearch($location: any): void;
}
