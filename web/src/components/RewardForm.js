import React from 'react';
import { Grid, Row, Col, Panel, FormControl, Button } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { rewardReducer } from '../store/data/reducer'

class RewardForm extends React.Component {

  submitForm = async (values) => {
    var res = await fetch(values.id===0 ? '/rewards/create' : '/rewards/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: {
          id: values.id,
          cost: values.cost,
          tag: values.tag,
          metadata: {
            name: values.name,
            description: values.description,
          },
          flags: '0x00'
        }
      })
    });
    
    if (!res.ok) {
      alert("Server error!");
    } else {
      var json = await res.json();
      if (json.success) {
        this.props.history.push('/rewards');
      } else {
        alert("Server failure! " + JSON.stringify(json));
      }
    }
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                New Reward
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <label htmlFor="name">Name</label>
                    <Field name="name" component="input" type="text"/>
                  </Row>
                  <Row>
                    <label htmlFor="description">Description</label>
                    <Field name="description" component="input" type="textarea"/>
                  </Row>
                  <Row>
                    <label htmlFor="cost">Cost</label>
                    <Field name="cost" component="input" type="text"/>
                  </Row>
                  <Row>
                    <label htmlFor="tag">Tag</label>
                    <Field name="tag" component="input" type="text"/>
                  </Row>
                  <Row>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

RewardForm = reduxForm({
  form: 'account',
})(RewardForm);

RewardForm = connect(
  state => ({
    initialValues: {
      id: state.reward.id || 0,
      cost: state.reward.cost,
      tag: state.reward.tag,
      name: state.reward.metadata ? state.reward.metadata.name : '',
      description: state.reward.metadata ? state.reward.metadata.description : '',
    }
  }),
  {reward: rewardReducer}
)(RewardForm)

export default withRouter(RewardForm);