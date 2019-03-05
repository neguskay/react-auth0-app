import React, { Component } from 'react';

//Component for the '/public' route
//Mainly for public and open resources that do not require special authorisation
class Public extends Component {
	state = {
		message: ''
	};

	//Lifecycle Methods
	//Use to perform utilitarian actions:
	// -eg, fething data before rendering, updating/re-fetching changed data
	// -and/ even closing the request ports and doing clean up after a fetch
	// -i.e. WillMount, WillUpdate, DidMount
	//Others are 'constructor: for setting states', and 'render: for generating the new page'
	componentDidMount() {
		//Attempt a fetch, wait for the promis and check the reponse
		fetch('/public')
			.then(response => {
				//if response, then do stuff
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

export default Public;
