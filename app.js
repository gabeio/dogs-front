const query = window.location.search;
const shouldParseResult = query.includes("code=") && query.includes("state=");

// The Auth0 client, initialized in configureClient()
let auth0 = createAuth0Client({
	domain: "gabeio.us.auth0.com",
	client_id: "s4ZzyMC5rckYUrYXr2FmpivQ86C4imiy",
	audience: "https://api.dogs.gabe.io",
	cacheLocation: 'localstorage',
}).then(auth0 => {
	console.log("createAuth0Client: auth0", auth0)
	console.log("shouldParseResult", shouldParseResult)
	if (shouldParseResult) {
		auth0.handleRedirectCallback().then(result => {
			window.history.pushState("", "", '/') // remove query string
			console.log("handleRedirectCallback: result", result)
			const dogsBackend = {
				url: "https://6fr0s1p5oc.execute-api.us-east-2.amazonaws.com/dogs",
				jwt: "",
				get: function (callback) {
					console.log("dogsBackend.get: auth0.then", auth0)
					auth0.isAuthenticated().then(authed => {
						console.log("dogsBackend.get: auth0.isAuthenticated", authed)
						if (authed) {
							auth0.getTokenSilently().then(token => {
								fetch(this.url, {
									credentials: 'include',
									headers: {
										'authorization': "Bearer " + token,
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
									if (isFunction(callback)) {
										callback(null)
									}
								})
							})
						} else {
							auth0.loginWithRedirect({
								redirect_uri: window.location.origin
							})
						}
					})
				},
				set: function (dog, callback) {
					console.log("dogsBackend.set: auth0.then", auth0)
					auth0.isAuthenticated().then(authed => {
						console.log("dogsBackend.get: auth0.isAuthenticated", authed)
						if (authed) {
							auth0.getTokenSilently().then(token => {
								console.log(dog)
								fetch(this.url, {
									method: 'POST',
									credentials: 'include',
									headers: {
										'Content-Type': 'application/json',
										'authorization': "Bearer " + token,
									},
									body: JSON.stringify(dog),
								})
								.then(function () {
									if (isFunction(callback)) {
										callback(null)
									}
								})
							})
						} else {
							auth0.loginWithRedirect({
								redirect_uri: window.location.origin
							})
						}
					})
				}
			}
			
			function isFunction(functionToCheck) {
				return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
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
			
			console.log("interval: ", setInterval(function() {
				dogsBackend.get()
			}, 5000))
		})
	} else {
		auth0.loginWithRedirect({
			redirect_uri: window.location.origin
		})
	}

	return auth0
})

/**
 * Starts the authentication flow
 * /
const login = async () => {
	try {
		console.log("Logging in");

		await auth0.loginWithRedirect();
	} catch (err) {
		console.log("Log in failed", err);
	}
};

/**
 * Executes the logout flow
 * /
const logout = () => {
	try {
		console.log("Logging out");
		auth0.logout({
			returnTo: window.location.origin
		});
	} catch (err) {
		console.log("Log out failed", err);
	}
};
 */

