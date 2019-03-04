import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
	render() {
		console.log('In Home');

		//Deconstruct the props
		const { isAuthenticated, login } = this.props.auth;

		return (
			<div>
				<h1>Home</h1>
				{//Check and use the is thenticated method to see if time is not expired
				//if authenticated, add the link to the profile
				isAuthenticated() ? (
					<Link to="/profile">View User's Profile</Link>
				) : (
					<button onClick={login}>Log In</button>
				)}
			</div>
		);
	}
}

export default Home;
