import React from "react";
import PropTypes from "prop-types";
import Conference from "./Conference";
import RealGame from "./game/RealGame";
import shared from "../Shared";
import DragGame from "./game/DragGame";
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class Bracket extends React.Component {
	// get game properties object to send to a RealGame or DragGame component
	static getGameProps(bracket, conference, round, gameNumber) {
		return {
			game: bracket[conference].rounds[round][gameNumber],
			conference: conference,
			round: round,
			gameNumber: gameNumber,
		};
	}

	getPersonName(personId) {
		const person = this.props.people.find(p => p.uid === personId);
		return `${person.firstName} ${person.lastName}`;
	}

	render() {
		// if printing, people are required
		// tournament is always required
		// if not editing a real bracket then need the picks to show
		if ((this.props.printing && !this.props.people) || !this.props.tournament || (!this.props.realBracket && !this.props.myPicks)) {
			return false;
		}
		const useBracket = this.props.realBracket ? this.props.tournament.conferences : this.props.myPicks;
		const finalsGame10 = Bracket.getGameProps(useBracket, Conference.CONFERENCES.FINALS, 1, 0);
		const finalsGame11 = Bracket.getGameProps(useBracket, Conference.CONFERENCES.FINALS, 1, 1);
		const finalsGame20 = Bracket.getGameProps(useBracket, Conference.CONFERENCES.FINALS, 2, 0);

		let picksRemainingDiv = false;
		if (!this.props.realBracket) {
			// get all the conferences
			const missing = [
				Conference.CONFERENCES.BOTTOM_LEFT,
				Conference.CONFERENCES.BOTTOM_RIGHT,
				Conference.CONFERENCES.FINALS,
				Conference.CONFERENCES.TOP_LEFT,
				Conference.CONFERENCES.TOP_RIGHT,
			]
				// get all the rounds for each conference
				.map(conference => {
					// get all the games for each round; rounds is a map so have to use keys
					const rounds = useBracket[conference].rounds;
					const roundKeys = Object.keys(rounds);
					return roundKeys
						// convert to round array of games
						.map(roundKey => rounds[roundKey])
						// put all the games together
						.reduce((games, round) => games.concat(round), [])
						// filter out games chosen so only non-chosen remain
						.filter(game => game.teamId === undefined && game.winningTeamId !== 0 && !game.winningTeamId)
						// total number of missing picks
						.length;

				})
				// total missing games
				.reduce((total, conferenceTotal) => total + conferenceTotal, 0);

			picksRemainingDiv = missing ? (
				<div className={['picksRemaining', missing ? 'missingPicks' : ''].join(' ')} key="picksRemaining">
					{missing} of 63 Picks Remaining
				</div>
			) : false;
		}
		return (
			<div className="bracketTopContainer">
				{picksRemainingDiv}
				{!this.props.printing ? false : <div className="playerName" key="playerName">{this.getPersonName(this.props.myPicks.uid)}</div>}
				<div className="roundTitles" key="titles">
					{
						[1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]
							.map((r, i) => {
								const round = shared.funcs.getRoundInfo(r);
								const roundName = round.length ? round[0].name : '';
								const roundDate = round.length ? round[0].date.split('T')[0] : String.fromCharCode(0x200b);

								return (
									<div className="roundTitle" key={`roundTitle${roundName}${i}`}>
										<div key="round">{roundName}</div>
										<div key="date">{roundDate}</div>
									</div>
								)
							})
					}
				</div>
				<div className="bracketContainer">
					<div className="bracketContainerLeft" key="left">
						<Conference conference={Conference.CONFERENCES.TOP_LEFT} realBracket={this.props.realBracket} myPicks={this.props.myPicks} tournament={this.props.tournament}/>
						<Conference conference={Conference.CONFERENCES.BOTTOM_LEFT} realBracket={this.props.realBracket} myPicks={this.props.myPicks} tournament={this.props.tournament}/>
					</div>
					<div className="bracketContainerMiddle" key="middle">
						<div className="conferenceContainer">
							<div className="roundsContainer">
								{this.props.realBracket ? <RealGame {...finalsGame10}/> : <DragGame {...finalsGame10} tournament={this.props.tournament}/>}
								{this.props.realBracket ? <RealGame {...finalsGame20}/> : <DragGame {...finalsGame20} tournament={this.props.tournament}/>}
								{this.props.realBracket ? <RealGame {...finalsGame11}/> : <DragGame {...finalsGame11} tournament={this.props.tournament}/>}
							</div>
						</div>
					</div>
					<div className="bracketContainerRight" key="right">
						<Conference conference={Conference.CONFERENCES.TOP_RIGHT} realBracket={this.props.realBracket} myPicks={this.props.myPicks} tournament={this.props.tournament}/>
						<Conference conference={Conference.CONFERENCES.BOTTOM_RIGHT} realBracket={this.props.realBracket} myPicks={this.props.myPicks} tournament={this.props.tournament}/>
					</div>
				</div>
			</div>
		);
	}
}

Bracket.defaultProps = {
	printing: false,
};

Bracket.propTypes = {
	// == Props == //
	// true if this the real bracket to edit for played games, false if someone is editing their own bracket
	realBracket: PropTypes.bool.isRequired,

	// if doing my bracket then this is their picks, otherwise it's the real bracket
	myPicks: PropTypes.object,

	// is this bracket being printed (shows name and a few other changes)
	printing: PropTypes.bool,

	// the tournament
	tournament: PropTypes.object,

	// all the known people
	people: PropTypes.array,
};

export default DragDropContext(HTML5Backend)(Bracket);
