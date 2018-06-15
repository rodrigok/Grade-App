import { AsyncStorage } from 'react-native';

const AUTH_TOKEN = 'AUTH_TOKEN';

let token;

export const getToken = async() => {
	if (token) {
		return Promise.resolve(token);
	}

	token = await AsyncStorage.getItem(AUTH_TOKEN);
	return token;
};

export const signIn = async(newToken) => {
	token = newToken;
	return await AsyncStorage.setItem(AUTH_TOKEN, newToken);
};

export const signOut = async() => {
	token = undefined;
	return await AsyncStorage.removeItem(AUTH_TOKEN);
};
