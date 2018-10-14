import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import { signIn } from '../utils';

import { List, InputItem, Button, WhiteSpace, Picker } from 'antd-mobile-rn';
import { Text } from 'react-native';

const rfcMailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


class PickerInput extends React.Component {
	static propTypes = {
		placeholder: PropTypes.any,
		extra: PropTypes.any,
		onClick: PropTypes.any,
	}

	render() {
		const { placeholder, extra, onClick } = this.props;
		let value = placeholder;
		const styles = {
			fontSize: 17,
		};


		if (extra !== 'PLACEHOLDER') {
			value = extra;
		} else {
			styles.color = '#C7C7CC';
		}

		return (
			<List.Item onClick={onClick}>
				<Text style={styles}>
					{value}
				</Text>
			</List.Item>
		);
	}
}

class Register extends React.Component {
	static propTypes = {
		signup: PropTypes.any,
		data: PropTypes.any,
		login: PropTypes.any,
	}

	state = {
		error: {},
	}

	onChange = (field) => (value) => {
		switch (field) {
			case 'name':
				this.setState({
					error: {
						...this.state.error,
						[field]: !/[^\s]+/.test(value),
					},
				});
				break;
			case 'email':
				this.setState({
					error: {
						...this.state.error,
						[field]: !rfcMailPattern.test(value),
					},
				});
				break;
			case 'password':
				this.setState({
					error: {
						...this.state.error,
						[field]: value.length === 0,
						passwordConfirmation: this.state.passwordConfirmation && value !== this.state.passwordConfirmation,
					},
				});
				break;
			case 'passwordConfirmation':
				this.setState({
					error: {
						...this.state.error,
						[field]: value.length === 0 || value !== this.state.password,
					},
				});
				break;
		}

		this.setState({
			[field]: value,
		});
	}

	onRegister = () => {
		this.props.signup({
			variables: {
				name: this.state.name,
				email: this.state.email,
				password: this.state.password,
				course: this.state.course[0],
			},
		}).then(async({ data: { signup } }) => {
			if (signup.success === false) {
				return alert('error');
			}

			this.props.login({
				variables: {
					email: this.state.email,
					password: this.state.password,
				},
			}).then(async({ data: { login: { token } } }) => {
				await signIn(token);
				this.props.screenProps.changeLoginState(true);
			}).catch((...args) => {
				this.setState({ log: args });
			});
		}).catch((...args) => {
			this.setState({ log: args });
		});
	}

	isSubmitDisabled = () => !this.state.name
		|| !this.state.email
		|| !this.state.password
		|| !this.state.passwordConfirmation
		|| !this.state.course
		|| this.state.error.name
		|| this.state.error.email
		|| this.state.error.password
		|| this.state.error.passwordConfirmation

	render() {
		const { data: { courses, loading } } = this.props;

		if (loading) {
			return <Text>Loading...</Text>;
		}

		const pickerData = [
			courses.map((c) => ({ label: c.name, value: c._id })),
		];

		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>
				<List>
					<InputItem
						type='text'
						placeholder='Nome'
						autoCapitalize='sentences'
						error={this.state.error.name}
						onChange={this.onChange('name')}
						value={this.state.name}
					></InputItem>
					<InputItem
						type='email'
						placeholder='Email'
						autoCapitalize='none'
						error={this.state.error.email}
						onChange={this.onChange('email')}
						value={this.state.email}
					></InputItem>
					<Picker
						data={pickerData}
						title='Curso'
						cascade={false}
						extra='PLACEHOLDER'
						value={this.state.course}
						okText='Selecionar'
						dismissText='Cancelar'
						onChange={this.onChange('course')}
						onOk={this.onChange('course')}
					>
						<PickerInput placeholder='Curso'></PickerInput>
					</Picker>
					<InputItem
						type='password'
						placeholder='Senha'
						error={this.state.error.password}
						onChange={this.onChange('password')}
						value={this.state.password}
					></InputItem>
					<InputItem
						type='password'
						placeholder='Confirmar senha'
						error={this.state.error.passwordConfirmation}
						onChange={this.onChange('passwordConfirmation')}
						value={this.state.passwordConfirmation}
					></InputItem>
				</List>
				<WhiteSpace size='xl'/>
				<Button type='primary' style={{ borderRadius: 0 }} disabled={this.isSubmitDisabled()} onClick={this.onRegister}>
					Cadastrar
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
			courses {
				_id
				name
			}
		}
	`),
	graphql(gql`
		mutation signup($name: String! $email: String! $course: String! $password: String!) {
			signup(name: $name, email: $email, course: $course, password: $password) {
				success
			}
		}
	`, { name: 'signup' }),
	graphql(gql`
		mutation login($email: String! $password: String!) {
			login(email: $email, password: $password) {
				success
				token
			}
		}
	`, { name: 'login' })
)(Register);
