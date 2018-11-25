import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { concat, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { getToken } from './utils';

// Local
// import { Platform } from 'react-native';
// const host = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
// const httpLinkUri = `http://${ host }:3000/graphql`;
// const wsLinkUri = `ws://${ host }:5000/subscriptions`;

// Remote
const host = 'faccat.minhagrade.com';
const httpLinkUri = `https://${ host }/graphql`;
const wsLinkUri = `wss://${ host }/subscriptions`;

const httpLink = new HttpLink({
	uri: httpLinkUri,
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
	uri: wsLinkUri,
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

export const client = new ApolloClient({
	link: concat(authLink, link),
	cache: new InMemoryCache(),
});
