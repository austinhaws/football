import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import shared from "../Shared";

// ==== setup react container for the report ==== //
class HomeClass extends React.Component {
	render() {
		return (
			<div id="dateContainer">
				{
					this.props.tournament ?
						shared.vars.upcomingDates.map((d, i) => {
							return (
								<div className={`dateRow ${this.props.home.nextDateIndex === i ? 'currentDate' : ''} ${d.afterToday ? '' : 'oldDate'}`} key={d.name}>
									<div className="label">{d.name}:</div>
									<div className="date">{d.momentDate.format('dddd, MMMM Do YYYY')}</div>
								</div>
							);
						})
						: false
				}
			</div>
		);
	}
}

HomeClass.propTypes = {
	// see state for the fields in this object
	home: PropTypes.object.isRequired,

	// if tournament not set then will ajax for it
	tournament: PropTypes.object,
};

const Home = withRouter(connect(
	state => state,
	dispatch => {return {}},
)(HomeClass));

export default Home;
