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
    var response = await Api.upsertCommunity(values);
    this.props.setLoading(false);
    if (!response.ok) {
      alert("Server error!");
    } else {
      var json = await response.json();
      json.success ? window.location.href = '/admin' : alert("Server failure! " + JSON.stringify(json));
    }
  }

  getSlackUrl = () => {
    const slackState = Math.random().toString(36).substring(7);
    sessionStorage.setItem('slackState', slackState);
    const slackBaseUrl = `https://slack.com/oauth/authorize?scope=commands,bot,users:read,users:read.email&client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_DOMAIN}%2Fapi%2Fslack%2Fteam_auth`;
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
                    <Field name="description" component="input" type="text" size="80"/>
                  </Row>
                  <Row>
                    <label htmlFor="domain">Community Domain (if any)</label>
                    <Field name="domain" component="input" type="text"/>
                  </Row>
                  <Row>
                        <Field name='strict' id='strict' component="input" type="checkbox"/>Strict membership (only from Slack workspace or emails from this domain)
                  </Row>
                  <Row>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form>
                {this.props.initialValues && this.props.initialValues.slackTeams && this.props.initialValues.slackTeams.length > 0 &&
                <Row>
                  <p>This community already has a Slack team associated with it.</p>
                </Row>
                }
              </Panel.Body>
            </Panel>
            
            {this.props.initialValues && (!this.props.initialValues.slackTeams || this.props.initialValues.slackTeams.length === 0) &&
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
      domain: ownProps.community ? ownProps.community.domain : '',
      strict: ownProps.community ? ownProps.community.flags === '0x0000000000000000000000000000000000000000000000000000000000000001' : null,
      description: ownProps.community ? ownProps.community.metadata.description : '',
      slackTeams: ownProps.community ? ownProps.community.metadata.slackTeams : '',
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForm);
