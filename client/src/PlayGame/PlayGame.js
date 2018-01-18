import React from "react";
import PropTypes from "prop-types";
import PlayableTeam from "./PlayableTeam";
import shared from "../Shared";


class PlayGame extends React.Component {
	render() {
		let leftTeam = shared.funcs.getTeam(this.props.selectedTeams.left);
		let rightTeam = shared.funcs.getTeam(this.props.selectedTeams.right);

		return (
			<div className="playGameContainer">
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
		);
	}
}

PlayGame.propTypes = {
	// the team to show, false to have an empty menu
	selectedTeams: PropTypes.object,

	setSelectedTeam: PropTypes.func.isRequired,
};

export default PlayGame;