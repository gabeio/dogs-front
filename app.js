const dogsBackend = {
	fetch: function () {
		//
		console.log("dogsBackend: fetch")
		return "dogsBackend: fetch: value"
	}
}

const app = new Vue({
	data: {
		dogs: dogsBackend.fetch(),
	},
	methods: {
		outside: function (name) {
			//
			console.log("outside")
		},
		inside: function (name) {
			//
			console.log("inside")
		}
	}
})

const vm = app.mount('.dogs')
