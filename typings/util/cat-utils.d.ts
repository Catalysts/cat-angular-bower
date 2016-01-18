interface CatUtils {
    defaultListSearchProps?: string[];
    /**
     * Pluralizes a string
     * @param string
     * @returns {*}
     */
    pluralize(string: string): string;
    /**
     * Capitalizes a string (first letter to uppercase)
     * @param string
     * @returns {string}
     */
    capitalize(string: string): string;
    /**
     * Generates a new UUID
     *
     * @returns {string} uuid
     */
    generateUUID(): string;
    /**
     * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
     * @param name the name of the 'entity' for which the constructor has to be returned
     * @returns {Constructor}
     */
    defaultModelResolver(name: string): {
        new (data?: any): any;
    };
}
