var comp = {
	template: '#tplComp',
	data: function () {
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

var app = {
	template: '#tplApp',
	data: function () {
		return {
			msg: 'hello',
			list: list1
		};
	},
	components: {
		comp: comp
	},
	methods: {
		changeList: function () {
			this.list = this.list == list1 ? list2 : list1
		}
	}
}

new Vue({
	el: '#body',
	template: '<app></app>',
	components: {
		app: app
	}
});
