//MessageFormat.locale.zh=function(n){return n===1?"one":"other"}
MessageFormat.locale.zh = function(n) {
    if (n === 0) {
        return 'zero';
    }
    if (n === 1) {
        return 'one';
    }
    return 'other';
};
