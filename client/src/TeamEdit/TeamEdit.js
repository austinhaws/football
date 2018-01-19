import React from "react";
import {Link} from "react-router-dom";
import svgs from "../SVGs";
import shared from "../Shared";
import GroupTable from "./GroupTable";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import reducers from "../Reducers";
import PropTypes from "prop-types";

class TeamEditClass extends React.Component {

	render() {
		if (!this.props.team) {
			return null;
		}

		const playingTotals = shared.funcs.totalPlayingByPositionType(this.props.team.players);

		this.props.team.players.sort((a, b) => shared.funcs.positionSortOrder(a.position) - shared.funcs.positionSortOrder(b.position));
		const playersGrouped = this.props.team.players.reduce((groups, player) => {
			groups[shared.funcs.positionType(player.position)].push(player);
			return groups;
		}, Object.keys(shared.consts.positionTypes).reduce((types, type) => {types[shared.consts.positionTypes[type]] = []; return types;}, {}));

		return (
			<div className="team-edit-container">
				<div className="title-container">
					<Link key="backButton" className="arrow" to="/">{svgs.arrowLeft()}</Link>
					<div key="teamName" className="team-name">{this.props.team.name}</div>
				</div>
				{Object.keys(shared.consts.positionTypes)
					.map(type => shared.consts.positionTypes[type])
					.map(type =>
					<GroupTable
						key={type}
						positionType={type}
						players={playersGrouped[type]}
						totals={playingTotals[type]}
						onTogglePlayerPlaying={player => this.props.onTogglePlayerPlaying(this.props.team, player)}
						onEditPlayer={player => this.props.history.push(`/player/${player.uniqueId}`)}
						/>
				)}
			</div>
		);
	}
}

TeamEditClass.propTypes = {
	// which team is being edited, will be undefined if going to straight to editor before router pulls in correct team
	team: PropTypes.object,
};

const TeamEdit = withRouter(connect(
	state => state,
	dispatch => {
		return {
			onTogglePlayerPlaying: (team, player) => dispatch({type: reducers.ACTION_TYPES.TOGGLE_PLAYER_PLAYING, payload: {team: team, player: player}}),
		}
	},
)(TeamEditClass));

export default TeamEdit;
