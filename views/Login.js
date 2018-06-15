import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { signIn } from '../utils';

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

	render() {
		return (
			<React.Fragment>
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

export default graphql(gql`
	mutation login($email: String! $password: String!) {
		login(email: $email, password: $password) {
			success
			token
		}
	}
`, { name: 'login' })(Login);
