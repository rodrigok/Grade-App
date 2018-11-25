import PushNotification from 'react-native-push-notification';
import { client } from '../connection';
import gql from 'graphql-tag';

const configPushGql = gql`
	mutation setPushToken($token: String!){
		setPushToken(token: $token)
	}
`;

PushNotification.configure({

	// (optional) Called when Token is generated (iOS and Android)
	onRegister({ token }) {
		console.log('TOKEN:', token);

		client.mutate({
			variables: { token },
			mutation: configPushGql,

		})
			.then((result) => { console.log(result); })
			.catch((error) => { console.log(error); });
	},

	// // (required) Called when a remote or local notification is opened or received
	// onNotification(notification) {
	// 	console.log('NOTIFICATION:', notification);
	// 	alert(notification);

	// 	// process the notification

	// 	// required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
	// 	notification.finish(PushNotificationIOS.FetchResult.NoData);
	// },

	// ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
	senderID: '846878579002',

	// // IOS ONLY (optional): default: all - Permissions to register.
	permissions: {
		alert: true,
		badge: true,
		sound: true,
	},

	// // Should the initial notification be popped automatically
	// // default: true
	popInitialNotification: true,

	// /**
	//  * (optional) default: true
	//  * - Specified if permissions (ios) and token (android and ios) will requested or not,
	//  * - if not, you must call PushNotificationsHandler.requestPermissions() later
	//  */
	requestPermissions: false,
});
