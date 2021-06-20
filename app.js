const dogsBackend = {
	url: "https://6fr0s1p5oc.execute-api.us-east-2.amazonaws.com/dogs",
	jwt: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpGTE1kaUR3VW9rMEpKSU0zWnJWOSJ9.eyJpc3MiOiJodHRwczovL2dhYmVpby51cy5hdXRoMC5jb20vIiwic3ViIjoidDhMdXBZMUFwZW1jYk5QWGxUN1dub1BxSENqOXA3RnhAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXBpLmRvZ3MuZ2FiZS5pbyIsImlhdCI6MTYyNDE1MzA0NSwiZXhwIjoxNjI0MjM5NDQ1LCJhenAiOiJ0OEx1cFkxQXBlbWNiTlBYbFQ3V25vUHFIQ2o5cDdGeCIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.l8Fg9dAC4PVK0QuAN-m5hJjOVoMdqBluiGVZR_v4K93jg8ETfKb__PqcQFtrT1_7PxCuExvpvYDnvPS7yFl1ceaTj5fbOnO3p_PII_dV_mJ3ZjirJbtHw1-__i8JfyBOeAEBcHYzw5dQbSItTJhZHIEkOZFWUs6_O-KxoL1i0OOcykk1eBj4g3TIXrPh0e4AWOn5-GlDC8UxFaDYqI1Rz7jsY9UcHT2BVCzq-2O9N4A9-TB3ToZxbcw2_r_nYmJ_likLAdjJko-IfR3akcpik1R6bNKDXagb-aMmj1IPh5EZbKj4vvfcer8aNtLkaadSAzXEpSBq_mugOrIvbBtyGw",
	get: function (callback) {
		if (auth0.isAuthenticated) {
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
				if (isFunction(callback)) {
					callback(null)
				}
			})
		} else {
			login("https://dogs.gabe.io")
		}
	},
	set: function (dog, callback) {
		if (auth0.isAuthenticated) {
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
				if (isFunction(callback)) {
					callback(null)
				}
			})
		} else {
			login("https://dogs.gabe.io")
		}
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


// The Auth0 client, initialized in configureClient()
let auth0 = null;

/**
 * Starts the authentication flow
 */
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      redirect_uri: window.location.origin
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
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

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  auth0 = await createAuth0Client({
    domain: "https://gabeio.us.auth0.com",
    client_id: "t8LupY1ApemcbNPXlT7WnoPqHCj9p7Fx",
    audience: "https://api.dogs.gabe.io",
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

/**
 * Calls the API endpoint with an authorization token
 */
const callApi = async () => {
  try {
    const token = await auth0.getTokenSilently();

    const response = await fetch("/api/external", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const responseData = await response.json();
    const responseElement = document.getElementById("api-call-result");

    responseElement.innerText = JSON.stringify(responseData, {}, 2);

    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

    eachElement(".result-block", (c) => c.classList.add("show"));
  } catch (e) {
    console.error(e);
  }
};

// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  const bodyElement = document.getElementsByTagName("body")[0];

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0.handleRedirectCallback();

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }
};
