import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { List, Button, WhiteSpace, Picker } from 'antd-mobile-rn';
import { Text, ActivityIndicator } from 'react-native';


class PickerInput extends React.Component {

	render() {
		const { placeholder, extra, onClick } = this.props;
		let value = placeholder;
		const styles = {
			fontSize: 17
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

class Course extends React.Component {
	state = {
		error: {}
	}

	onChange = (field) => (value) => {
		this.setState({
			[field]: value
		});
	}

	onSave = () => {
		this.props.setCourse({
			variables: {
				course: this.state.course[0]
			}
		}).then(async({ data: { setCourse } }) => {
			if (setCourse === false) {
				return alert('error');
			}

			this.props.screenProps.changeCourseState(true);
		}).catch((...args) => {
			this.setState({ log: args });
		});
	}

	isSubmitDisabled = () => {
		return !this.state.course;
	}

	render() {
		const { data: { user, courses, loading } } = this.props;

		if (loading) {
			return <ActivityIndicator size='large' color='#0000ff' />;
		}

		if (user && user.profile && user.profile.course) {
			this.props.screenProps.changeCourseState(true);
			return <Text></Text>;
		}

		const pickerData = [
			courses.map(c => ({ label: c.name, value: c._id }))
		];

		return (
			<React.Fragment>
				<WhiteSpace size='xl'/>
				<List>
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
				</List>
				<WhiteSpace size='xl'/>
				<Button type='primary' style={{ borderRadius: 0 }} disabled={this.isSubmitDisabled()} onClick={this.onSave}>
					Selecionar
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
				profile {
					course {
						_id
						name
					}
				}
			}
			courses {
				_id
				name
			}
		}
	`),
	graphql(gql`
		mutation setCourse($course: String!) {
			setCourse(course: $course) {
				success
			}
		}
	`, { name: 'setCourse' })
)(Course);
