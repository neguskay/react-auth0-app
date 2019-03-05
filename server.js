//library
const express = require('express');
require('dotenv').config(); //automatically give us access to env vars in the root
const jwt = require('express-jwt'); // Validate JWT and set req.user
const jwksRsa = require('jwks-rsa'); // Retrieve RSA keys from a JSON Web Key set (JWKS) endpoint:exposed by Auth0 from our domain

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
app.get('/public', function(req, res) {
	//first end point
	res.json({
		message: 'Hello from a public API!'
	});
});

//End point: Private
//Requires a JWT
//Uses the extra argument checkJWT to check the request: assures user's authentication and
// .. checks if a valid JWT has been sent before they can receive a reponse
// We can also add other checks inbetween, before returning any reponse and if those fail,
// ..no response will be sent.
app.get('/private', checkJwt, function(req, res) {
	res.json({
		message: 'Hello from a private API!'
	});
});

//Declare a port to listen on
app.listen(3001);
console.log('API server listening on ' + process.env.REACT_APP_AUTH0_AUDIENCE);
