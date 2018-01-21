import React from "react";
import {BrowserRouter} from 'react-router-dom'
import * as ReactDOM from "react-dom";
import {connect, Provider} from "react-redux";
import PropTypes from "prop-types";
import {Route, Switch, withRouter} from "react-router";
import store from './Store';
import shared from './Shared';
import reducers from "./Reducers";
import PlayGame from "./PlayGame/PlayGame";
import TeamEdit from "./TeamEdit/TeamEdit";
import PlayerEdit from "./PlayerEdit/PlayerEdit";
import Charts from "./Charts/Charts";

class AppClass extends React.Component {
	constructor(props) {
		super(props);
		shared.funcs.startup();
	}

	render() {
		return (
			<div id="app">
				<div id="title">Football Tracker</div>

				<div id="contentContainer">
					<Switch>
						<Route
							path="/team/:teamName"
							render={props => <TeamEdit team={shared.funcs.getTeam(props.match.params.teamName)}/>}/>
						<Route
							path="/player/:playerUniqueId"
							render={props => <PlayerEdit routePlayerUniqueId={props.match.params.playerUniqueId}/>}
							onEnter={props => store.dispatch({type: reducers.ACTION_TYPES.SET_EDITING_PLAYER_ID, payload: props.match.params.playerUniqueId})}/>
						<Route path="/charts" component={Charts}/>
						<Route render={() => <PlayGame {...this.props}/>}/>
					</Switch>
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
