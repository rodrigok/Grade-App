import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { concat, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getToken } from './utils';
import Grade from './views/Grade';
import Calendar from './views/Calendar';
import Login from './views/Login';
import Register from './views/Register';
import Course from './views/Course';

const host = 'localhost';

const httpLink = new HttpLink({
	uri: `http://${ host }:3000/graphql`
});

const authLink = setContext(async(_, { headers }) => {
	const token = await getToken();

	if (!token) {
		return {
			headers
		};
	}

	return {
		headers: {
			...headers,
			authorization: `Bearer ${ token }`
		}
	};
});

let token = '';
getToken().then(tokenValue => token = tokenValue);

const wsLink = new WebSocketLink({
	uri: `ws://${ host }:5000/subscriptions`,
	options: {
		reconnect: true,
		lazy: true,
		connectionParams: () => {
			return {
				authToken: token
			};
		}
	}
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
	cache: new InMemoryCache()
});

const AuthStack = createStackNavigator({
	Login: { screen: Login, navigationOptions: { headerTitle: 'Login' } },
	Register: { screen: Register, navigationOptions: { headerTitle: 'Register' } }
});

const CourseStack = createStackNavigator({
	Course: { screen: Course, navigationOptions: { headerTitle: 'Curso' } }
});

const LoggedInStack = createBottomTabNavigator({
	Grade: { screen: createStackNavigator({ Grade }), navigationOptions: { title: 'Meu Currículo' } },
	Calendar: { screen: createStackNavigator({ Calendar }), navigationOptions: { title: 'Calendário' } }
}, {
	navigationOptions: ({ navigation }) => ({
		tabBarIcon: ({ tintColor }) => {
			const { routeName } = navigation.state;

			let iconName;

			switch (routeName) {
				case 'Calendar':
					iconName = 'ios-calendar';
					break;
				case 'Grade':
					iconName = 'ios-list-box';
					break;
			}

			return <Ionicons name={iconName} size={25} color={tintColor} />;
		}
	}),
	tabBarOptions: {
		activeTintColor: 'tomato',
		inactiveTintColor: 'gray'
	}
});


export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loggedIn: false
		};

		getToken().then((token) => {
			this.setState({
				loggedIn: token != null
			});
		});
	}

	handleChangeLoginState = (loggedIn = false) => {
		this.setState({ loggedIn });
	};

	handleChangeCourseState = (hasCourse = false) => {
		this.setState({ hasCourse });
	};

	renderScreen() {
		if (this.state.loggedIn) {
			return this.state.hasCourse
				? <LoggedInStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />
				: <CourseStack screenProps={{ changeCourseState: this.handleChangeCourseState }} />;
		}

		return <AuthStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />;
	}

	render() {
		return (
			<ApolloProvider client={client}>
				{this.renderScreen()}
			</ApolloProvider>
		);
	}
}
