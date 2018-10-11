import React from 'react';
import { graphql, compose } from 'react-apollo';
// import Expo from 'expo';
import gql from 'graphql-tag';

import { signIn } from '../utils';
// import { FBLoginButton } from '../components/FBLoginButton';


import { List, InputItem, Button, WhiteSpace, Text } from 'antd-mobile-rn';

const rfcMailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

class Login extends React.Component {
	state = {
		error: {}
	}

	onChange = (field) => (value) => {
		switch (field) {
			case 'email':
				this.setState({
					error: {
						...this.state.error,
						[field]: !rfcMailPattern.test(value)
					}
				});
				break;
			case 'password':
				this.setState({
					error: {
						...this.state.error,
						[field]: value.length === 0
					}
				});
				break;
		}

		this.setState({
			[field]: value
		});
	}

	onRegister = () => {
		const { navigation } = this.props;
		navigation.navigate('Register');
	}

	onLogin = () => {
		this.props.login({
			variables: {
				email: this.state.email,
				password: this.state.password
			}
		}).then(async({ data: { login: { token } } }) => {
			await signIn(token);
			this.props.screenProps.changeLoginState(true);
		}).catch((...args) => {
			this.setState({ log: args });
		});
	}

	onFacebook = async() => {
		// const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('185969382302390', {
		// 	permissions: ['public_profile', 'email', 'user_friends']
		// });
		// if (type === 'success') {
		// 	this.props.loginWithFacebook({
		// 		variables: {
		// 			accessToken: token
		// 		}
		// 	}).then(async({ data: { loginWithFacebook: { token } } }) => {
		// 		await signIn(token);
		// 		this.props.screenProps.changeLoginState(true);
		// 	}).catch((...args) => {
		// 		this.setState({ log: args });
		// 	});
		// }
	}

	render() {
		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>
				<Button type='ghost' style={{ borderRadius: 0, borderWidth: 0 }} onClick={this.onFacebook}>
					facebook
				</Button>
				<List>
					<InputItem
						type='email'
						placeholder='Email'
						autoCapitalize='none'
						error={this.state.error.email}
						onChange={this.onChange('email')}
						value={this.state.email}
					></InputItem>
					<InputItem
						type='password'
						placeholder='Senha'
						error={this.state.error.password}
						onChange={this.onChange('password')}
						value={this.state.password}
					></InputItem>
				</List>
				<WhiteSpace size='xl'/>
				<Button type='primary' style={{ borderRadius: 0 }} disabled={!this.state.email || !this.state.password || this.state.error.email || this.state.error.password} onClick={this.onLogin}>
					Entrar
				</Button>
				<WhiteSpace />
				<Button type='ghost' style={{ borderRadius: 0, borderWidth: 0 }} onClick={this.onRegister}>
					Registrar
				</Button>
				<Text>{JSON.stringify(this.state.log)}</Text>
			</React.Fragment>
		);
	}
}

export default compose(
	graphql(gql`
		mutation login($email: String! $password: String!) {
			login(email: $email, password: $password) {
				success
				token
			}
		}
	`, { name: 'login' }),
	graphql(gql`
		mutation loginWithFacebook($accessToken: String!) {
			loginWithFacebook(accessToken: $accessToken) {
				id
				token
				tokenExpires
			}
		}
	`, { name: 'loginWithFacebook' })
)(Login);
