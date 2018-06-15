import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { signOut } from '../utils';

import { Text, StyleSheet, ScrollView, View, Button, RefreshControl } from 'react-native';

import {
	List,
	Button as AntButton
} from 'antd-mobile-rn';

const StatusColor = {
	doing: 'orange',
	done: '#aaa'
};

const styles = StyleSheet.create({
	badge: {
		backgroundColor: '#EEE',
		borderRadius: 5,
		overflow: 'hidden',
		paddingHorizontal: 3,
		paddingVertical: 1,
		marginRight: 8
	}
});

class Divider extends React.Component {
	render() {
		return (
			<View key='title' >
				<View style={{ height: 1, backgroundColor: '#ddd', marginTop: 16 }}></View>
				<Text style={{ fontSize: 12, color: '#888', marginBottom: 8, textAlign: 'left', marginTop: -9 }}>
					<Text style={{ fontWeight: 'bold', backgroundColor: this.props.backgroundColor || 'white', marginVertical: 5 }}>{this.props.children}  </Text>
				</Text>
			</View>
		);
	}
}

class Grade extends React.Component {
	static navigationOptions = ({ screenProps }) => {
		return {
			title: 'Meu Currículo',
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

	renderRequirements(grade) {
		if (!grade.requirement || !grade.requirement.length) {
			return;
		}

		const items = [
			<Divider key='title' backgroundColor='#F5F5F9'>Requisitos</Divider>
		].concat(grade.requirement.map(requirement => {
			return (
				<View key={requirement._id} style={{ backgroundColor: 'red', paddingVertical: 1, paddingHorizontal: 5, borderRadius: 2, marginBottom: 2 }}>
					<Text style={{ fontSize: 12, color: '#FFF', fontWeight: 'bold' }}>
						{requirement.name}
					</Text>
				</View>
			);
		}));

		return items;
	}

	renderDetail(open, grade, status) {
		if (!open) {
			return <View />;
		}

		const buttonStyle = {
			padding: 5,
			flex: 1,
			borderWidth: 0
		};

		const onClick = (newStatus) => () => {
			if (status === newStatus) {
				return;
			}

			this.props.updateGradeItem({
				variables: {
					_id: grade._id,
					status: newStatus
				}
			}).then(() => {
				this.props.data.refetch();
			});
		};


		return (
			<React.Fragment>
				<Text style={{ fontSize: 12, color: '#888' }}>
					<Text>
						<Text style={{ fontWeight: 'bold' }}>Código: </Text>
						<Text>{grade.code}</Text>
						<Text>  ·  </Text>
						<Text style={{ fontWeight: 'bold' }}>Créditos: </Text>
						<Text>{grade.credit}</Text>
						<Text>  ·  </Text>
						<Text style={{ fontWeight: 'bold' }}>Carga Horária: </Text>
						<Text>{grade.workload}</Text>
					</Text>
				</Text>
				{this.renderRequirements(grade)}
				{ grade.description ?
					<React.Fragment>
						<Divider key='title' backgroundColor='#F5F5F9'>Ementa</Divider>
						<Text style={{ fontSize: 12, padding: 0, color: '#888' }}>
							{grade.description}
						</Text>
					</React.Fragment>:
					undefined
				}
				<Divider key='title' backgroundColor='#F5F5F9'>Estatus</Divider>
				<View style={{ flexDirection: 'row', marginBottom: 5 }}>
					<AntButton size='medium' style={buttonStyle} onClick={onClick('pending')} type={status === 'pending' ? 'primary' : 'ghost'} >Pendente</AntButton>
					<AntButton size='medium' style={buttonStyle} onClick={onClick('doing')} type={status === 'doing' ? 'primary' : 'ghost'}>Cursando</AntButton>
					<AntButton size='medium' style={buttonStyle} onClick={onClick('done')} type={status === 'done' ? 'primary' : 'ghost'}>Concluído</AntButton>
				</View>
			</React.Fragment>
		);
	}

	renderItems() {
		const { data: { grades } } = this.props;

		const gradesSorted = [...grades].sort((a, b) => {
			const aText = `${ a.semester } / ${ a.code }`;
			const bText = `${ b.semester } / ${ b.code }`;
			if (aText > bText) {
				return 1;
			}
			if (aText < bText) {
				return -1;
			}
			return 0;
		});

		return gradesSorted.map((grade) => {
			const odd = grade.semester % 2 !== 0;
			const open = this.state.open === grade._id;
			const status = grade.userStatus || 'pending';

			return (
				<List.Item key={grade._id} arrow={open ? 'up' : 'down'} multipleLine onClick={() => this.setState({ open: open ? undefined : grade._id })} style={{ backgroundColor: open ? '#F5F5F9' : 'white' }}>
					<View style={{ flexDirection: 'row', paddingVertical: 8 }}>
						<View style={[styles.badge, { backgroundColor: odd ? '#EEE' : '#AAA' }]}>
							<Text style={{ color: odd ? '#888' : '#FFF' }}>{`${ grade.semester }º`}</Text>
						</View>
						<Text style={{ color: StatusColor[status] }}>
							{grade.name}
						</Text>
					</View>
					{this.renderDetail(open, grade, status)}
				</List.Item>
			);
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
				style={{ backgroundColor: '#F5F5F9' }}
				refreshControl={
					<RefreshControl
						refreshing={loading || this.state.refetching}
						onRefresh={this._onRefresh}
					/>
				}
			>
				{ loading ?
					undefined :
					<List>
						{this.renderItems()}
					</List>
				}
			</ScrollView>
		);
	}
}

export default compose(
	graphql(gql`
		query {
			grades {
				_id
				credit
				workload
				code
				name
				semester
				description
				userStatus
				requirement {
					_id
					semester
					code
					name
				}
			}
		}
	`),
	graphql(gql`
		mutation updateGradeItem($_id: String! $status: String!) {
			updateGradeItem(_id: $_id, status: $status)
		}
	`, { name: 'updateGradeItem' })
)(Grade);
