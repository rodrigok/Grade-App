import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SafeAreaView, StyleSheet } from 'react-native';
import Grade from './views/Grade';

const httpLink = new HttpLink({
	// uri: 'http://localhost:3000/graphql'
	uri: 'http://192.168.1.16:3000/graphql'
});

const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache()
});

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F5F5F9'
	},
	badge: {
		backgroundColor: '#EEE',
		borderRadius: 5,
		overflow: 'hidden',
		paddingHorizontal: 3,
		paddingVertical: 1,
		marginRight: 8
	}
});

export default class App extends React.Component {
	render() {
		return (
			<ApolloProvider client={client}>
				<SafeAreaView style={styles.safeArea}>
					<Grade />
				</SafeAreaView>
			</ApolloProvider>
		);
	}
}
