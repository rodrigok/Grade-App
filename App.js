import React from 'react';
import { ApolloProvider, graphql } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';

import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Text, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native';

import {
	List,
	Badge
} from 'antd-mobile-rn';

const httpLink = new HttpLink({
	uri: 'http://localhost:3000/graphql'
});

// 3
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


class Content extends React.Component {
	renderItems() {
		const { data: { grades } } = this.props;

		return grades.map((grade) => {
			const odd = grade.semester % 2 !== 0;

			return (
				<List.Item key={grade._id} arrow='down' multipleLine onClick={() => {}}>
					<View style={{ flexDirection: 'row' }}>
						<View style={[styles.badge, { backgroundColor: odd ? '#EEE' : '#AAA' }]}>
							<Text style={{ color: odd ? '#888' : '#FFF' }}>{`${ grade.semester }º`}</Text>
						</View>
						<Text>
							{grade.name}
						</Text>
					</View>
					{/* <List.Item.Brief>{grade.code}</List.Item.Brief> */}
				</List.Item>
			);
		});
	}

	render() {
		const { data: { loading, error } } = this.props;
		if (error) {
			return alert(error);
		}

		if (loading) {
			return <Text>Loading</Text>;
		}

		return (
			<ScrollView>
				<List renderHeader={() => 'Subtitle'} className='my-list'>
					{this.renderItems()}
				</List>
			</ScrollView>
		);
	}
}

Content = graphql(gql`
	query {
		courses {
			name
		}
		grades (course: "SI") {
			_id
			credit
			workload
			code
			name
			semester
			description
			requirement {
				_id
				semester
				code
				name
			}
		}
	}
`)(Content);

export default class App extends React.Component {
	render() {
		return (
			<ApolloProvider client={client}>
				<SafeAreaView style={styles.safeArea}>
					<Content />
				</SafeAreaView>
			</ApolloProvider>
		);
	}
}
