import React from "react";
import PropTypes from "prop-types";
import PlayableTeam from "./PlayableTeam";
import shared from "../Shared";
import game from "../Game/Game";
import {Link} from "react-router-dom";


class PlayGame extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			output: [],
		}
	}
	doRoll(teamName, positionType, playType) {

		const teams = [shared.funcs.getTeam(this.props.selectedTeams.left), shared.funcs.getTeam(this.props.selectedTeams.right)];
		// put offensive team first
		if (teams[positionType === shared.consts.positionTypes.offense ? 0 : 1].name !== teamName) {
			teams.reverse();
		}
		// since offense is first, then get bonuses with offense first
		const bonuses = teams
			.map(team => shared.funcs.totalPlayingByPositionType(team.players))
			.map((total, i) => total[i === 0 ? shared.consts.positionTypes.offense : shared.consts.positionTypes.defense][playType === shared.consts.playTypes.pass ? 'totalPass' : 'totalRun']);

		// offense is first, so pass in team/bonuses
		this.setState({output: game.rollTeamDown(bonuses[0], teams[0], bonuses[1], teams[1], shared.consts.positionTypes.offense === positionType, playType).output});
	}

	render() {
		let leftTeam = shared.funcs.getTeam(this.props.selectedTeams.left);
		let rightTeam = shared.funcs.getTeam(this.props.selectedTeams.right);

		return (
			<div>
				<div className="playGameContainer">
					<div className="teamContainer">
						<PlayableTeam
							side="left"
							team={leftTeam ? leftTeam : {}}
							onTeamChanged={teamName => this.props.setSelectedTeam('left', teamName)}
							onRoll={this.doRoll.bind(this)}
							showRollButtons={!!(leftTeam && rightTeam)}
						/>
					</div>
					<div className="outputContainer">
						{this.state.output.map((output, i) => <div key={i} className={output.cssClass}>{output.text}</div>)}
					</div>
					<div className="teamContainer">
						<PlayableTeam
							team={rightTeam ? rightTeam : {}}
							side="right"
							onTeamChanged={teamName => this.props.setSelectedTeam('right', teamName)}
							onRoll={this.doRoll.bind(this)}
							showRollButtons={!!(leftTeam && rightTeam)}
						/>
					</div>
				</div>
				<div className="playGameContainer bottom-buttons">
					<Link to={`/charts`}>Charts</Link>
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