var comp = {
	template: '#tplComp',
	data: function(){
		return {
			msg: 'hello'
		}
	}
};

var list1 = [
		{
			id: 1
		}
	],
	list2 = [
		{
			id: 4
		}
	];

Vue.component('comp', comp);

new Vue({
	el: '#body',
	data: {
		msg: 'hello',
		list: list1
	},
	methods: {
		changeList: function () {
			this.list = this.list == list1 ? list2 : list1
		}
	}
});
