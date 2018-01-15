import React from "react";
import {BrowserRouter} from 'react-router-dom'
import * as ReactDOM from "react-dom";
import {connect, Provider} from "react-redux";
import PropTypes from "prop-types";
import {withRouter} from "react-router";
import store from './Store';
import shared from './Shared';
import PlayableTeam from "./PlayableTeam/PlayableTeam";
import reducers from "./Reducers";


class AppClass extends React.Component {
	constructor(props) {
		super(props);
		shared.funcs.startup();
	}

	render() {
		let leftTeam = shared.funcs.getTeam(this.props.selectedTeams.left);
		let rightTeam = shared.funcs.getTeam(this.props.selectedTeams.right);

		return (
			<div id="app">
				<div id="title">Football Tracker</div>

				<div id="teamsContainer">
					<div className="teamContainer">
						<PlayableTeam
							side="left"
							team={leftTeam ? leftTeam : {}}
							onTeamChanged={teamName => this.props.setSelectedTeam('left', teamName)}/>
					</div>
					<div className="outputContainer">
						show output here
					</div>
					<div className="teamContainer">
						<PlayableTeam
							team={rightTeam ? rightTeam : {}}
							side="right"
							onTeamChanged={teamName => this.props.setSelectedTeam('right', teamName)}/>
					</div>
				</div>

				<div className="navContainer">
				</div>
			</div>
		);
	}
}


AppClass.propTypes = {
	// === STORE === //
	// the current logged in user, not required because it is undefined until it is ajax fetched
	teams: PropTypes.array,
	// which teams are selected
	selectedTeams: PropTypes.object.isRequired,
	// current ajax outstanding count
	ajaxingCount: PropTypes.number.isRequired,
};

// withRouter required so that routing isn't blocked: https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
const App = withRouter(connect(
	state => state,
	dispatch => {
		return {
		setSelectedTeam: (side, teamName) => dispatch({type: reducers.ACTION_TYPES.SET_SELECTED_TEAM, payload: {side: side, teamName: teamName}}),
		}
	},
)(AppClass));

ReactDOM.render((<BrowserRouter basename="/football/client"><Provider store={store}><App/></Provider></BrowserRouter>), document.getElementById('react'));
