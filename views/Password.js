import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { List, Button, WhiteSpace, InputItem } from 'antd-mobile-rn';
import { Text, ActivityIndicator } from 'react-native';

class Password extends React.Component {
	state = {
		error: {}
	}

	onChange = (field) => (value) => {
		switch (field) {
			case 'currentPassword':
				this.setState({
					error: {
						...this.state.error,
						[field]: !/[^\s]+/.test(value)
					}
				});
				break;
			case 'password':
				this.setState({
					error: {
						...this.state.error,
						[field]: value.length === 0,
						passwordConfirmation: this.state.passwordConfirmation && value !== this.state.passwordConfirmation
					}
				});
				break;
			case 'passwordConfirmation':
				this.setState({
					error: {
						...this.state.error,
						[field]: value.length === 0 || value !== this.state.password
					}
				});
				break;
		}

		this.setState({
			[field]: value
		});
	}

	onSave = () => {
		const { setPassword, navigation } = this.props;

		setPassword({
			variables: {
				currentPassword: this.state.currentPassword,
				password: this.state.password
			}
		}).then(async({ data: { setPassword } }) => {
			if (setPassword === false) {
				return alert('error');
			}
			navigation.goBack();
		}).catch((...args) => {
			this.setState({ log: args });
		});
	}

	isSubmitDisabled = () => {
		const { data: { user } } = this.props;

		return (user.hasPassword && !this.state.currentPassword)
		|| !this.state.password
		|| !this.state.passwordConfirmation
		|| this.state.error.currentPassword
		|| this.state.error.password
		|| this.state.error.passwordConfirmation;
	}

	render() {
		const { data: { user, loading } } = this.props;

		if (loading) {
			return <ActivityIndicator size='large' color='#0000ff' />;
		}

		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>
				<List>
					{ user.hasPassword &&
						<InputItem
							type='password'
							placeholder='Senha atual'
							error={this.state.error.currentPassword}
							onChange={this.onChange('currentPassword')}
							value={this.state.currentPassword}
						></InputItem>
					}
					<InputItem
						type='password'
						placeholder='Nova senha'
						error={this.state.error.password}
						onChange={this.onChange('password')}
						value={this.state.password}
					></InputItem>
					<InputItem
						type='password'
						placeholder='Confirmar nova senha'
						error={this.state.error.passwordConfirmation}
						onChange={this.onChange('passwordConfirmation')}
						value={this.state.passwordConfirmation}
					></InputItem>
				</List>
				<WhiteSpace size='xl'/>
				<Button type='primary' style={{ borderRadius: 0 }} disabled={this.isSubmitDisabled()} onClick={this.onSave}>
					Alterar senha
				</Button>
				<WhiteSpace />
				<Text>{JSON.stringify(this.state.log)}</Text>
			</React.Fragment>
		);
	}
}

export default compose(
	graphql(gql`
		query {
			user {
				_id
				hasPassword
			}
		}
	`),
	graphql(gql`
		mutation setPassword($currentPassword: String $password: String!) {
			setPassword(currentPassword: $currentPassword password: $password) {
				success
			}
		}
	`, { name: 'setPassword' })
)(Password);
