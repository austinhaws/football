import React from "react";
import PropTypes from "prop-types";
import shared from "../Shared";

class GroupTable extends React.Component {
	render() {
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
							this.props.positionType === shared.consts.positionTypes.special ?
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
								<td>{player.injured ? false : <input type="checkbox" checked={player.playing}/>}</td>
								<td>{player.position}</td>
								<td>{player.injured}</td>
								{
									this.props.positionType === shared.consts.positionTypes.special ?
										[<td key="skill">{player.special}</td>, <td key="pass"/>] :
										[<td key="run">{player.run}</td>, <td key="pass">{player.pass}</td>]
								}
							</tr>
						);
					})}
					</tbody>
					<tfoot>
						<tr>
							<td>total playing / total possible slots</td>
							<td>{/*position*/}</td>
							<td>{/*injury*/}</td>
							<td>Playign Run/Special total</td>
							<td>Playign Pass total</td>
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
};

export default GroupTable;