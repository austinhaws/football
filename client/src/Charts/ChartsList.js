import React from "react";
import charts from "../Game/RollChart";
import {Link} from "react-router-dom";

class ChartsList extends React.Component {

	render() {
		return (
			<div className="charts-list">
				<ul>
					{Object.keys(charts.charts).map(chartKey =>
						<li key={chartKey}>
							<Link to={`/charts/chart/${chartKey}`}>{chartKey}</Link> - {charts.charts[chartKey].description}
							</li>)}
				</ul>
			</div>
		);
	}
}

export default ChartsList;
