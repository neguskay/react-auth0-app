import auth0 from 'auth0-js';

export default class Auth {
	constructor(history) {
		this.history = history;
		this.userProfile = null;
		this.auth0 = new auth0.WebAuth({
			domain: process.env.REACT_APP_AUTH0_DOMAIN,
			clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
			redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
			audience: process.env.REACT_APP_AUTH0_AUDIENCE,
			responseType: 'token id_token',
			scope: 'openid profile email'
		});
	}

	login = () => {
		//attempt to authorise using auth0
		console.log('Attempting Authorisation...');
		this.auth0.authorize();
	};

	// accept  a history argument (1 argument)
	handleAuthentication = () => {
		//Parse the hash from the URL and get the 'err' and 'result'
		this.auth0.parseHash((err, authResult) => {
			//check what you received if its right
			if (authResult && authResult.accessToken && authResult.idToken) {
				//if available and right, start a new session
				this.setSession(authResult);

				//call this history
				//reset to home page
				this.history.push('/');
			} else if (err) {
				this.history.push('/');
				alert(`Error: ${err.error}. Check the console for further details.`);
				console.log(err);
			}
		});
	};

	setSession = authResult => {
		//Set access token expiry time
		console.log(authResult);
		// set the time that the access token will expire
		const expiresAt = JSON.stringify(
			//UNIX EPOCH time
			authResult.expiresIn * 1000 + new Date().getTime()
		);

		//Store access information
		//This stores the access tokens and session information in memory for the time being
		//Ideally, should move and be handled by server side
		localStorage.setItem('access_token', authResult.accessToken);
		localStorage.setItem('id_token', authResult.idToken);
		localStorage.setItem('expires_at', expiresAt);
	};

	//Use the session items stored to render a "logged in/ active user home page"
	isAuthenticated() {
		//Get and parse the stored unix epoch time in local storage
		const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
		return new Date().getTime() < expiresAt;
	}

	logout = () => {
		//Soft Logout
		//only kills your local storage session
		//does not actually kill auth0 servers
		//Very useful for 'single SignOn implementation'
		//Reset/clear local storage of any tokens and user data from session saved
		localStorage.removeItem('access_token');
		localStorage.removeItem('id_token');
		localStorage.removeItem('expires_at');

		//Clear out the userProfile instance we created
		this.userProfile = null;

		//For a Hard Logout, i.e. kill/logout of auth0 servers
		this.auth0.logout({
			clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
			returnTo: 'http://localhost:3000'
		});
		//Reset to homepage
		//Only use history.push if doing soft logout,
		//hard logout has its own return to attribute
		//this.history.push('/');
	};

	getAccessToken = () => {
		//Retreive from local storage
		//if using a db, this method should be used to query the db for access tokens
		//After this, the 'get profile' method can be used to get profile details from the BE server
		const accessToken = localStorage.getItem('access_token');

		//Throw error for missing access token
		if (!accessToken) {
			throw new Error('No access token found.');
		}
		//return
		return accessToken;
	};

	getProfile = cb => {
		//If we have a profile available for access token, return it to the call back function
		if (this.userProfile) return cb(this.userProfile);

		//IF not, pass the user token to the userInfo end point to get the user's profile associated with it
		this.auth0.client.userInfo(this.getAccessToken(), (err, profile) => {
			//Once we've retreived the user profile, set Auth's profile to be the user profile
			if (profile) this.userProfile = profile;
			//call the call back and pass it profile and error should in case
			cb(profile, err);
		});
	};
}
