import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import { signOut } from '../utils';

import { Button, WhiteSpace } from 'antd-mobile-rn';
import { Text } from 'react-native';

class Profile extends React.Component {
	static propTypes = {
		navigation: PropTypes.any,
		data: PropTypes.any,
		screenProps: PropTypes.any,
	}

	static navigationOptions = () => ({
		title: 'Perfil',
	});

	changeCourse = () => {
		const { navigation, data } = this.props;
		navigation.navigate('Course', { data });
	}

	changePassword = () => {
		const { navigation } = this.props;
		navigation.navigate('Password');
	}

	render() {
		const { data: { loading, user }, screenProps } = this.props;

		if (loading) {
			return <Text>Loading...</Text>;
		}

		const textStyle = {
			color: '#666',
			textAlign: 'center',
		};

		const nameStyle = {
			...textStyle,
			fontSize: 40,
			fontWeight: 'bold',
		};

		const emailStyle = {
			...textStyle,
			fontSize: 14,
		};

		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>

				<Text style={nameStyle}>{user.profile && user.profile.name}</Text>
				<Text style={emailStyle}>{user.mainEmail && user.mainEmail.address}</Text>
				<Text style={emailStyle}>{user.profile && user.profile.course && user.profile.course.name}</Text>

				<WhiteSpace size='xl'/>

				<Button style={{ borderRadius: 0 }} onClick={this.changeCourse}>
					Alterar curso
				</Button>
				<Button style={{ borderRadius: 0 }} onClick={this.changePassword}>
					Alterar senha
				</Button>

				<WhiteSpace size='xl'/>

				<Button
					type='warning'
					style={{ borderRadius: 0 }}
					onClick={async() => {
						await signOut();
						screenProps.changeLoginState(false);
					}}
				>Sair</Button>
			</React.Fragment>
		);
	}
}

export default graphql(gql`
	query {
		user {
			_id
			mainEmail {
				address
			}
			profile {
				name
				course {
					_id
					name
				}
			}
		}
	}
`)(Profile);
