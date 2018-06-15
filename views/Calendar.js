import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { signOut } from '../utils';

import { Text, ScrollView, View, Button, RefreshControl } from 'react-native';

import {
	List
} from 'antd-mobile-rn';

const StatusColor = {
	doing: 'orange',
	done: 'lightgray',
	pending: '#444'
};

const StatusColorDetail = {
	doing: 'orange',
	done: 'lightgray',
	pending: '#888'
};

class Grade extends React.Component {
	static navigationOptions = ({ screenProps }) => {
		return {
			title: 'Calendário',
			headerRight: (
				<Button
					onPress={async() => {
						await signOut();
						screenProps.changeLoginState(false);
					}}
					title='Sair'
				/>
			)
		};
	};

	state = {
		refreshing: false,
		refetching: false
	}

	renderItems(items) {
		return items.map((item) => {
			const status = item.userStatus || 'pending';
			const style = {
				fontSize: 17,
				color: [StatusColor[status]]
			};
			const styleDetail = {
				color: [StatusColorDetail[status]]
			};
			return (
				<List.Item key={item._id} multipleLine>
					<Text style={style}>
						{item.grade.name}
					</Text>
					<List.Item.Brief style={styleDetail}>Interessados: {item.interested}</List.Item.Brief>
					{
						item.teacher && item.teacher.name ?
							<List.Item.Brief style={styleDetail}>Professor: {item.teacher.name}</List.Item.Brief>:
							<View></View>
					}
				</List.Item>
			);
		});
	}

	renderGroups() {
		const groups = {
			'EAD': { day: '0', shift: '0' },
			'Segunda - Manhã': { day: '2', shift: '1' },
			'Segunda - Tarde': { day: '2', shift: '2' },
			'Segunda - Noite': { day: '2', shift: '3' },
			'Segunda - Vespertino': { day: '2', shift: '5' },
			'Terça - Manhã': { day: '3', shift: '1' },
			'Terça - Tarde': { day: '3', shift: '2' },
			'Terça - Noite': { day: '3', shift: '3' },
			'Terça - Vespertino': { day: '3', shift: '5' },
			'Quarta - Manhã': { day: '4', shift: '1' },
			'Quarta - Tarde': { day: '4', shift: '2' },
			'Quarta - Noite': { day: '4', shift: '3' },
			'Quarta - Vespertino': { day: '4', shift: '5' },
			'Quinta - Manhã': { day: '5', shift: '1' },
			'Quinta - Tarde': { day: '5', shift: '2' },
			'Quinta - Noite': { day: '5', shift: '3' },
			'Quinta - Vespertino': { day: '5', shift: '5' },
			'Sexta - Manhã': { day: '6', shift: '1' },
			'Sexta - Tarde': { day: '6', shift: '2' },
			'Sexta - Noite': { day: '6', shift: '3' },
			'Sexta - Vespertino': { day: '6', shift: '5' },
			'Sábado - Manhã': { day: '7', shift: '1' },
			'Sábado - Tarde': { day: '7', shift: '2' },
			'Sábado - Noite': { day: '7', shift: '3' },
			'Sábado - Vespertino': { day: '7', shift: '5' }
		};

		const { data: { calendar } } = this.props;

		if (!calendar || !calendar.grade) {
			return;
		}

		return Object.entries(groups).map(([key, { day, shift }]) => {
			const items = calendar.grade.filter(g => g.day === day && g.shift === shift && g.grade.code);
			if (items.length) {
				return (
					<List key={key} renderHeader={() => key}>
						{this.renderItems(items)}
					</List>
				);
			}
		});
	}

	_onRefresh = () => {
		this.setState({
			refetching: true
		});

		this.props.data.refetch().then(() => {
			this.setState({
				refetching: false
			});
		});
	}

	render() {
		const { data: { loading, error } } = this.props;
		if (error) {
			return alert(error);
		}

		return (
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={loading || this.state.refetching}
						onRefresh={this._onRefresh}
					/>
				}
			>
				{this.renderGroups()}
			</ScrollView>
		);
	}
}

export default graphql(gql`
	query {
		calendar {
			_id
			grade {
				_id
				day
				shift
				interested
				teacher {
					name
				}
				userStatus
				userInterested
				grade {
					_id
					code
					name
				}
			}
		}
	}
`)(Grade);
