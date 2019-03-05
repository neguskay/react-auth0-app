//library
const express = require('express');
require('dotenv').config(); //automatically give us access to env vars in the root
const jwt = require('express-jwt'); // Validate JWT and set req.user
const jwksRsa = require('jwks-rsa'); // Retrieve RSA keys from a JSON Web Key set (JWKS) endpoint:exposed by Auth0 from our domain
const checkScope = require('express-jwt-authz'); // Validate the received JWT scopes

const checkJwt = jwt({
	// Dynamically provide a signing key based on the kid in the header
	// and the signing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true, // cache the signing key
		rateLimit: true,
		jwksRequestsPerMinute: 5, // prevent attackers from requesting more than 5 per minute
		jwksUri: `https://${
			process.env.REACT_APP_AUTH0_DOMAIN
		}/.well-known/jwks.json`
	}),

	// Validate the audience and the issuer.
	audience: process.env.REACT_APP_AUTH0_AUDIENCE,
	issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,

	// This must match the algorithm selected in the Auth0 dashboard under your app's advanced settings under the OAuth tab
	algorithms: ['RS256']
});

const app = express();

//End point declaration
//Public Route
app.get('/public', function(req, res) {
	//first end point
	res.json({
		message: 'Hello from a Public API!'
	});
});

//End point: Private
//Private Route
// adds checkJWT to check the JWT token of a user for authentication
//Requires a JWT
//Uses the extra argument checkJWT to check the request: assures user's authentication and
// .. checks if a valid JWT has been sent before they can receive a reponse
// We can also add other checks inbetween, before returning any reponse and if those fail,
// ..no response will be sent.
app.get('/private', checkJwt, function(req, res) {
	res.json({
		message: 'Hello from a Private API!'
	});
});

//Check if user has the right authorisation:role
//Parses an argument i.e. role, to be checked against
function checkRole(role) {
	//Parse request, response and next() i.e. cleanup or next item in the chain
	return function(req, res, next) {
		//get User's assigned roles from Auth0 included in the user's metadata and store as an array
		const assignedRoles = req.user['http://localhost:3000/roles'];
		//check if array is not empty AND that it has the 'role' we are checking against
		if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
			//If above satified, return the next item in the chain
			//or clean up and close pipe
			return next();
		} else {
			//Else send an Error back
			console.log('Not and admin');
			return res
				.status(401)
				.send('User Does Not Have Appropriate Role Authorisation');
		}
	};
}

//Courses Endpoint
//Courses Route
// adds checkJWT to check the JWT token of a user for authentication
// adds checkScope for checking that the user has the right scope authorisation to access the 'Courses' resource
//Similar to the 'private' end point above
//Adds scope checking as anrgument to check for the 'read:courses' scope
app.get('/courses', checkJwt, checkScope(['read:courses']), function(req, res) {
	res.json({
		//Some stored 'courses' on the server
		courses: [
			{ id: 1, title: 'Building Apps with React and Redux' },
			{ id: 2, title: 'Creating Reusable React Components' }
		]
	});
});

//Admin Route
// adds checkJWT to check the JWT token of a user for authentication
// adds checkRole for checking that the user has the right authorisation to acess 'admin' resources
app.get('/admin', checkJwt, checkRole('admin'), function(req, res) {
	res.json({
		message: "Hello from a Admin API! You have the 'admin' authorisation"
	});
});

//Declare a port to listen on
app.listen(3001);
console.log('API server listening on ' + process.env.REACT_APP_AUTH0_AUDIENCE);
