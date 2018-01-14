import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import PropTypes from "prop-types";
import shared from "../Shared";
import Bracket from "../bracket/Bracket";
import reducers from "../Reducers";

class PrintBracketsClass extends React.Component {

	constructor(props) {
		super(props);
		if (!this.props.people) {
			shared.funcs.getPeople(this.props.setPeople);
		}
	}


	componentDidMount() {
		if (!this.props.allBrackets) {
			shared.funcs.getAllBrackets();
		}
	}

	render() {
		return !this.props.allBrackets ? null :
			<div className="printableBrackets">
				{this.props.allBrackets.map(bracket =>
					<div className="printableBracket print-page-break" key={bracket._id}>
						<Bracket realBracket={false} myPicks={bracket} printing={true} tournament={this.props.tournament} people={this.props.people}/>
					</div>
				)}
			</div>
		;
	}
}

PrintBracketsClass.propTypes = {
	// == STORE == //
	// all the brackets for the tournament
	allBrackets: PropTypes.array,

	// the current tournament being ran
	tournament: PropTypes.object,

	// people who have an account
	people: PropTypes.array,
};

// withRouter required so that routing isn't blocked: https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
const PrintBrackets = withRouter(connect(
	state => state,
	dispatch => {
		return {
			setPeople: people => dispatch({type: reducers.ACTION_TYPES.SET_PEOPLE, payload: people}),
		}
	},
)(PrintBracketsClass));

export default PrintBrackets;
