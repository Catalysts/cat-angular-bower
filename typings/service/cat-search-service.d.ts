/**
 * Created by Thomas on 08/03/2015.
 */
interface ICatUrlEncodingService {
    encodeAsUrl(params?: any): string;
}
declare class CatUrlEncodingService implements ICatUrlEncodingService {
    encodeAsUrl(params: any): string;
}
interface ICatSearchService {
    encodeAsUrl(searchRequest?: SearchRequest): string;
    updateLocation(searchRequest?: SearchRequest): void;
    fromLocation(): SearchRequest;
}
declare class CatSearchService implements ICatSearchService {
    private $location;
    private catUrlEncodingService;
    constructor($location: any, catUrlEncodingService: any);
    private static _encodeSort(_sort);
    private static _encodePagination(_pagination);
    private _encodeSearch(_search);
    private urlEndoded(searchRequest);
    private static _concatenate(result, next);
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
    encodeAsUrl(searchRequest: any): any;
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
    updateLocation(searchRequest: any): void;
    /**
     * @ngdoc function
     * @name fromLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @description
     * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
     */
    fromLocation(): any;
}
