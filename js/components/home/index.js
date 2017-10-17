import React, { Component } from "react";
import { TouchableOpacity, FlatList, View } from "react-native";
import { connect } from "react-redux";
import BlankPage2 from "../blankPage2";
import DrawBar from "../DrawBar";
import { DrawerNavigator, NavigationActions } from "react-navigation";
import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Icon,
  Left,
  Body,
  Right,
  Card,
  CardItem,
  Thumbnail, 
  Toast,
  Item,
  Input
} from "native-base";
import { Grid, Row } from "react-native-easy-grid";
import { setIndex, fetchLotAvailable, isFetching } from "../../actions/list";
import { openDrawer } from "../../actions/drawer";
import styles from "./styles";
import proj4 from 'proj4';
import getDirections from 'react-native-google-maps-directions';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }


  static navigationOptions = {
    header: null
  };

  static propTypes = {
    name: React.PropTypes.string,
    setIndex: React.PropTypes.func,
    list: React.PropTypes.arrayOf(React.PropTypes.object),
    openDrawer: React.PropTypes.func
  };

  newPage(index) {
    this.props.setIndex(index);
    Actions.blankPage();
  }

  onRefreshData() {
    this.props.isFetching()
    
    navigator.geolocation.getCurrentPosition(
      (position) => {

        var firstProjection = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]';
        var secondProjection = 'PROJCS["SVY21 / Singapore TM",GEOGCS["SVY21",DATUM["D_",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",1.366666666666667],PARAMETER["central_meridian",103.8333333333333],PARAMETER["scale_factor",1],PARAMETER["false_easting",28001.642],PARAMETER["false_northing",38744.572],UNIT["Meter",1]]';

        var [x, y] = (proj4(firstProjection, secondProjection, [position.coords.longitude, position.coords.latitude]))
        this.props.fetchLotAvailable(x, y, this.state.text)

        
      },
      (error) => {Toast.show({
        text: 'Unable to obtain your location. Please try again',
        position: 'bottom',
        buttonText: 'Okay',
        duration:5000
      })
      this.props.isFetching(false)
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
    );
  }

  componentDidMount() {
    this.onRefreshData()
  }

  handleGetDirections = (user_lat, user_long, carpark_lat, carpark_long) => {
    console.log(user_lat, user_long, carpark_lat, carpark_long)
    const data = {
       source: {
        latitude: user_lat,
        longitude: user_long
      },
      destination: {
        latitude: carpark_lat,
        longitude: carpark_long
      },
      params: [
        {
          key: "dirflg",
          value: "w"
        }
      ]
    }
    getDirections(data)
  }

  keyExtractor = (item, index) => item.car_park_no

  render() {
    return (
      <Container style={styles.container}>
      <Header searchBar rounded>
      <Item>
        <Icon name="ios-search" />
        <Input placeholder="Search" 
        onChangeText={(text) => this.setState({text})}
        value={this.state.text}
        onSubmitEditing = {() => this.onRefreshData()}
         />
        <Icon name="md-car" />
      </Item>
      <Button transparent>
        <Text>Search</Text>
      </Button>
    </Header>

        <FlatList
          data={this.props.list}
          keyExtractor={this.keyExtractor}
          onRefresh={() => this.onRefreshData()}
          refreshing={this.props.showLoading}
          renderItem={({ item}) =>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor:'#fff', 
                padding:10, borderWidth:.3, borderColor:'#ccc' }} id={item.car_park_no}>
                  <View style={{ width: 90, height: 60 }}>
                    <TouchableOpacity
                      style={{
                        borderWidth: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        backgroundColor: '#FABD3B',
                        borderRadius: 50
                      }}
                      onPress={() => this.handleGetDirections(item.user_latitude, item.user_longtitude, 
                      item.carpark_latitude, item.carpark_longtitude)}
                    >
                      <Text style={styles.distance}>{item.distance}</Text>
                      <Text style={styles.distance_text}>km</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 250, height: 130 }}>
                      <Text style={styles.address}>{item.address}</Text>
                      <Text style={styles.car_park_type}>{item.car_park_type}</Text>
                      <Text>Lots available: {item.lots_available}</Text>
                      <Text style={{marginTop:5}}></Text>
                      <Text style={styles.detail}>TYPE: {item.type_of_parking_system}</Text>
                      <Text style={styles.detail}>FREE PARKING: {item.free_parking}</Text>
                      <Text style={styles.detail}>NIGHT PARKING: {item.night_parking}</Text>
                  </View>
                </View>
             
          }
        />


      </Container>
    );
  }
}

function bindAction(dispatch) {
  return {
    setIndex: index => dispatch(setIndex(index)),
    openDrawer: () => dispatch(openDrawer()),
    fetchLotAvailable: (x, y, text) => dispatch(fetchLotAvailable(x, y, text)),
    isFetching: (showLoading) => dispatch(isFetching(showLoading))

  };
}
const mapStateToProps = state => ({
  list: state.list.list,
  showLoading: state.list.showLoading
});

const HomeSwagger = connect(mapStateToProps, bindAction)(Home);
const DrawNav = DrawerNavigator(
  {
    Home: { screen: HomeSwagger },
    BlankPage2: { screen: BlankPage2 }
  },
  {
    contentComponent: props => <DrawBar {...props} />
  }
);
const DrawerNav = null;
DrawNav.navigationOptions = ({ navigation }) => {
  DrawerNav = navigation;
  return {
    header: null
  };
};
export default DrawNav;
