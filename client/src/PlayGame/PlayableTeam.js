import React from "react";
import PropTypes from "prop-types";
import store from '../Store';
import svgs from '../SVGs';
import {Link} from "react-router-dom";


class PlayableTeam extends React.Component {
	render() {
		return (
			<div className={`playable-team ${this.props.side}`}>
				<div className="name-row">
					<div className="arrow">
						{this.props.team.name ? <Link to={`team/${this.props.team.name}`}>{svgs.arrowLeft()}</Link> : false}
					</div>
					<div>
						<select value={this.props.team ? this.props.team.name : ''} onChange={event => this.props.onTeamChanged(event.target.value)}>
							<option key="blank" value={''}>Select a Team</option>
							{store.getState().teams.map(team => <option key={team.name} value={team.name}>{team.name}</option>)}
						</select>
					</div>
				</div>
				<div className="offense-defense">
					{this.props.side === 'right' ? 'Defense' : 'Offense'}
				</div>
				<div>
					<div><button>Roll w/ Bonus</button>Pass +10</div>
					<div><button>Roll w/ Bonus</button>Run +13</div>
				</div>
				<div className="offense-defense">
					{this.props.side === 'right' ? 'Offense' : 'Defense'}
				</div>
				<div>
					<div><button>Roll w/ Bonus</button>Pass +10</div>
					<div><button>Roll w/ Bonus</button>Run +13</div>
				</div>
			</div>
		);
	}
}

PlayableTeam.propTypes = {
	// the team to show, false to have an empty menu
	team: PropTypes.object,

	side: PropTypes.string.isRequired,

	// the selected team was changed
	onTeamChanged: PropTypes.func.isRequired,
};

export default PlayableTeam;