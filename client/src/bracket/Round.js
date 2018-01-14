import React from "react";
import PropTypes from "prop-types";
import RealGame from "./game/RealGame";
import DragGame from "./game/DragGame";


class Round extends React.Component {
	render() {
		// show games: number of games based on the round
		return <div className="roundContainer">
			{this.props.games.map((g, i) => {
				const gameProps = {
					key: `${this.props.round}-${i}`,
					conference: this.props.conference,
					round: this.props.round,
					game: g,
					gameNumber: i,
				};
				return this.props.realBracket ? <RealGame {...gameProps}/> : <DragGame {...gameProps} tournament={this.props.tournament}/>;
			})}
		</div>;
	}
}

Round.propTypes = {
	// == PROPS == //
	// true if this the real bracket to edit for played games, false if someone is editing their own bracket
	realBracket: PropTypes.bool.isRequired,
	// in which conference contains this round
	conference: PropTypes.string.isRequired,
	// which round is being shown - determine show many games to show
	round: PropTypes.number.isRequired,
	// the games being played this round
	games: PropTypes.array.isRequired,
	// the tournament
	tournament: PropTypes.object.isRequired,
};

export default Round;