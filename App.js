import PushNotification from 'react-native-push-notification';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { ApolloProvider, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

import { getToken, signOut } from './utils';
import Grade from './views/Grade';
import Calendar from './views/Calendar';
import Login from './views/Login';
import Register from './views/Register';
import Profile from './views/Profile';
import Course from './views/Course';
import Password from './views/Password';
import { client } from './connection';
import './push/push';

const AuthStack = createStackNavigator({
	Login: { screen: Login, navigationOptions: { headerTitle: 'Entrar' } },
	Register: { screen: Register, navigationOptions: { headerTitle: 'Cadstrar' } },
});

const CourseStack = createStackNavigator({
	Course: { screen: Course, navigationOptions: { headerTitle: 'Curso' } },
});

const LoggedInStack = createBottomTabNavigator({
	Grade: { screen: createStackNavigator({ Grade }), navigationOptions: { tabBarLabel: 'Meu Currículo' } },
	Calendar: { screen: createStackNavigator({ Calendar }), navigationOptions: { tabBarLabel: 'Calendário' } },
	Profile: { screen: createStackNavigator({ Profile, Password, Course }), navigationOptions: { tabBarLabel: 'Perfil' } },
}, {
	navigationOptions: ({ navigation }) => ({
		propTypes: {
			tintColor: PropTypes.string,
		},
		tabBarIcon: ({ tintColor }) => { //eslint-disable-line
			const { routeName } = navigation.state;

			let iconName;

			switch (routeName) {
				case 'Calendar':
					iconName = 'ios-calendar';
					break;
				case 'Grade':
					iconName = 'ios-list-box';
					break;
				case 'Profile':
					iconName = 'ios-person';
					break;
			}

			return <Ionicons name={iconName} size={25} color={tintColor} />;
		},
	}),
	tabBarOptions: {
		activeTintColor: 'tomato',
		inactiveTintColor: 'gray',
	},
});

let pushPermissionResquested = false;

class MainScreen extends React.Component {
	static propTypes = {
		data: PropTypes.any,
	}

	constructor(props) {
		super(props);

		this.state = {
			loggedIn: false,
		};

		getToken().then((token) => {
			this.setState({
				loggedIn: token != null,
			});
		});
	}

	handleChangeLoginState = (loggedIn = false) => {
		const { data } = this.props;
		data.refetch().then(() => {
			this.setState({ loggedIn });
		});
	};

	render() {
		const { data: { user, loading } } = this.props;

		if (loading) {
			return <ActivityIndicator size='large' color='#0000ff' />;
		}

		if (!user && this.state.loggedIn === true) {
			signOut().then(() => {
				this.setState({
					loggedIn: false,
				});
			});
			return <ActivityIndicator size='large' color='#0000ff' />;
		}

		if (this.state.loggedIn) {
			if (!pushPermissionResquested) {
				PushNotification.requestPermissions();
				pushPermissionResquested = true;
			}
			return user.profile && user.profile.course && user.profile.course._id
				? <LoggedInStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />
				: <CourseStack />;
		}

		return <AuthStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />;
	}
}

const MainScreenWithData = graphql(gql`
	query {
		user {
			_id
			profile {
				course {
					_id
				}
			}
		}
	}
`)(MainScreen);

export default class App extends React.Component {
	render() {
		return (
			<ApolloProvider client={client}>
				<MainScreenWithData />
			</ApolloProvider>
		);
	}
}
