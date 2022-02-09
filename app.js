Sentry.init({
  dsn: "https://02e55cd7188542b18a05675854fce385@o52482.ingest.sentry.io/5825800",
  integrations: [new Sentry.Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});



dayjs.extend(window.dayjs_plugin_relativeTime);
const query = window.location.search;
const shouldParseResult = query.includes("code=") && query.includes("state=");
const errorsPresent = query.includes("error=") || query.includes("error_description=");

// The Auth0 client, initialized in configureClient()
let auth0 = createAuth0Client({
	domain: "gabeio.us.auth0.com",
	client_id: "s4ZzyMC5rckYUrYXr2FmpivQ86C4imiy",
	audience: "https://api.dogs.gabe.io",
	cacheLocation: 'localstorage',
}).then(auth0 => {
	if (errorsPresent) {
		let queries = query.split('&')
		let error = null
		let description = null
		window.history.pushState("", "", '/') // remove query string
		for (queri of queries) {
			if (queri.includes("error=")) {
				error = decodeURIComponent(queri.split("=")[1])
			} else if (queri.includes("error_description=")) {
				description = decodeURIComponent(queri.split("=")[1])
			}
		}
		const app = Vue.createApp({
			methods: {
				logout: function () {
					auth0.logout();
				},
			}
			data: function () {
				return {
					error: error,
					description: description,
				}
			},
			template: `<div class="alert alert-danger" role="alert" v-on:click="logout()">{{ error }}: {{ description }}</div>`,
		}).mount('.dogs')
	} else if (shouldParseResult) {
		auth0.handleRedirectCallback().then(result => {
			window.history.pushState("", "", '/') // remove query string
			const dogsBackend = {
				url: "https://6fr0s1p5oc.execute-api.us-east-2.amazonaws.com/dogs",
				jwt: "",
				get: function (callback) {
					auth0.isAuthenticated().then(authed => {
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
					auth0.isAuthenticated().then(authed => {
						if (authed) {
							auth0.getTokenSilently().then(token => {
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
								if (dog.name === doggie.name && dog.updated_at != doggie.updated_at) {
									doggie.updated_at = dog.updated_at;
								}
							}
						}
					},
					since: function (dog) {
						console.log("this", this)
						return dayjs(dog.updated_at).fromNow()
					}
				}
			})
			app.config.globalProperties.$filters = {
				since(value) {
					return dayjs(dog.updated_at).fromNow()
				}
			}
			const vm = app.mount('.dogs')
			window.vm = vm
			setInterval(function() {
				dogsBackend.get()
			}, 5000)
		})
	} else {
		auth0.loginWithRedirect({
			redirect_uri: window.location.origin
		})
	}

	return auth0
})
