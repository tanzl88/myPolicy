//MessageFormat.locale.en=function(n){return n===1?"one":"other"}
MessageFormat.locale.en = function(n) {
    if (n === 0) {
        return 'zero';
    }
    if (n === 1) {
        return 'one';
    }
    return 'other';
};
