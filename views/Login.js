import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { signIn } from '../utils';

import { List, InputItem, Button, WhiteSpace, Text } from 'antd-mobile-rn';

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
						[field]: !/\@/.test(value)
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
			<List renderHeader={() => 'Login'}>
				<InputItem
					type='email'
					placeholder='email'
					autoCapitalize='none'
					error={this.state.error.email}
					onChange={this.onChange('email')}
					value={this.state.email}
				>Email</InputItem>
				<InputItem
					type='password'
					placeholder='senha'
					error={this.state.error.password}
					onChange={this.onChange('password')}
					value={this.state.password}
				>Senha</InputItem>
				<WhiteSpace />
				<Button type='primary' onClick={this.onLogin}>Login</Button>
				<Text>{JSON.stringify(this.state.log)}</Text>
			</List>
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
