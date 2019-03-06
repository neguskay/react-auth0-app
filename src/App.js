import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Nav from './Nav';
import Auth from './Auth/Auth';
import Callback from './Callback';
import Public from './Public';
import Private from './Private';
import Courses from './Courses';
import PrivateRoute from './PrivateRoute';
import AuthContext from './AuthContext';

class App extends Component {
	//intantiate Authorisation as a state prop
	//instance token renewal as a state prop
	constructor(props) {
		super(props);
		this.state = {
			auth: new Auth(this.props.history),
			tokenRenewalComplete: false
		};
	}

	//Lifecyle method to execute for rendering
	componentDidMount() {
		//Call to renew token
		//Update renew token state to true if renewed
		this.state.auth.renewToken(() => {
			this.setState({ tokenRenewalComplete: true });
		});
		//Supress rwendering untill token renewal is complete
	}

	render() {
		//Destructure auth to help shorten the code calls
		const { auth, tokenRenewalComplete } = this.state;

		//Add token renewal check
		//Ensures that app won't render if we donot know whether a user is logged in or not
		//Can choose to render a falshy spinner instead of the "Loading.." below
		if (!tokenRenewalComplete) return 'Loading...';

		//Use Auth Context provider to provide auth data down to child components
		//This means they can use the 'consumer' data from the auth context
		//After this, child components do not need 'auth' object to be passed down as props
		// This increases readability
		// Increases and enforces consistency
		// Eliminates redundancy
		return (
			<AuthContext.Provider value={auth}>
				<Nav auth={auth} />
				<div className="body">
					<Route
						path="/"
						exact
						render={props => <Home auth={auth} {...props} />}
					/>
					<Route
						path="/callback"
						render={props => <Callback auth={auth} {...props} />}
					/>
					<PrivateRoute path="/profile" component={Profile} />
					<PrivateRoute path="/private" component={Private} />
					{/* <Route
						path="/profile"
						render={props =>
							this.auth.isAuthenticated() ? (
								<Profile auth={this.auth} {...props} />
							) : (
								<Redirect to="/" />
							)
						}
					/> */}
					<Route path="/public" component={Public} />
					{/* <Route
						path="/private"
						render={props =>
							this.auth.isAuthenticated() ? (
								<Private auth={this.auth} {...props} />
							) : (
								this.auth.login()
							)
						}
          /> */}
					<PrivateRoute
						path="/courses"
						component={Courses}
						scopes={['read:courses']}
					/>
					{/* <Route
						path="/courses"
						render={props =>
							this.auth.isAuthenticated() &&
							this.auth.userHasScopes(['read:courses']) ? (
								<Courses auth={this.auth} {...props} />
							) : (
								this.auth.login()
							)
						}
					/> */}
				</div>
			</AuthContext.Provider>
		);
	}
}

export default App;
