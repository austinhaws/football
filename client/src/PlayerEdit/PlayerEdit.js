import React from "react";
import {Link} from "react-router-dom";
import svgs from "../SVGs";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import reducers from "../Reducers";
import shared from "../Shared";

class PlayerEditClass extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			player: shared.funcs.getPlayerByUniqueId(props.playerUniqueId),
		};
	}

	componentDidMount() {
		this.props.setPlayerEditing(this.props.routePlayerUniqueId);
	}

	savePlayer() {
		let team = undefined;
		const props = this.props;
		// find the team the player belongs to and update the player's information
		this.props.teams.forEach(realTeam => {
			const player = realTeam.players.find(teamPlayer => teamPlayer.uniqueId === props.editingPlayer.uniqueId);
			if (player) {
				Object.keys(player).forEach(key => player[key] = props.editingPlayer[key]);
				team = realTeam;
			}
		});

		// save the team with the updated player
		shared.funcs.saveTeam(team);
	}

	render() {
		if (!this.props.editingPlayer) {
			return false;
		}
		return (
			<div className="team-edit-container">
				<div className="title-container">
					<Link key="backButton" className="arrow" to="#" onClick={this.props.history.goBack}>{svgs.arrowLeft()}</Link>
					<div key="teamName" className="team-name">{this.props.editingPlayer.uniqueId}</div>
				</div>
				<div className="player-edit">
					{
						Object.keys(this.props.editingPlayer)
							.filter(key => !['uniqueId', 'playing'].includes(key))
							.map(
							field => (
								<div key={field} className="player-field">
									<div className="player-field-label">
										<label htmlFor={field}>{field}</label>
									</div>
									<div className="player-field-input">
										<input
											type="text"
											id={field}
											value={this.props.editingPlayer[field]}
											onChange={event => this.props.playerFieldChanged(field, field === 'position' ? event.target.value : parseInt(event.target.value, 10))}
										/>
									</div>
								</div>
							)
						)
					}
					<div key="buttons" className="player-field buttons">
						<button onClick={this.savePlayer.bind(this)}>Save</button>
					</div>
				</div>
			</div>
		);
	}
}

PlayerEditClass.propTypes = {
	// the id is in the parameter to load this component, but the teams are not yet loaded, so store the id and load the actual player after teams loaded
	routePlayerUniqueId: PropTypes.string.isRequired,

	// the player being edited
	editingPlayer: PropTypes.object,
	// all the teams from the store, used when saving a player, actually saves the whole team
	teams: PropTypes.array,

	// from router
	history: PropTypes.object.isRequired,
};

const PlayerEdit = withRouter(connect(
	state => state,
	dispatch => {
		return {
			playerFieldChanged: (field, value) => dispatch({type: reducers.ACTION_TYPES.PLAYER_FIELD_CHANGED, payload: {field: field, value: field === 'position' ? value : parseIntToBlank(value, 10)}}),
			setPlayerEditing: playerUniqueId => dispatch({type: reducers.ACTION_TYPES.SET_EDITING_PLAYER_ID, payload: playerUniqueId}),
		}
	},
)(PlayerEditClass));

function parseIntToBlank(value) {
	const result = parseInt(value, 10);
	return isNaN(result) ? '' : result;
}

export default withRouter(PlayerEdit);
