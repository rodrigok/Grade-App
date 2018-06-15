import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getToken } from './utils';
import Grade from './views/Grade';
import Calendar from './views/Calendar';
import Login from './views/Login';
import Register from './views/Register';

const httpLink = new HttpLink({
	uri: 'http://localhost:3000/graphql'
	// uri: 'http://192.168.1.16:3000/graphql'
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

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache()
});

const AuthStack = createStackNavigator({
	Login: { screen: Login, navigationOptions: { headerTitle: 'Login' } },
	Register: { screen: Register, navigationOptions: { headerTitle: 'Register' } }
});

const LoggedInStack = createBottomTabNavigator({
	Calendar: { screen: createStackNavigator({ Calendar }), navigationOptions: { title: 'Calendário' } },
	Grade: { screen: createStackNavigator({ Grade }), navigationOptions: { title: 'Meu Currículo' } }
}, {
	navigationOptions: ({ navigation }) => ({
		tabBarIcon: ({ focused, tintColor }) => {
			const { routeName } = navigation.state;

			let iconName;

			switch (routeName) {
				case 'Calendar':
					iconName = `ios-calendar${ focused ? '' : '-outline' }`;
					break;
				case 'Grade':
					iconName = `ios-list-box${ focused ? '' : '-outline' }`;
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
			loggedIn: true
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

	renderScreen() {
		return this.state.loggedIn ?
			<LoggedInStack screenProps={{ changeLoginState: this.handleChangeLoginState }} /> :
			<AuthStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />;
	}

	render() {
		return (
			<ApolloProvider client={client}>
				{this.renderScreen()}
			</ApolloProvider>
		);
	}
}
