import auth0 from 'auth0-js';

// Stored outside class since private
// underscore beginning intends 'private'
// eslint-disable-next-line
let _idToken = null;
let _accessToken = null;
let _scopes = null;
let _expiresAt = null;

//Redirect consts
const REDIRECT_ON_LOGIN = 'redirect_on_login';

export default class Auth {
	constructor(history) {
		this.history = history;
		this.userProfile = null;
		this.requestedScopes = 'openid profile email read:courses';
		this.auth0 = new auth0.WebAuth({
			domain: process.env.REACT_APP_AUTH0_DOMAIN,
			clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
			redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
			audience: process.env.REACT_APP_AUTH0_AUDIENCE,
			responseType: 'token id_token',
			scope: this.requestedScopes
		});
	}

	login = () => {
		//Store the current browser location
		localStorage.setItem(
			REDIRECT_ON_LOGIN,
			JSON.stringify(this.history.location)
		);

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
				//For debugging
				//debugger;

				//if available and right, start a new session
				this.setSession(authResult);

				//Retreive location path before login click
				//set default to root if it does not exist
				const redirectLocation =
					localStorage.getItem(REDIRECT_ON_LOGIN) === 'undefined'
						? '/'
						: JSON.parse(localStorage.getItem(REDIRECT_ON_LOGIN));

				//call this history
				//reset to home page
				this.history.push(redirectLocation);
			} else if (err) {
				this.history.push('/');
				alert(`Error: ${err.error}. Check the console for further details.`);
				console.log(err);
			}

			//Clean up after the code
			localStorage.removeItem(REDIRECT_ON_LOGIN);
		});
	};

	setSession = authResult => {
		//Set access token expiry time
		console.log(authResult);
		// set the time that the access token will expire

		//UNIX EPOCH time
		_expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

		// If there is a value on the `scope` param from the authResult,
		// use it to set scopes in the session for the user. Otherwise
		// use the scopes as requested. If no scopes were requested,
		// set it to nothing
		_scopes = authResult.scope || this.requestedScopes || '';

		//Store access information
		//This stores the access tokens and session information in memory for the time being
		//Ideally, should move and be handled by server side

		///Following not needed as we store in memory
		//localStorage.setItem('access_token', authResult.accessToken);
		//localStorage.setItem('id_token', authResult.idToken);
		//localStorage.setItem('expires_at', expiresAt);
		//localStorage.setItem('scopes', JSON.stringify(scopes));

		//Using memory storage
		_accessToken = authResult.accessToken;
		_idToken = authResult.idToken;

		//Automatic session jwt token renewal
		this.scheduleTokenRenewal();
	};

	//Use the session items stored to render a "logged in/ active user home page"
	isAuthenticated() {
		//Get and parse the stored unix epoch time in local storage
		//const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
		return new Date().getTime() < _expiresAt;
	}

	logout = () => {
		//Soft Logout
		//only kills your local storage session
		//does not actually kill auth0 servers
		//Very useful for 'single SignOn implementation'
		//Reset/clear local storage of any tokens and user data from session saved
		// localStorage.removeItem('access_token');
		// localStorage.removeItem('id_token');
		// localStorage.removeItem('expires_at');
		// localStorage.removeItem('scopes');

		//Clear out the userProfile instance we created
		//this.userProfile = null; //Not needed, handled and cleared by redirect

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
		//const accessToken = localStorage.getItem('access_token');

		//Throw error for missing access token
		if (!_accessToken) {
			throw new Error('No access token found.');
		}
		//return
		return _accessToken;
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

	//Passes an array of acopes
	//Checks for granted scopes  in local storage
	//Splits on " " delimitter
	//defaults to empty string
	//Uses 'scopes.every' to iterate and check if all acopes found match the ones reauested by the resource being accessed
	//Returns true if satisfied
	userHasScopes(scopes) {
		const grantedScopes = (_scopes || '').split(' ');
		return scopes.every(scope => grantedScopes.includes(scope));
	}

	//Used for Silent Authentication
	//Ask auth0 if there is still a live session or not
	//Then get a new token, if there is, via iFrame,
	//Then pass it down to app to keep user's logged in on newtabs if they visit the site
	renewToken(cb) {
		//Usually takes in arguments: audience and scope, but will default to our defaults
		this.auth0.checkSession({}, (err, result) => {
			//Handle error if there is one
			if (err) {
				console.log(`Error: ${err.error} - ${err.error_description}.`);
			} else {
				//Set sessions if no errors and sessions exist
				this.setSession(result);
			}
			//Accept an optional callback if error and response are received
			if (cb) cb(err, result);
		});
	}

	//Call to renew tokens automaticalle when they expire
	//To be called in setSession
	scheduleTokenRenewal() {
		//Get remainder time
		const delay = _expiresAt - Date.now();

		//Renew the token
		if (delay > 0) setTimeout(() => this.renewToken(), delay);
	}
}
