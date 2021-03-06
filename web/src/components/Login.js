import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import firebase from 'firebase/app'
import 'firebase/auth';
import { auth } from '../fbase';

class Login extends React.Component {

  getSlackUrl() {
    const slackState = Math.random().toString(36).substring(7);
    sessionStorage.setItem('slackState', slackState);
    const slackBaseUrl = "https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=" + process.env.REACT_APP_SLACK_CLIENT_ID;
    fetch('/api/slack/state', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({state:slackState}),
    });
    return slackBaseUrl + "&state=" + slackState;
  }

  doLogin = async (values) => {
    console.log("Logging in", values.email);
    auth.sendSignInLinkToEmail(values.email, () => {
        alert(this.props.t("Email sent!"));
        this.props.history.push("/");
      }, () => {
        alert(this.props.t("Email failed!"));
      }
    );
  }
  
  doTwitter = () => {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // var token = result.credential.accessToken;
      // var secret = result.credential.secret;
      // var user = result.user;
      localStorage.setItem("authProvider", "twitter");
      localStorage.setItem("additionalTwitterInfo", JSON.stringify(result.additionalUserInfo));
      window.location = "/";
    }).catch(function(error) {
      // var errorCode = error.code;
      var errorMessage = error.message;
      // var email = error.email;
      // var credential = error.credential;
      console.log("twitter error", errorMessage);
    });
  }

  render() {
    const { t } = this.props;
    return (
        <Grid>
          <Row>
            <Col md={4}>
              <Panel>
                <Panel.Heading>
                  {t('Log In with Email')}
                </Panel.Heading>
                <Panel.Body>
                  <form onSubmit={this.props.handleSubmit(this.doLogin)}>
                    <Row>
                      &nbsp;
                      <label htmlFor="email">{t('Email')}</label>
                      <Field name="email" component="input" type="text"/>
                      <Button bsStyle="info" type="submit">{t('Log In')}</Button>
                    </Row>
                  </form>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={4}>
              <Panel>
                <Panel.Heading>
                  {t('Log In with Twitter')}
                </Panel.Heading>
                <Panel.Body>
                  <Row>
                    &nbsp;
                    <Button bsStyle="info" type="submit" onClick={this.doTwitter}>{t('Log In')}</Button>
                  </Row>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={4}>
              <Panel>
                <Panel.Heading>
                  {t("Log In with Slack")}
                </Panel.Heading>
                <Panel.Body>
                  <Row>
                    &nbsp;
                    <a href={this.getSlackUrl()}><img alt={t("Log In with Slack")} height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a>
                  </Row>
                </Panel.Body>
              </Panel>
            </Col>

          </Row>
        </Grid>
    )
  }
}

Login = reduxForm({
  form: 'login',
})(Login);

export default withTranslation()(Login)