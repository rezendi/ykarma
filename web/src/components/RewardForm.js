import React from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { withTranslation } from 'react-i18next';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class RewardForm extends React.Component {

  submitForm = async (values) => {
    //console.log("submitting", values);
    if (!values.name || values.name.length === 0) {
      alert(this.props.t("Invalid name"));
      throw new SubmissionError({
        cost: this.props.t('Invalid name'),
        _error: this.props.t('Reward creation failed'),
      }) ;
    }
    if (!values.cost || parseInt(values.cost, 10) <= 0) {
      alert(this.props.t("Invalid cost"));
      throw new SubmissionError({
        cost: this.props.t('Invalid cost'),
        _error: this.props.t('Reward creation failed'),
      }) ;
    }
    if (!values.quantity || parseInt(values.quantity, 10) <= 0) {
      alert(this.props.t("Invalid quantity"));
      throw new SubmissionError({
        cost: this.props.t('Invalid quantity'),
        _error: this.props.t('Reward creation failed'),
      }) ;
    }
    this.props.setLoading(true);
    Api.upsertReward(values).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        return alert(this.props.t("Server error!"));
      }
      res.json().then(json => {;
        if (json.success) {
          values.id===0 ? window.location.reload() : this.props.history.push('/user/rewards');
        } else {
          alert(this.props.t("Server failure!") + " " + JSON.stringify(json));
        }
      });
    });
  }

  render() {
    const { t } = this.props;
    return (
      <Panel>
        <Panel.Heading>
          {t('New Reward')}
        </Panel.Heading>
        <Panel.Body>
          <form onSubmit={this.props.handleSubmit(this.submitForm)}>
            <Row>
              <Col md={2}>
                <label htmlFor="name">{t('Name')}</label>
              </Col>
              <Col md={8}>
                <Field name="name" component="input" size="40" type="text"/>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <label htmlFor="description">{t('Description')}</label>
              </Col>
              <Col md={8}>
                <Field name="description" component="textarea" cols="40" type="textarea"/>
              </Col>
            </Row>
             <Row>
              <Col md={2}>
                <label htmlFor="cost">{t('Cost')}</label>
              </Col>
              <Col md={3}>
                <Field name="cost" component="input" size="8" placeholder="? karma" type="text"/>
              </Col>
              <Col md={2}>
                <label htmlFor="quantity">{t('Quantity')}</label>
              </Col>
              <Col md={3}>
                <Field name="quantity" component="input" size="4" type="text"/>
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
                <Button bsStyle="info" type="submit">{t('Offer This Reward')}</Button>
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
RewardForm = withRouter(RewardForm);

export default withTranslation()(RewardForm);