import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {createContainer} from 'meteor/react-meteor-data';

import {Tasks} from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import MapWrapper from './Map/MapWrapper.jsx';

// App component - represent the whole app
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			hideCompleted: false
		};
	}

	handleSubmit(event) {
		event.preventDefault();

		// Find the next text field via the React ref
		const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		Meteor.call('tasks.insert', text);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = '';
	}

	toggleHideCompleted() {
		this.setState({
			hideCompleted: !this.state.hideCompleted
		});
	}

	renderTasks() {
		let filteredTasks = this.props.tasks;
		if (this.state.hideCompleted) {
			filteredTasks = filteredTasks.filter(task => !task.checked);
		}

		return filteredTasks.map((task) => {
			const currentUserId = this.props.currentUser && this.props.currentUser._id;
			const showPrivateButton = task.owner === currentUserId;

			return (<Task key={task._id} task={task} showPrivateButton={showPrivateButton}/>);
		});
	}

	renderMap() {
		return (<MapWrapper/>);
	}

	render() {
		return (
			<div className="container">
				<header>
					<h1>RaceDay</h1>
					<h3>The only race tracking app you will ever need!</h3>

					{/*
						<label className="hide-completed">
							<input type="checkbox" readOnly="readOnly" checked={this.state.hideCompleted} onClick={this.toggleHideCompleted.bind(this)} />
							Hide Completed Tasks
						</label>
					*/}

					<AccountsUIWrapper/> 
				</header>

				<ul>{this.renderTasks()}</ul>

				<div className="map-container">
					{this.renderMap()}
				</div>
			</div>
		);
	}
}

App.propTypes = {
	tasks: PropTypes.array.isRequired,
	incompleteCount: PropTypes.number.isRequired,
	currentUser: PropTypes.object
};

export default createContainer(() => {
	Meteor.subscribe('tasks');
	Meteor.subscribe('markers');

	return {
		tasks: Tasks.find({}, {
			sort: {
				createdAt: -1
			}
		}).fetch(),
		incompleteCount: Tasks.find({
			checked: {
				$ne: true
			}
		}).count(),
		currentUser: Meteor.user()
	};
}, App);