import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthContext from './AuthContext';
//import AuthContext from './AuthContext';

//Private route component
//Destructuring the props
//Aliasing 'component' prop as 'Component' to be used to render later on
//Usinf the '...rest' i.e. rest operator to store the remainder of the props
//Removed the 'auth' object prop because Auth context will be used instead
//The Context.Consumer expects a render prop declaration and passed a prop from the provider
//Every child will receive auth as a render prop
//This makes the context return a render function
function PrivateRoute({ component: Component, scopes, ...rest }) {
	return (
		<AuthContext.Consumer>
			{auth => (
				<Route
					{...rest}
					//In render, receive some props
					//Check authentication and authorisation
					//Handle approriately
					render={props => {
						// 1. Redirect to login if not logged in.
						if (!auth.isAuthenticated()) return auth.login();

						// 2. Display message if user lacks required scope(s).
						//Check for scopes required
						if (scopes.length > 0 && !auth.userHasScopes(scopes)) {
							return (
								<h1>
									Unauthorized - You need the following scope(s) to view this
									page: {scopes.join(',')}.
								</h1>
							);
						}

						// 3. Render component
						return <Component auth={auth} {...props} />;
					}}
				/>
			)}
		</AuthContext.Consumer>
	);
}

//Set prop types for all properties within the Private route Component
//MIGHT NEED TO TAKE 'auth' object out
PrivateRoute.propTypes = {
	component: PropTypes.func.isRequired,
	scopes: PropTypes.array
};

//Set the default scope
PrivateRoute.defaultProps = {
	scopes: []
};

export default PrivateRoute;
