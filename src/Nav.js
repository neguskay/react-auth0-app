import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Nav extends Component {
	render() {
		console.log('In Nav component');

		const { isAuthenticated, login, logout, userHasScopes } = this.props.auth;
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
						<Link to="/public">Public</Link>
					</li>
					{isAuthenticated() && (
						<li>
							<Link to="/private">Private</Link>
						</li>
					)}
					{isAuthenticated() && userHasScopes(['read:courses']) && (
						<li>
							<Link to="/courses">Courses</Link>
						</li>
					)}
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
