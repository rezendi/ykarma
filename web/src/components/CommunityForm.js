import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class CommunityForm extends React.Component {

  submitForm = async (values) => {
    //console.log("Submitting form", values);
    this.props.setLoading(true);
    Api.upsertCommunity(values).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        alert("Server error!");
      } else {
        res.json().then(json => {
          json.success ? this.props.history.push('/admin') : alert("Server failure! " + JSON.stringify(json));
        });
      }
    });
  }

  getSlackUrl = () => {
    const slackState = Math.random().toString(36).substring(7);
    sessionStorage.setItem('slackState', slackState);
    const slackBaseUrl = `https://slack.com/oauth/authorize?scope=commands,bot&client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_DOMAIN}%2Fapi%2Fslack%2Fteam_auth`;
    fetch('/api/slack/state', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({state:slackState}),
    });
    return slackBaseUrl + "&state=" + slackState;
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.initialValues ? this.props.initialValues.name : "New Community"}
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <label htmlFor="name">Community Name</label>
                    <Field name="name" component="input" type="text"/>
                  </Row>
                  <Row>
                    <label htmlFor="description">Community Description</label>
                    <Field name="description" component="input" type="text"/>
                  </Row>
                  <Row>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form>
              </Panel.Body>
            </Panel>
            {this.props.initialValues && !this.props.initialValues.slackTeamId &&
            <Panel>
              <Panel.Heading>
                Add to Slack
              </Panel.Heading>
              <Panel.Body>
                <a href={this.getSlackUrl()}><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
              </Panel.Body>
            </Panel>
            }
          </Col>
        </Row>
      </Grid>
    );
  }
}

CommunityForm = reduxForm({
  form: 'community',
})(CommunityForm);

function mapStateToProps(state, ownProps) {
  return {
    initialValues: {
      id: ownProps.community ? ownProps.community.id : 0,
      name: ownProps.community ? ownProps.community.metadata.name : '',
      description: ownProps.community ? ownProps.community.metadata.description : '',
      slackTeamId: ownProps.community ? ownProps.community.metadata.slackTeamId : '',
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForm);
