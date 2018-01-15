import React from "react";
import store from "./Store";
import reducers from "./Reducers";
import $ from "jquery";
import jsLogging from 'dts-js-logging';

const shared = {
	funcs: {
		/**
		 * get the csrf object from the state taken in to account that the token may not yet be fetched
		 * @return csrf object or false if not yet gotten
		 */
		getCsrf: () => {
			const csrf = store.getState().csrf;
			return (csrf && csrf.name) ? csrf : false;
		},
		/**
		 * adds csrf to data packet. useful for ajax calls.
		 * @param data your data to which the csrf name/token will be added. can be false/null/blank
		 */
		csrf: data => {
			const csrf = shared.funcs.getCsrf();
			return csrf ? Object.assign({[csrf.name]: csrf.token}, data ? data : {}) : data;
		},

		/**
		 * add csrf token to url
		 *
		 * @param url the url
		 * @return {string} url w/ token
		 */
		csrfUrl: url => {
			const csrf = shared.funcs.getCsrf();
			return csrf ? `${url}${url.includes('?') ? '&' : '?'}${csrf.name}=${csrf.token}` : url;
		},

		startAjax: () => store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: true,}),
		stopAjax: () => store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: false}),
		ajaxFail: () => false /*console.error(arguments)*/,

		/**
		 * make an ajax call; takes care of ajaxing flag setting and error logging
		 *
		 * @param url - the url to call
		 * @param method - POST / GET
		 * @param data - js object of the data to send
		 * @param callback - function to get the results of the ajax call
		 * @param isRequestBody if true then sends as json string instead of data packet
		 * @param isRefreshCsrf is this the csrf fetch call? all other calls will be queued for later
		 * @param doNotUseCsrf if true then the csrf is not sent in the call; not sure who wants this but go for it
		 */
		ajax: (method, url, data, callback, isRequestBody, isRefreshCsrf, doNotUseCsrf) => {
			shared.funcs.startAjax();

			$.ajax({
				type: method,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				url: shared.vars.urlBase + (doNotUseCsrf ? url : shared.funcs.csrfUrl(url)),
				data: doNotUseCsrf ? data : (isRequestBody ? JSON.stringify(shared.funcs.csrf(data)) : shared.funcs.csrf(data)),
				cache: false,
				success: callback,
				error: result => {
					console.error('ajax error', result);
					shared.funcs.ajaxFail();
				},
				complete: shared.funcs.stopAjax,
				// set withCredentials to true for cross-domain requests
				xhrFields: {
					withCredentials: true
				},
			});
		},

		// get csrf token for posting
		refreshCsrf: callback => {
			shared.funcs.ajax('GET', 'csrf/current', {},
				csrf => {
					jsLogging({url: 'log/error.json', csrfName: csrf.parameterName, csrfToken: csrf.token,});

					store.dispatch({type: reducers.ACTION_TYPES.SET_CSRF, payload: {name: csrf.csrfName, token: csrf.csrfToken}});
					if (callback) {
						callback();
					}
				}, false, true);
		},

		// who is currently logged in?
		getTeams: () => shared.funcs.ajax('GET', 'team/all', {}, teams => store.dispatch({type: reducers.ACTION_TYPES.SET_TEAMS, payload: teams})),

		// app has started, get some basic information
		startup: () => {
			shared.funcs.getTeams();
		},

		getTeam: teamName => {
			const matches = store.getState().teams.filter(team => team.name === teamName);
			return (matches && matches.length) ? matches[0] : false;
		}
	},
	vars: {
		// remote webservice - dev
		urlBase: 'http://localhost:8080/football/',
		// local static urls
		// urlBase: 'http://localhost:8080/',
	},
};

export default shared;