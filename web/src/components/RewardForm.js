import React from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class RewardForm extends React.Component {

  submitForm = async (values) => {
    //console.log("submitting", body);
    this.props.setLoading(true);
    Api.upsertReward(values).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        return alert("Server error!");
      }
      res.json().then(json => {;
        if (json.success) {
          values.id===0 ? window.location.reload() : this.props.history.push('/user/rewards');
        } else {
          alert("Server failure! " + JSON.stringify(json));
        }
      });
    });
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          New Reward
        </Panel.Heading>
        <Panel.Body>
          <form onSubmit={this.props.handleSubmit(this.submitForm)}>
            <Row>
              <Col md={2}>
                <label htmlFor="name">Name</label>
              </Col>
              <Col md={8}>
                <Field name="name" component="input" size="40" type="text"/>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <label htmlFor="description">Description</label>
              </Col>
              <Col md={8}>
                <Field name="description" component="textarea" cols="40" type="textarea"/>
              </Col>
            </Row>
             <Row>
              <Col md={1}>
                <label htmlFor="cost">Cost</label>
              </Col>
              <Col md={3}>
                <Field name="cost" component="input" size="8" placeholder="? karma" type="text"/>
              </Col>
              <Col md={1}>
                <label htmlFor="quantity">Qty</label>
              </Col>
              <Col md={3}>
                <Field name="quantity" component="input" size="4" defaultValue="1" type="text"/>
              </Col>
              <Col md={1}>
                <label htmlFor="tag">Tag</label>
              </Col>
              <Col md={3}>
                <Field name="tag" component="input" size="8" defaultValue="alpha" type="text"/>
              </Col>
            </Row>
            <Row>
              &nbsp;
            </Row>
            <Row>
              <Col md={4}>
                &nbsp;
              </Col>
              <Col md={8}>
                <Button bsStyle="info" type="submit">Offer This Reward</Button>
              </Col>
            </Row>
          </form>
        </Panel.Body>
      </Panel>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    initialValues: ownProps.reward ?{
      id: ownProps.reward.id || 0,
      name: ownProps.reward.metadata ? ownProps.reward.metadata.name : '',
      description: ownProps.reward.metadata ? ownProps.reward.metadata.description : '',
      cost: ownProps.reward.cost,
      quantity: ownProps.reward.quantity,
      tag: ownProps.reward.tag
    } : {
      id: state.reward.id || 0,
      name: state.reward.metadata ? state.reward.metadata.name : '',
      description: state.reward.metadata ? state.reward.metadata.description : '',
      cost: state.reward.cost,
      quantity: state.reward.quantity || 1,
      tag: state.reward.tag || 'alpha',
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

RewardForm = reduxForm({
  form: 'account',
})(RewardForm);

RewardForm = connect(mapStateToProps, mapDispatchToProps)(RewardForm);

export default withRouter(RewardForm);