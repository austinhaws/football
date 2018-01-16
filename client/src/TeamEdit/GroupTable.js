import React from "react";
import PropTypes from "prop-types";
import shared from "../Shared";

class GroupTable extends React.Component {
	render() {
		return (
			<div className="teamEditContainer">
				<div key="offenseLabel">{this.props.positionType}</div>
				<table key="playerTable">
					<thead>
					<tr>
						<th>{/*checkbox*/}</th>
						<th>Position</th>
						<th>Injury</th>
						{
							this.props.positionType === shared.consts.positionTypes.special ?
							<th>Skill</th> :
							[<th key="run">Run</th>, <th key="pass">Pass</th>]
						}
						<th>{/*delete*/}</th>
					</tr>
					</thead>
					<tbody>
					{this.props.players.map((player, i) => {
						return (
							<tr key={i}>
								<td><input type="checkbox" checked={player.playing}/> </td>
								<td>{player.position}</td>
								<td>{player.injured}</td>
								{
									this.props.positionType === shared.consts.positionTypes.special ?
										<th>{player.special}</th> :
										[<th key="run">{player.run}</th>, <th key="pass">{player.pass}</th>]
								}
								<td>delete</td>
							</tr>
						);
					})}
					</tbody>
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