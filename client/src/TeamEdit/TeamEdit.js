import React from "react";
import {Link} from "react-router-dom";
import svgs from "../SVGs";
import shared from "../Shared";
import GroupTable from "./GroupTable";

class TeamEdit extends React.Component {
	render() {
		if (!this.props.team) {
			return null;
		}

		this.props.team.players.sort((a, b) => shared.funcs.positionSortOrder(a.position) - shared.funcs.positionSortOrder(b.position));
		const playersGrouped = this.props.team.players.reduce((groups, player) => {
			groups[shared.funcs.positionType(player.position)].push(player);
			return groups;
		}, Object.keys(shared.consts.positionTypes).reduce((types, type) => {types[shared.consts.positionTypes[type]] = []; return types;}, {}));

		return (
			<div className="teamEditContainer">
				<Link key="backButton" className="arrow" to="/">{svgs.arrowLeft()}</Link>
				<div key="teamName" className="teamName">{this.props.team.name}</div>
				{Object.keys(shared.consts.positionTypes).map(type => <GroupTable key={type} positionType={shared.consts.positionTypes[type]} players={playersGrouped[shared.consts.positionTypes[type]]}/>)}
			</div>
		);
	}
}

TeamEdit.propTypes = {};

export default TeamEdit;