import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import Icon from 'react-native-vector-icons/FontAwesome';


import { signIn } from '../utils';


import { List, InputItem, Button, WhiteSpace } from 'antd-mobile-rn';
import { Text, View } from 'react-native';

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

	onFacebook = () => {
		LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends']).then((result) => {
			if (!result.isCancelled) {
				AccessToken.getCurrentAccessToken().then((data) => {
					// this.setState({ log: {
					// 	result,
					// 	accessToken: data.accessToken.toString()
					// } });

					this.props.loginWithFacebook({
						variables: {
							accessToken: data.accessToken.toString()
						}
					}).then(async({ data: { loginWithFacebook: { token } } }) => {
						await signIn(token);
						this.props.screenProps.changeLoginState(true);
					}).catch((...args) => {
						this.setState({ log: args });
					});
				});
			}
		}, function(error) {
			alert(`Login failed with error: ${ error.message }`);
		});
	}

	render() {
		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>
				<Button
					type='primary'
					onClick={this.onFacebook}
					style={{
						borderRadius: 0,
						backgroundColor: '#466BAE'
					}}
				>
					<Icon name='facebook-square' size={20} color='#fff' />  Entrar com Facebook
				</Button>
				<WhiteSpace size='xl'/>
				<Text
					style={{
						color: '#888',
						textAlign: 'center'
					}}
				>ou</Text>
				<WhiteSpace size='xl'/>
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
