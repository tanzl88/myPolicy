var MYLIST = React.createClass({displayName: 'MYLIST',
	render: function() {

		var data = this.props.data;

		return (
			React.DOM.table(null,
				React.DOM.thead(null,
					React.DOM.tr(null,
						data.head.map(function(head) {
							return React.DOM.th({key: head.title, style: {"min-width" : head.width}}, head.title);
						})
					)
				),
				React.DOM.tbody(null,
					data.body.map(function(row, i) {
						return (
							React.DOM.tr({key: i},
								row.map(function(col, j) {
									return React.DOM.td({key: j}, col);
								})
							)
						);
					})
				)
			)
		);
	}
});

angular.module('reactTable', []).directive('reactTable', function(){
		return{
			restrict: 'E',
			scope:{
				data: '='
			},
			link:function(scope, el, attrs){
				scope.$watchCollection('data', function(newValue, oldValue){
					React.renderComponent(
						MYLIST({data:newValue}),
						el[0]
					);
				})
			}
		}
	});