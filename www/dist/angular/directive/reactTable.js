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
			//controller:function($scope) {
			//	$scope.$on("$destroy",function(){
			//		React.unmountComponentAtNode(document.getElementById('reactFullTable1'));
			//		React.unmountComponentAtNode(document.getElementById('reactFullTable2'));
			//	});
			//},
			link:function(scope, el, attrs){
				scope.$watchCollection('data', function(newValue, oldValue){
					React.renderComponent(
						MYLIST({data:newValue}),
						el[0]
					);
				});
				$(el[0]).on("$destroy",function(){
					React.unmountComponentAtNode(el[0]);
				});
			}
		}
	});