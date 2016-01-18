interface CatConversionFunctions {
    toClient(serverData?: any, context?: any): any;
    toServer(clientData?: any, context?: any): any;
}
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
declare class CatConversionService {
    private catConversionFunctions;
    constructor(catConversionFunctions: CatConversionFunctions);
    toClient(serverData: any, context: any): any;
    toServer(clientData: any): any;
}
declare function _convertToClientModel(data: any, context: any): any;
declare function _convertToClientData(serverData: any, context: any): any;
