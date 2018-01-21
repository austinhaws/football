import React from "react";
import {Link} from "react-router-dom";
import svgs from "../SVGs";
import {Route, Switch, withRouter} from "react-router";
import ChartsList from "./ChartsList";
import ChartDetail from "./ChartDetail";

class Charts extends React.Component {

	render() {
		return (
			<div className="charts-container">
				<Link key="backButton" className="arrow" to="#" onClick={this.props.history.goBack}>{svgs.arrowLeft()}</Link>
				<Switch>
					<Route path="/charts/chart/:chartName" render={props => <ChartDetail chartName={props.match.params.chartName}/>}/>
					<Route component={ChartsList}/>}/>
				</Switch>
			</div>
		);
	}
}

Charts.propTypes = {
};

export default withRouter(Charts);
