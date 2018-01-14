import React from "react";
import PropTypes from "prop-types";
import reducers from "../../Reducers";
import shared from "../../Shared";
import DragTeam from "./DragTeam";
import {DropTarget} from 'react-dnd';
import {ItemTypes} from "../Constants";
import Conference from "../Conference";
import store from '../../Store';

const gameTarget = {
	drop(props, monitor) {
		shared.funcs.pickGameForward(monitor.getItem(), props, picks => store.dispatch({type: reducers.ACTION_TYPES.SET_MY_PICKS, payload: picks}));
	},

	canDrop(targetProps, targetMonitor) {
		let canMove = false;
		const dragTeam = targetMonitor.getItem();
		// (conference has to match) or (drag is not finals and target is finals)
		if (targetProps.conference === Conference.CONFERENCES.FINALS && dragTeam.conference !== Conference.CONFERENCES.FINALS) {
			if (targetProps.round === 1) {
				if (targetProps.gameNumber === 0) {
					// round 1 game 1 comes from top left and bottom left
					canMove = dragTeam.conference === Conference.CONFERENCES.TOP_LEFT || dragTeam.conference === Conference.CONFERENCES.BOTTOM_LEFT;
				} else {
					// round 1 game 2 comes from top right and bottom right
					canMove = dragTeam.conference === Conference.CONFERENCES.TOP_RIGHT || dragTeam.conference === Conference.CONFERENCES.BOTTOM_RIGHT;
				}
			} else {
				// round 2 game 1 comes from both sides (finals game)
				canMove = true;
			}
		} else if (targetProps.conference === dragTeam.conference) {
			if (targetProps.round > dragTeam.round) {
				const loopTeam = Object.assign({}, dragTeam);

				for (; loopTeam.round < targetProps.round; loopTeam.round++) {
					loopTeam.gameNumber = Math.floor(loopTeam.gameNumber / 2);
				}
				canMove = targetProps.gameNumber === loopTeam.gameNumber;
			}
		}
		return canMove;
	}

};

function collectDrop(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop(),
	};
}

// drag and drop game for editing your bracket
class DragGame extends React.Component {
	render() {
		const realGame = this.props.tournament.conferences[this.props.conference].rounds[this.props.round][this.props.gameNumber];

		const pickedTeam = this.props.game.winningTeamId ? shared.funcs.getTeam(this.props.game.winningTeamId) : false;
		let team = false;
		if (this.props.game.teamId) {
			team = shared.funcs.getTeam(this.props.game.teamId);
		} else if (pickedTeam) {
			team = pickedTeam;
		}
		const teamProps = team ? {
			conference: this.props.conference,
			round: this.props.round,
			gameNumber: this.props.gameNumber,
			team: team,
		} : false;

		if (teamProps && realGame.winningTeamId) {
			teamProps.isCorrect = realGame.winningTeamId === teamProps.team.teamId;
		}

		const { connectDropTarget, isOver, canDrop} = this.props;
		return connectDropTarget(
			<div className={`dragGameContainer ${team.name ? 'game' : ''}`}>
				<div className={`dragTeamsContainer ${team.name ? '' : 'game'} ${(isOver && canDrop) ? 'dragOver' : ''} ${teamProps ? 'picked' : 'not-picked'}`}>
					{teamProps ? <DragTeam {...teamProps}/> : false}
				</div>
			</div>
		);
	}
}

DragGame.propTypes = {
	// which conference this game is in (Conference.CONFERENCES... constants)
	conference: PropTypes.string.isRequired,
	// which round is the game in
	round: PropTypes.number.isRequired,
	// which game number in the group of games is this?
	gameNumber: PropTypes.number.isRequired,

	// the current tournament information
	tournament: PropTypes.object.isRequired,

	// information about this game (first round games have different information)
	game: PropTypes.object.isRequired,

	// -- DRAGGING -- //
	connectDropTarget: PropTypes.func.isRequired,
	isOver: PropTypes.bool.isRequired
};

export default DropTarget(ItemTypes.TEAM, gameTarget, collectDrop)(DragGame);
