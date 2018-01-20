import React from "react";
import PropTypes from "prop-types";
import store from '../Store';
import svgs from '../SVGs';
import {Link} from "react-router-dom";
import shared from "../Shared";


class PlayableTeam extends React.Component {
	render() {
		let teamDetail = false;

		const offenseDefenseMatrix = [shared.consts.positionTypes.offense, shared.consts.positionTypes.defense];
		if (this.props.side === 'right') {
			offenseDefenseMatrix.reverse();
		}

		if (this.props.team.name) {
			const totals = shared.funcs.totalPlayingByPositionType(this.props.team.players);
			teamDetail = (
				<div>
					<div className="offense-defense">
						{this.props.side === 'right' ? 'Defense' : 'Offense'}
					</div>
					<div>
						<div>Run: {totals[offenseDefenseMatrix[0]].totalRun}{this.props.showRollButtons ? <button onClick={() => this.props.onRoll(this.props.team.name, offenseDefenseMatrix[0], shared.consts.playTypes.run)}>Roll w/ Bonus</button> : false}</div>
						<div>Pass: {totals[offenseDefenseMatrix[0]].totalPass}{this.props.showRollButtons ? <button onClick={() => this.props.onRoll(this.props.team.name, offenseDefenseMatrix[0], shared.consts.playTypes.pass)}>Roll w/ Bonus</button> : false}</div>
					</div>
					<div className="offense-defense">
						{this.props.side === 'right' ? 'Offense' : 'Defense'}
					</div>
					<div>
						<div>Run: {totals[offenseDefenseMatrix[1]].totalRun}{this.props.showRollButtons ? <button onClick={() => this.props.onRoll(this.props.team.name, offenseDefenseMatrix[1], shared.consts.playTypes.run)}>Roll w/ Bonus</button> : false}</div>
						<div>Pass: {totals[offenseDefenseMatrix[1]].totalPass}{this.props.showRollButtons ? <button onClick={() => this.props.onRoll(this.props.team.name, offenseDefenseMatrix[1], shared.consts.playTypes.pass)}>Roll w/ Bonus</button> : false}</div>
					</div>
					<div className="offense-defense">
						Special Teams
					</div>
					<div>
						<div>Kick: {totals[shared.consts.positionTypes.special].totalKick}</div>
						<div>Punt: {totals[shared.consts.positionTypes.special].totalPunt}</div>
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

	// roll was clicked, do a roll
	onRoll: PropTypes.func.isRequired,
	// show roll buttons
	showRollButtons: PropTypes.bool.isRequired,
};

export default PlayableTeam;