import React from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { ApolloProvider, graphql } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { concat, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
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

const host = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

const httpLink = new HttpLink({
	uri: `http://${ host }:3000/graphql`,
});

const authLink = setContext(async(_, { headers }) => {
	const token = await getToken();

	if (!token) {
		return {
			headers,
		};
	}

	return {
		headers: {
			...headers,
			authorization: `Bearer ${ token }`,
		},
	};
});

let token = '';
getToken().then((tokenValue) => token = tokenValue);

const wsLink = new WebSocketLink({
	uri: `ws://${ host }:5000/subscriptions`,
	options: {
		reconnect: true,
		lazy: true,
		connectionParams: () => ({
			authToken: token,
		}),
	},
});

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query);
		return kind === 'OperationDefinition' && operation === 'subscription';
	},
	wsLink,
	httpLink,
);

const client = new ApolloClient({
	link: concat(authLink, link),
	cache: new InMemoryCache(),
});

const AuthStack = createStackNavigator({
	Login: { screen: Login, navigationOptions: { headerTitle: 'Login' } },
	Register: { screen: Register, navigationOptions: { headerTitle: 'Register' } },
});

const CourseStack = createStackNavigator({
	Course: { screen: Course, navigationOptions: { headerTitle: 'Curso' } },
});

const LoggedInStack = createBottomTabNavigator({
	Grade: { screen: createStackNavigator({ Grade }) },
	Calendar: { screen: createStackNavigator({ Calendar }) },
	Profile: { screen: createStackNavigator({ Profile, Password, Course }) },
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
