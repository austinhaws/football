import React from "react";
import {Link} from "react-router-dom";
import svgs from "../SVGs";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import PropTypes from "prop-types";

class PlayerEditClass extends React.Component {

	render() {
		if (!this.props.player) {
			return null;
		}

		return (
			<div className="team-edit-container">
				<div className="title-container">
					<Link key="backButton" className="arrow" to="#" onClick={this.props.history.goBack}>{svgs.arrowLeft()}</Link>
					<div key="teamName" className="team-name">{this.props.player.uniqueId}</div>
				</div>
			</div>
		);
	}
}

PlayerEditClass.propTypes = {
	// which player is being edited, will be undefined if going to straight to editor before router pulls in correct player
	player: PropTypes.object,

	// from router
	history: PropTypes.object.isRequired,
};

const PlayerEdit = withRouter(connect(
	state => state,
	dispatch => {
		return {
		}
	},
)(PlayerEditClass));

export default withRouter(PlayerEdit);
