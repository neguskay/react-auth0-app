import React, { Component } from 'react';

class Profile extends Component {
	state = {
		profile: null,
		error: ''
	};

	componentDidMount() {
		//retreive profile while component loads
		this.loadUserProfile();
	}

	loadUserProfile() {
		//Retreive the profile and set the current state to that profile
		this.props.auth.getProfile((profile, error) =>
			this.setState({ profile, error })
		);
	}

	render() {
		//Destructure to set the profile for rendering
		const { profile } = this.state;
		console.log('state', profile);

		//Check if we actually retreived a valid profile
		//Return null i.e. dont render the profile page, if profile has not been retreived
		if (!profile) return null;
		return (
			<>
				<h1>Profile</h1>
				<p>{profile.nickname}</p>
				<img
					style={{ maxWidth: 50, maxHeight: 50 }}
					src={profile.picture}
					alt="profile pic"
				/>
				<pre>{JSON.stringify(profile, null, 2)}</pre>
			</>
		);
	}
}

export default Profile;
