const dogsBackend = {
	url: "https://6fr0s1p5oc.execute-api.us-east-2.amazonaws.com/dogs",
	jwt: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpGTE1kaUR3VW9rMEpKSU0zWnJWOSJ9.eyJpc3MiOiJodHRwczovL2dhYmVpby51cy5hdXRoMC5jb20vIiwic3ViIjoidDhMdXBZMUFwZW1jYk5QWGxUN1dub1BxSENqOXA3RnhAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXBpLmRvZ3MuZ2FiZS5pbyIsImlhdCI6MTYyNDE1MzA0NSwiZXhwIjoxNjI0MjM5NDQ1LCJhenAiOiJ0OEx1cFkxQXBlbWNiTlBYbFQ3V25vUHFIQ2o5cDdGeCIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.l8Fg9dAC4PVK0QuAN-m5hJjOVoMdqBluiGVZR_v4K93jg8ETfKb__PqcQFtrT1_7PxCuExvpvYDnvPS7yFl1ceaTj5fbOnO3p_PII_dV_mJ3ZjirJbtHw1-__i8JfyBOeAEBcHYzw5dQbSItTJhZHIEkOZFWUs6_O-KxoL1i0OOcykk1eBj4g3TIXrPh0e4AWOn5-GlDC8UxFaDYqI1Rz7jsY9UcHT2BVCzq-2O9N4A9-TB3ToZxbcw2_r_nYmJ_likLAdjJko-IfR3akcpik1R6bNKDXagb-aMmj1IPh5EZbKj4vvfcer8aNtLkaadSAzXEpSBq_mugOrIvbBtyGw",
	get: function (callback) {
		fetch(this.url, {
			credentials: 'include',
			headers: {
				'authorization': this.jwt,
			},
		})
		.then(response => response.json())
		.then(data => {
			console.log('Success:', data);
			if (vm && vm.dogs) {
				vm.update(data)
			} else {
				vm.initial(data)
			}
		})
		.then(function () {
			callback(null)
		})
	},
	set: function (dog, callback) {
		console.log(dog)
		fetch(this.url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'authorization': this.jwt,
			},
			body: JSON.stringify(dog),
		})
		.then(function () {
			callback(null)
		})
	}
}

const app = Vue.createApp({
	data() {
		return {
			dogs: dogsBackend.get(),
		}
	},
	methods: {
		initial: function (dogs) {
			this.dogs = dogs
		},
		outside: function (dog) {
			console.log("outside", dog)
			dog.value = true
			async.series([
				function (callback) {
					dogsBackend.set(dog, callback)
				},
				function (callback) {
					dogsBackend.get()
				},
			])
		},
		inside: function (dog) {
			console.log("inside", dog)
			dog.value = false
			async.series([
				function (callback) {
					dogsBackend.set(dog, callback)
				},
				function (callback) {
					dogsBackend.get()
				},
			])
		},
		update: function (dogs) {
			for (dog of dogs) {
				for (doggie of this.dogs) {
					if (dog.name === doggie.name && dog.value != doggie.value) {
						doggie.value = dog.value;
					}
				}
			}
		},
	}
})

const vm = app.mount('.dogs')

//console.log("interval: ", setInterval(function() {
//	dogsBackend.get()
//}, 5000))
