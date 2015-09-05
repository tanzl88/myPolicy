app.service('findParentService', function() {

    return {
        findByFunctionName : function(scope,functionName) {
            var parentScope = scope.$parent;
            var funcVar = parentScope[functionName];
            //UP TO TEN LEVELS
            for (var i = 0 ; i < 10 ; i++) {
                var nextParentScope = parentScope.$parent;
                var nextFuncVar = nextParentScope[functionName];
                if (funcVar === nextFuncVar) {
                    parentScope = nextParentScope;
                    funcVar = nextFuncVar;
                } else {
                    break;
                }
            }

            return parentScope;
        }
    }
});