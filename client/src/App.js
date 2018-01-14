import React from "react";
import {BrowserRouter, NavLink, Route, Switch} from 'react-router-dom'
import * as ReactDOM from "react-dom";
import {connect, Provider} from "react-redux";
import PropTypes from "prop-types";
import {withRouter} from "react-router";
import store from './Store';
import shared from './Shared';
import Home from './home/Home';
import Tournament from "./tournament/Tournament";
import Bracket from "./bracket/Bracket";
import GameEdit from "./gameEdit/GameEdit";
import moment from "moment";
import PrintBrackets from "./printBrackets/PrintBrackets";


class MenuItem extends React.Component {
	render() {
		return <NavLink to={this.props.url} exact={this.props.url === '/'} activeClassName="current" className={this.props.isUser ? 'account' : ''}>{this.props.title}</NavLink>;
	}
}
MenuItem.defaultProps = {
	isUser: false,
	isCurrent: false,
};

MenuItem.propTypes = {
	url: PropTypes.string.isRequired,
	isCurrent: PropTypes.bool,
	title: PropTypes.string.isRequired,
	// is this the user menu item
	isUser: PropTypes.bool,
};

class AppClass extends React.Component {
	constructor(props) {
		super(props);
		shared.funcs.startup();
	}

	render() {

		let admin = [];
		if (this.props.user && this.props.user.isAdmin) {
			admin = admin.concat([
				<MenuItem key="tournament" url="/tournament" title="Edit Tournament"/>,
				<MenuItem key="printBrackets" url="/printBrackets" title="Print Brackets"/>,
			]);
		}
		const myBracketAvailable = shared.vars.upcomingDates && shared.vars.upcomingDates[1].momentDate.isSameOrBefore(moment());
		return (
			<div id="app">
				<div id="title">Fantasy Bracket</div>

				<div id="appBody">
					<div id="navigation">
						{this.props.user ? <MenuItem key="account" isUser={true} url="/account" title={this.props.user ? `${this.props.user.firstName} ${this.props.user.lastName}` : ''}/>: false}
						<MenuItem account="home" url="/" title="Home" isCurrent={true}/>
						{myBracketAvailable ? <MenuItem key="myBracket" url="/bracket" title="My Bracket"/> : false}
						<MenuItem key="realBracket" url="/realBracket" title="Real Bracket"/>
						{admin}
					</div>
					<div id="content">
						<Switch>
							<Route path='/realBracket/game/:conference/:round/:gameNumber' render={props => <GameEdit
								key={props.match.params.conference + props.match.params.round + props.match.params.gameNumber}
								conference={props.match.params.conference}
								round={props.match.params.round}
								gameNumber={props.match.params.gameNumber}
							/>}/>
							<Route path='/bracket' render={() => <Bracket tournament={this.props.tournament} realBracket={false} myPicks={this.props.myPicks}/>}/>
							<Route path='/realBracket' render={() => <Bracket tournament={this.props.tournament} realBracket={true}/>}/>
							<Route path='/tournament' component={Tournament}/>
							<Route path='/printBrackets' render={() => <PrintBrackets tournament={this.props.tournament} people={this.props.people}/>}/>
							<Route component={Home}/>
						</Switch>
						{this.props.ajaxingCount ? <div id="ajaxingOverlay"/> : false}
					</div>
				</div>

				<div id="footer">1.0.0 | &copy;2017 DTS</div>
			</div>
		);
	}
}

AppClass.propTypes = {
	// === STORE === //
	// the current logged in user, not required because it is undefined until it is ajax fetched
	user: PropTypes.object,
	// the current tournament
	tournament: PropTypes.object,
	// the people that are users in the app
	people: PropTypes.array,
	// current ajax outstanding count
	ajaxingCount: PropTypes.number.isRequired,
	// current user's picks
	myPicks: PropTypes.object,
};

// withRouter required so that routing isn't blocked: https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
const App = withRouter(connect(
	state => state,
	dispatch => {
		return {}
	},
)(AppClass));

ReactDOM.render((<BrowserRouter basename="/fantasyBracket"><Provider store={store}><App/></Provider></BrowserRouter>), document.getElementById('react'));
