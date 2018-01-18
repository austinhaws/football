import React from "react";
import PropTypes from "prop-types";
import shared from "../Shared";

class GroupTable extends React.Component {
	render() {
		const isSpecial = this.props.positionType === shared.consts.positionTypes.special;
		return (
			<div className="group-table-container">
				<div key="offenseLabel" className="group-type-label">{this.props.positionType}</div>
				<table key="playerTable">
					<thead>
					<tr>
						<th>Playing</th>
						<th>Position</th>
						<th>Injury</th>
						{
							isSpecial ?
							[<th key="run">Skill</th>, <th key="pass"/>] :
							[<th key="run">Run</th>, <th key="pass">Pass</th>]
						}
					</tr>
					</thead>
					<tbody>
					{this.props.players.map((player, i) => {
						return (
							<tr key={i} className={[
								player.injured ? 'injured' : '',
								player.playing ? 'playing' : 'not-playing',
							].join(' ')}>
								<td>{player.injured ? false : <input type="checkbox" checked={player.playing} onChange={() => this.props.onTogglePlayerPlaying( player)}/>}</td>
								<td>{player.position}</td>
								<td>{player.injured}</td>
								{
									isSpecial ?
										[<td key="skill">{player.special}</td>, <td key="pass"/>] :
										[<td key="run">{player.run}</td>, <td key="pass">{player.pass}</td>]
								}
							</tr>
						);
					})}
					</tbody>
					<tfoot>
						<tr>
							<td>{this.props.totals.totalPlaying} / {this.props.totals.totalPositions}</td>
							<td>{/*position*/}</td>
							<td>{/*injury*/}</td>
							<td>{isSpecial ? this.props.totals.totalSpecial : this.props.totals.totalRun}</td>
							<td>{isSpecial ? false : this.props.totals.totalPass}</td>
						</tr>
					</tfoot>
				</table>

			</div>
		);
	}
}

GroupTable.propTypes = {
	positionType: PropTypes.string.isRequired,
	players: PropTypes.array.isRequired,
	// result totals: {#playing/#possible, playingRunTotal, playingPassTotal}
	totals: PropTypes.object.isRequired,

	// a player's "playing" checkbox is clicked
	onTogglePlayerPlaying: PropTypes.func.isRequired,
};

export default GroupTable;