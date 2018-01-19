import React from "react";
import PropTypes from "prop-types";
import store from '../Store';
import svgs from '../SVGs';
import {Link} from "react-router-dom";
import shared from "../Shared";


class PlayableTeam extends React.Component {
	render() {
		let teamDetail = false;

		if (this.props.team.name) {
			const totals = shared.funcs.totalPlayingByPositionType(this.props.team.players);
			teamDetail = (
				<div>
					<div className="offense-defense">
						{this.props.side === 'right' ? 'Defense' : 'Offense'}
					</div>
					<div>
						<div>Run: {totals[shared.consts.positionTypes.offense].totalRun}<button>Roll w/ Bonus</button></div>
						<div>Pass: {totals[shared.consts.positionTypes.offense].totalPass}<button>Roll w/ Bonus</button></div>
					</div>
					<div className="offense-defense">
						{this.props.side === 'right' ? 'Offense' : 'Defense'}
					</div>
					<div>
						<div>Run: {totals[shared.consts.positionTypes.defense].totalRun}<button>Roll w/ Bonus</button></div>
						<div>Pass: {totals[shared.consts.positionTypes.defense].totalPass}<button>Roll w/ Bonus</button></div>
					</div>
				</div>
			);
		}
		return (
			<div className={`playable-team ${this.props.side}`}>
				<div className="name-row">
					<div className="arrow">
						{this.props.team.name ? <Link to={`team/${this.props.team.name}`}>{svgs.arrowLeft()}</Link> : false}
					</div>
					<div>
						<select value={this.props.team ? this.props.team.name : ''} onChange={event => this.props.onTeamChanged(event.target.value)}>
							<option key="blank" value={''}>Select a Team</option>
							{store.getState().teams.map(team => <option key={team.name} value={team.name}>{team.name}</option>)}
						</select>
					</div>
				</div>
				{teamDetail}
			</div>
		);
	}
}

PlayableTeam.propTypes = {
	// the team to show, false to have an empty menu
	team: PropTypes.object,

	side: PropTypes.string.isRequired,

	// the selected team was changed
	onTeamChanged: PropTypes.func.isRequired,
};

export default PlayableTeam;