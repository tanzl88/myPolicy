app.service('fieldNameService', function() {
    var fieldName = {};
    return {
        setFieldName : function(type,data) {
            if (type === "full_table") {
                fieldName[type] = {};
                angular.forEach(full_table_g,function(field,index){
                    if (data[field.name] !== undefined) fieldName[type][field.title] = data[field.name];
                });
            }
        },
        getFieldName : function(type) {
            if (fieldName[type] === undefined) {
                return {};
            } else {
                return fieldName[type];
            }
        }
    }
});