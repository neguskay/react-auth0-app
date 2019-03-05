import React, { Component } from 'react';

//Component to run the '/private' route
//For API authentication on the BE server side
class Private extends Component {
	state = {
		message: ''
	};

	//Fetch
	//Being a private end point, parse an extra object.
	//The onject configures and set some authorisation for our fetch further
	//Authorisation headers, and bearer "access" token
	//This sends the access token as an authorisation header with the Fetch call
	//Then check the status of teh response and do stuff
	//Throw some error if not
	componentDidMount() {
		fetch('/private', {
			headers: { Authorization: `Bearer ${this.props.auth.getAccessToken()}` }
		})
			.then(response => {
				if (response.ok) return response.json();
				throw new Error('Network response was not ok.');
			})
			.then(response => this.setState({ message: response.message }))
			.catch(error => this.setState({ message: error.message }));
	}

	render() {
		return <p>{this.state.message}</p>;
	}
}

export default Private;
