import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { signOut } from '../utils';

import { Text, ScrollView, View, Button, RefreshControl, TouchableWithoutFeedback, Image } from 'react-native';

import {
	List,
	Switch
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

const Status = {
	pending: 'Pendente',
	doing: 'Cursando',
	done: 'Concluído'
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
		refetching: false,
		done: false,
		blocked: true
	}

	setInterest = ({ calendarId, gradeItemId, shift, day, interested }) => {
		const { updateCalendarItemInterest, data: { refetch } } = this.props;

		updateCalendarItemInterest({
			variables: {
				calendarId,
				gradeItemId,
				shift,
				day,
				interested
			}
		}).then(() => {
			refetch();
		});
	}

	baseFilter = (item) => {
		if (!item.grade.code) {
			return false;
		}

		if (this.state.done === false && item.userStatus !== 'pending') {
			return false;
		}

		if (this.state.blocked === false) {
			return !item.grade.requirement.find(r => r.userStatus === 'pending');
		}

		return true;
	}

	renderItems(items, calendarId) {
		return items.map((item) => {
			const status = item.userStatus || 'pending';
			const style = {
				fontSize: 17,
				color: [StatusColor[status]]
			};
			const styleDetail = {
				color: [StatusColorDetail[status]],
				lineHeight: 20
			};

			const onClick = () => this.setInterest({
				calendarId,
				gradeItemId: item.grade._id,
				shift: item.shift,
				day: item.day,
				interested: !item.interested
			});

			const getExtra = () => <TouchableWithoutFeedback onPress={onClick}>
				<Ionicons name={`md-heart${ item.interested ? '' : '-outline' }`} size={25} color='#666' />
			</TouchableWithoutFeedback>;

			const requirements = item.grade.requirement.filter(r => r.userStatus !== 'done').map(requirement => {
				const style = {
					color: '#f50'
				};

				switch (requirement.userStatus) {
					case 'done':
						style.color = '#d3d3d3';
						break;
					case 'doing':
						style.color = '#ffa500';
						break;
				}

				return <View key={requirement._id} style={{ backgroundColor: style.color, paddingVertical: 1, paddingHorizontal: 5, borderRadius: 2, marginBottom: 2, flex: 1 }}>
					<Text style={{ fontSize: 12, color: '#FFF', fontWeight: 'bold' }}>
						<Text>{Status[requirement.userStatus]}</Text>
						<Text> - </Text>
						<Text>{requirement.name}</Text>
					</Text>
				</View>;
			});

			const friends = item.friendsInterested.map(friend => {
				return <Image
					key={friend.id}
					source={{ uri: friend.pictureUrl }}
					style={{
						height: 24,
						width: 24,
						borderRadius: 12,
						marginLeft: -12,
						borderWidth: 2,
						borderColor: '#fff'
					}}
				/>;
			});

			return (
				<List.Item key={item._id}
					multipleLine
					extra={status === 'pending' && getExtra()}
				>
					<Text style={style}>
						{item.grade.name}
					</Text>
					<Text style={styleDetail}>Interessados: {item.interested}</Text>
					<Text style={styleDetail}>Semestre: {item.grade.semester}</Text>
					{
						item.teacher && item.teacher.name ?
							<Text style={styleDetail}>Professor: {item.teacher.name}</Text>:
							<View></View>
					}
					<View style={{ flexDirection: 'row' }}>
						{requirements}
					</View>
					<View style={{ flexDirection: 'row', marginLeft: 12, flexWrap: 'wrap' }}>
						{friends}
					</View>
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
			const items = calendar.grade.filter(g => g.day === day && g.shift === shift).filter(this.baseFilter);
			if (items.length) {
				return (
					<List key={key} renderHeader={() => key}>
						{this.renderItems(items, calendar._id)}
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
			<React.Fragment>
				<ScrollView
					style={{ backgroundColor: '#F5F5F9' }}
					refreshControl={
						<RefreshControl
							refreshing={loading || this.state.refetching}
							onRefresh={this._onRefresh}
						/>
					}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomColor: '#ddd', borderBottomWidth: 1 }}>
						<Text style={{ color: '#888' }}>Concluidas: </Text>
						<Switch checked={this.state.done} onChange={(value) => this.setState({ done: value })} />
						<Text style={{ color: '#888', paddingHorizontal: 10 }}>|</Text>
						<Text style={{ color: '#888' }}>Bloqueadas: </Text>
						<Switch checked={this.state.blocked} onChange={(value) => this.setState({ blocked: value })} />
					</View>
					{this.renderGroups()}
				</ScrollView>
			</React.Fragment>
		);
	}
}

export default compose(
	graphql(gql`
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
					friendsInterested {
						id
						name
						pictureUrl
					}
					grade {
						_id
						code
						name
						semester
						requirement {
							_id
							code
							name
							userStatus
						}
					}
				}
			}
		}
	`),
	graphql(gql`
		mutation updateCalendarItemInterest(
			$calendarId: String!
			$gradeItemId: String!
			$shift: String!
			$day: String!
			$interested: Boolean!
		) {
			updateCalendarItemInterest(
				calendarId: $calendarId
				gradeItemId: $gradeItemId
				shift: $shift
				day: $day
				interested: $interested
			)
		}
	`, { name: 'updateCalendarItemInterest' })
)(Grade);
