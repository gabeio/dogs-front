const dogsBackend = {
	url: "https://6fr0s1p5oc.execute-api.us-east-2.amazonaws.com",
	jwt: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpGTE1kaUR3VW9rMEpKSU0zWnJWOSJ9.eyJpc3MiOiJodHRwczovL2dhYmVpby51cy5hdXRoMC5jb20vIiwic3ViIjoidDhMdXBZMUFwZW1jYk5QWGxUN1dub1BxSENqOXA3RnhAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXBpLmRvZ3MuZ2FiZS5pbyIsImlhdCI6MTYyNDE1MzA0NSwiZXhwIjoxNjI0MjM5NDQ1LCJhenAiOiJ0OEx1cFkxQXBlbWNiTlBYbFQ3V25vUHFIQ2o5cDdGeCIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.l8Fg9dAC4PVK0QuAN-m5hJjOVoMdqBluiGVZR_v4K93jg8ETfKb__PqcQFtrT1_7PxCuExvpvYDnvPS7yFl1ceaTj5fbOnO3p_PII_dV_mJ3ZjirJbtHw1-__i8JfyBOeAEBcHYzw5dQbSItTJhZHIEkOZFWUs6_O-KxoL1i0OOcykk1eBj4g3TIXrPh0e4AWOn5-GlDC8UxFaDYqI1Rz7jsY9UcHT2BVCzq-2O9N4A9-TB3ToZxbcw2_r_nYmJ_likLAdjJko-IfR3akcpik1R6bNKDXagb-aMmj1IPh5EZbKj4vvfcer8aNtLkaadSAzXEpSBq_mugOrIvbBtyGw",
	fetch: function () {
		//
		const response = fetch(this.url, {
			headers: {
				'authorization': dogsBackend.jwt,
			}
		});
		return response.json()
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

const vm = app.$mount('.dogs')
