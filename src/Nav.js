import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Nav extends Component {
	render() {
		console.log('In Nav component');

		const { isAuthenticated, login, logout } = this.props.auth;
		return (
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/profile">Profile</Link>
					</li>
					<li>
						<Link to="/" onClick={isAuthenticated() ? logout : login}>
							{isAuthenticated() ? 'Log Out' : 'Log In'}
						</Link>
					</li>
				</ul>
			</nav>
		);
	}
}

export default Nav;
