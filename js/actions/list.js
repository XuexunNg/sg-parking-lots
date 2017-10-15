	
import type { Action } from './types';

export const SET_INDEX = 'SET_INDEX';
export const FILTER_LIST = 'FILTER_LIST';
export const FETCH_LOTAVAILABLE = 'FETCH_LOTAVAILABLE';
export const IS_FETCHING = 'IS_FETCHING';

export function setIndex(index:number):Action {
  return {
    type: SET_INDEX,
    payload: index,
  };
}

export function filterList(x:number, y:number, text:string, json):Action {
  return {
    type: FILTER_LIST,
    x: x,
    y:y,
    text:text,
    carparks:json.items[0].carpark_data
  };
}

export function isFetching(showLoading=true):Action {
  console.log(showLoading)
  return {
    type: IS_FETCHING,
    showLoading: showLoading
  };
}

export function fetchLotAvailable(x:number, y:number, text:string=''):Action{
  let dateTime = new Date().toISOString()
  //let dateTime = "2017-09-20T11:05:02.411Z"
	return dispatch => {
		return fetch('https://api.data.gov.sg/v1/transport/carpark-availability?date_time='+dateTime,
      {  headers: {
       'api-key': 'fZhYIn2gGDG2zXVku2FUK2HdNmQHGvsM'
      }
    })
		.then(response => response.json())
		.then(json=>dispatch(filterList(x, y, text, json)))
	};
  }
