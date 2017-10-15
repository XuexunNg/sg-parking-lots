import type { Action } from "../actions/types";
import carParkList from "../data/carparks.js"
import { SET_INDEX, FILTER_LIST, FETCH_LOTAVAILABLE, IS_FETCHING } from "../actions/list";
import proj4 from 'proj4';

export type State = {
  list: string
};

const initialState = {
  list: [{
    "car_park_no": "--",
    "address": "--",
    "x_coord": "--",
    "y_coord": "--",
    "car_park_type": "--",
    "type_of_parking_system": "--",
    "short_term_parking": "--",
    "free_parking": "--",
    "night_parking": "--",
    "distance": 0
  }],
  selectedIndex: undefined,
  showLoading: true
};


export default function (state: State = initialState, action: Action): State {
  console.log(action.type)
  switch (action.type) {

    case SET_INDEX:

    case IS_FETCHING:
      return {
        ...state,
        showLoading: action.showLoading
      };

    case FILTER_LIST:

      let distanceLimit = 1000
      let nearbyCarPark;
      if (action.text == '') {
        nearbyCarPark = carParkList.list.filter((item) => 
        item.x_coord >= action.x - distanceLimit &&
        item.x_coord <= action.x + distanceLimit &&
        item.y_coord >= action.y - distanceLimit &&
        item.y_coord <= action.y + distanceLimit)
      } else {
        nearbyCarPark = carParkList.list.filter((item) => 
        item.address.toLowerCase().indexOf(action.text.toLowerCase()) > -1 )
      }

      var calculateDistance = (carpark_lat, carpark_long, user_lat, user_long) => {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((user_lat - carpark_lat) * p) / 2 +
          c(carpark_lat * p) * c(user_lat * p) *
          (1 - c((user_long - carpark_long) * p)) / 2;

        var d = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        return Math.round(d * 1000) /1000;
      }


      nearbyCarPark.map((item) => {

        let googleProjection = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]';
        let sgProjection = 'PROJCS["SVY21 / Singapore TM",GEOGCS["SVY21",DATUM["D_",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",1.366666666666667],PARAMETER["central_meridian",103.8333333333333],PARAMETER["scale_factor",1],PARAMETER["false_easting",28001.642],PARAMETER["false_northing",38744.572],UNIT["Meter",1]]';

        let [carpark_long, carpark_lat] = (proj4(sgProjection, googleProjection, [item.x_coord, item.y_coord]))
        let [user_long, user_lat] = (proj4(sgProjection, googleProjection, [action.x, action.y]))

        let distance = calculateDistance(carpark_lat, carpark_long, user_lat, user_long)
        
        let carpark_info = action.carparks.filter(c => c.carpark_number == item.car_park_no)

        if (carpark_info[0] != undefined) {
          item.lots_available = carpark_info[0].carpark_info[0].lots_available
        } else {
          item.lots_available = "--"
        }

        item.distance = distance
        item.user_latitude = user_lat
        item.user_longtitude = user_long
        item.carpark_latitude = carpark_lat
        item.carpark_longtitude = carpark_long

      })


      return {
        list: nearbyCarPark.sort(function (a, b) {
          return a.distance - b.distance
        })
        , showLoading: false
      }

    default:
      return state;
  }
}
