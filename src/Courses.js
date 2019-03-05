import React, { Component } from 'react';

//Courses component which renders the '/courses' endpoint
class Courses extends Component {
	//State with courses: initially empty
	state = {
		courses: []
	};

	//Will check anf fetch resources i.e. courses after mounting and also perform some clean up
	componentDidMount() {
		fetch('/courses', {
			headers: { Authorization: `Bearer ${this.props.auth.getAccessToken()}` }
		})
			.then(response => {
				if (response.ok) return response.json();
				throw new Error('Network response was not ok.');
			})
			.then(response => this.setState({ courses: response.courses }))
			.catch(error => this.setState({ message: error.message }));

		fetch('/admin', {
			headers: { Authorization: `Bearer ${this.props.auth.getAccessToken()}` }
		})
			.then(response => {
				console.log(response);
				if (response.ok) return response.json();
				throw new Error('Network response was not ok.');
			})
			.then(response => console.log(response))
			.catch(error => this.setState({ message: error.message }));
	}

	//Maps over the array of courses returned from the server
	//Maps onto the course.id as a key and lists the Course Title
	render() {
		console.log('Courses::', this.state.courses);
		return (
			<ul>
				{this.state.courses.map(course => {
					return <li key={course.id}>{course.title}</li>;
				})}
			</ul>
		);
	}
}

export default Courses;
