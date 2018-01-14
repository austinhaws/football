import React from "react";
import PropTypes from "prop-types";
import Round from "./Round";
import store from "../Store";


class Conference extends React.Component {

	constructor(props) {
		super(props);
		this.conference = store.getState().tournament.conferences[this.props.conference];
	}

	render() {
		return (
			<div className="conferenceContainer">
				<div className="conferenceTitle">{this.conference.name}</div>
				<div className="roundsContainer">
					{Object.keys(this.conference.rounds).map(i =>
						<Round
							realBracket={this.props.realBracket}
							conference={this.props.conference}
							round={parseInt(i, 10)}
							key={`round-${i}`}
							games={this.props.realBracket ? this.conference.rounds[i] : this.props.myPicks[this.props.conference].rounds[i]}
							tournament={this.props.tournament}
						/>)}
				</div>
			</div>
		);
	}
}

Conference.propTypes = {
	// === PROPS === //
	// true if this the real bracket to edit for played games, false if someone is editing their own bracket
	realBracket: PropTypes.bool.isRequired,
	// which conference is this? use Conference.CONFERENCES... constants
	conference: PropTypes.string.isRequired,
	// mypicks if editing your own bracket
	myPicks: PropTypes.object,
	// the tournament
	tournament: PropTypes.object.isRequired,
};

Conference.CONFERENCES = {
	"TOP_LEFT": "topLeft",
	"BOTTOM_LEFT": "bottomLeft",
	"TOP_RIGHT": "topRight",
	"BOTTOM_RIGHT": "bottomRight",
	"FINALS": "finals",
};

export default Conference;