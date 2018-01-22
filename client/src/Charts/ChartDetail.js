import React from "react";
import PropTypes from "prop-types";
import charts from "../Game/RollChart.js";
import clone from "clone";

class ChartDetail extends React.Component {
	constructor(props) {
		super(props);
		const chart = charts.charts[this.props.chartName];
		this.state = {
			parameterValues: chart.fields.reduce((values, field) => {
				values[field.var] = field.options[0];
				return values;
			}, {}),
			rollOutput: '',
		}
	}

	roll() {
		// get which chart is being used
		const chart = charts.charts[this.props.chartName];

		// get table based on parameters
		const table = chart.fields.reduce((table, field) => table[this.state.parameterValues[field.var]], chart.table);

		// roll the table
		const rollResult = charts.rollChart(table);
		this.setState(Object.assign(clone(this.state), {rollOutput: rollResult instanceof Object ? JSON.stringify(rollResult) : rollResult}));
	}

	changeParameter(fieldVar, value) {
		const state = clone(this.state);
		state.parameterValues[fieldVar] = value;
		this.setState(state);
	}

	render() {
		const chart = charts.charts[this.props.chartName];
		return (
			<div className="chart-detail">
				{this.props.chartName}
				<div key="chart" className="chart-details">
					<pre>{JSON.stringify(chart.table, undefined, 2)}</pre>
				</div>
				<div key="parameters" className="parameters">
					{
						chart.fields.map(field =>
							<div key={field.var} className="player-field">
								<div key="var" className="player-field-label">
									<label htmlFor={field.var}>{field.label}</label>
								</div>
								<div key="input" className="player-field-input">
									<select
										id={field.var}
										value={this.state.parameterValues[field.var]}
										onChange={event => this.changeParameter(field.var, event.target.value)}
									>
										{field.options.map(option =>
											<option key={option} value={option}>{option}</option>
										)}
									</select>
								</div>
							</div>
						)
					}
					<div>
						<button onClick={this.roll.bind(this)}>Roll</button>
					</div>
					<div>
						{this.state.rollOutput ? `Roll Result: ${this.state.rollOutput}` : undefined}
					</div>
				</div>

			</div>
		);
	}
}

ChartDetail.propTypes = {
	chartName: PropTypes.string.isRequired,
};

export default ChartDetail;
