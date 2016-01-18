interface CatReplaceTextFilter {
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
    (text?: string, pattern?: string, options?: string, replacement?: string): string | void;
}
declare function catReplaceTextFilterFactory(): CatReplaceTextFilter;
