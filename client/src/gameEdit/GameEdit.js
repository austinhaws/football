import React from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router";
import PropTypes from "prop-types";
import shared from "../Shared";
import {Button, InputInformation} from "dts-react-common";
import reducers from "../Reducers";
import store from "../Store";
import Conference from "../bracket/Conference";

class GameEditClass extends React.Component {
	constructor(props) {
		super(props);

		if (!this.props.tournament) {
			shared.funcs.getCurrentTournament(this.setupGameEdit.bind(this));
		} else {
			this.setupGameEdit();
		}
	}

	setupGameEdit() {
		store.dispatch({type: reducers.ACTION_TYPES.GAME_EDIT.SET_GAME_EDIT, payload: {conference: this.props.conference, round: this.props.round, gameNumber: this.props.gameNumber}});
	}

	editField(field, value) {
		this.props.changeGameField(this.props.conference, this.props.round, this.props.gameNumber, field, value);
	}

	saveGame() {
		// save to server
		shared.funcs.ajax('POST', 'game/save', this.props.gameEdit, tournament => store.dispatch({type: reducers.ACTION_TYPES.SET_TOURNAMENT, payload: tournament}), true);
	}

	render() {
		if (!this.props.gameEdit.game) {
			return false;
		}

		const gameInfo = {
			conference: this.props.conference,
			round: this.props.round,
			gameNumber: this.props.gameNumber,
		};
		const numGamesInRound = (this.props.conference === Conference.CONFERENCES.FINALS ? ['1', '0'] : ['63', '15', '7', '3', '1', '0'])[this.props.round];
		const game = this.props.gameEdit.game;

		const team1 = shared.funcs.getTeam(game.topTeamId);
		const team2 = shared.funcs.getTeam(game.bottomTeamId);

		// get teams from previous round
		// show teams and information
		return (
			<div className="editorContainer">
				<div className="inputs">
					<div key="title" className="title">{`${this.props.tournament.conferences[gameInfo.conference].name} - Round ${gameInfo.round - 1} - Game ${parseInt(gameInfo.gameNumber, 10) + 1}`}</div>
				</div>

				<div className="inputColumns">
					<div className="inputColumn">
						<div className="teamName">{`${team1.name} (${team1.rank})`}</div>
						<div className="inputGroup">
							<div className="label">Roll</div>
							<div className="input">{this.props.tournament.rolls[team1.rank]}</div>
						</div>
						<div className="inputGroup">
							<div className="label">Roll Result</div>
							<div className="input"><input type="text" className="dataFont" value={game.topTeamScore ? game.topTeamScore : ''} onChange={e => this.editField('topTeamScore', e.target.value)}/></div>
						</div>
						<div className="inputGroup">
							<div className="label">Who Rolled</div>
							<div className="input"><input type="text" className="dataFont" value={game.topTeamRoller ? game.topTeamRoller : ''} onChange={e => this.editField('topTeamRoller', e.target.value)}/></div>
						</div>
						<div className="inputGroup buttons">
							<Button
								label="Winner"
								color={game.topTeamId === game.winningTeamId ? Button.BACKGROUND_COLOR.GREEN_LIGHTTONE : Button.BACKGROUND_COLOR.LIGHT_GRAY}
								size={InputInformation.SIZE_SMALL}
								clickedCallback={() => this.editField('winningTeamId', game.topTeamId)}/>
						</div>
					</div>

					<div className="inputColumn">
						<div className="teamName">{`${team2.name} (${team2.rank})`}</div>
						<div className="inputGroup">
							<div className="label">Roll</div>
							<div className="input">{this.props.tournament.rolls[team2.rank]}</div>
						</div>
						<div className="inputGroup">
							<div className="label">Roll Result</div>
							<div className="input"><input type="text" className="dataFont" value={game.bottomTeamScore ? game.bottomTeamScore : ''} onChange={e => this.editField('bottomTeamScore', e.target.value)}/></div>
						</div>
						<div className="inputGroup">
							<div className="label">Who Rolled</div>
							<div className="input"><input type="text" className="dataFont" value={game.bottomTeamRoller ? game.bottomTeamRoller : ''} onChange={e => this.editField('bottomTeamRoller', e.target.value)}/></div>
						</div>
						<div className="inputGroup buttons">
							<Button
								label="Winner"
								color={game.bottomTeamId === game.winningTeamId ? Button.BACKGROUND_COLOR.GREEN_LIGHTTONE : Button.BACKGROUND_COLOR.LIGHT_GRAY}
								size={InputInformation.SIZE_SMALL}
								clickedCallback={() => this.editField('winningTeamId', game.bottomTeamId)}/>
						</div>
					</div>
				</div>

				<div className="inputs">
					<div className="inputGroup">
						<div className="label">Points Gained</div>
						<div className="input"><input type="text" className="dataFont" value={game.pointsGained ? game.pointsGained : ''} onChange={e => this.editField('pointsGained', e.target.value)}/></div>
					</div>
				</div>

				<Route render={({history}) => (
					<div className="buttonContainer">
						<Button key="previous" label="Previous" clickedCallback={() => history.push(`/realBracket/game/${this.props.conference}/${this.props.round}/${parseInt(this.props.gameNumber, 10) - 1}`)} color={Button.BACKGROUND_COLOR.MEDIUM_GRAY} size={InputInformation.SIZE_SMALL} disabled={this.props.gameNumber === '0'}/>
						<Button key="cancel" label="Cancel" clickedCallback={() => history.push('/realBracket')} color={Button.BACKGROUND_COLOR.BLUE_LIGHTTONE} size={InputInformation.SIZE_SMALL}/>
						<Button key="save" label="Save" clickedCallback={this.saveGame.bind(this)} color={Button.BACKGROUND_COLOR.GREEN_LIGHTTONE} size={InputInformation.SIZE_SMALL}/>
						<Button key="next" label="Next" clickedCallback={() => history.push(`/realBracket/game/${this.props.conference}/${this.props.round}/${parseInt(this.props.gameNumber, 10) + 1}`)} color={Button.BACKGROUND_COLOR.MEDIUM_GRAY} size={InputInformation.SIZE_SMALL} disabled={this.props.gameNumber === numGamesInRound}/>
					</div>
				)}/>
			</div>
		);
	}
}

GameEditClass.propTypes = {
	// uses Conference.CONFERENCES... constants
	conference: PropTypes.string.isRequired,
	// which round of the conference
	round: PropTypes.number.isRequired,
	// which game in that round
	gameNumber: PropTypes.number.isRequired,

	// == redux store == //
	// the game editor information: {game, conference, round, gameNumber}
	gameEdit: PropTypes.object.isRequired,
};

// withRouter required so that routing isn't blocked: https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
const GameEdit = withRouter(connect(
	state => state,
	dispatch => {
		return {
			changeGameField: (conference, round, gameNumber, field, value) => dispatch({type: reducers.ACTION_TYPES.GAME_EDIT.UPDATE_GAME_FIELD, payload: {
				conference: conference,
				round: round,
				gameNumber: gameNumber,
				field: field,
				value: value,
			}}),
		}
	},
)(GameEditClass));

export default GameEdit;
