declare class Message {
    text: string;
    type: string;
    timeToLive: number;
    constructor(data?: any);
}
interface ICatMessagesService {
    getMessages(type?: string): Array<string>;
    hasMessages(type?: string): boolean;
    clearMessages(type?: string): void;
    clearDeadMessages(): void;
    addMessage(type: string, message: string, flash?: boolean): void;
    addMessages(type: string, messages: Array<string>): void;
    setMessages(type: string, messages: Array<string>): void;
    decreaseTimeToLive(): void;
}
/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
declare class CatMessageService implements ICatMessagesService {
    private messages;
    constructor($rootScope: any);
    getMessages(type?: string): Array<string>;
    hasMessages(type?: string): boolean;
    clearMessages(type?: string): void;
    clearDeadMessages(): void;
    addMessage(type: string, message: string, flash?: boolean): void;
    decreaseTimeToLive(): void;
    addMessages(type: string, messages: Array<string>): void;
    setMessages(type: string, messages: Array<string>): void;
}
/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
declare class CatValidationMessageHandler {
    private $globalMessages;
    private catValidationService;
    constructor($globalMessages: ICatMessagesService, catValidationService: ICatValidationService);
    handleRejectedResponse(rejection: any): void;
}
