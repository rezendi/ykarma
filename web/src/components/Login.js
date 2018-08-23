import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import firebase from 'firebase/app'
import 'firebase/auth';
import { auth } from '../fbase';

class Login extends React.Component {

  doLogin = async (values) => {
    console.log("Logging in", values.email);
    auth.sendSignInLinkToEmail(values.email);
    alert("Email sent!");
    this.props.history.push("/");
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
      // window.location = "/?first=true";
    }).catch(function(error) {
      // var errorCode = error.code;
      var errorMessage = error.message;
      // var email = error.email;
      // var credential = error.credential;
      console.log("twitter error", errorMessage);
    });
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col md={6}>
              <Panel>
                <Panel.Heading>
                  Log In with Email
                </Panel.Heading>
                <Panel.Body>
                  <form onSubmit={this.props.handleSubmit(this.doLogin)}>
                    <Row>
                      &nbsp;
                      <label htmlFor="email">Email</label>
                      <Field name="email" component="input" type="text"/>
                      <Button bsStyle="info" type="submit">Log In</Button>
                    </Row>
                  </form>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={6}>
              <Panel>
                <Panel.Heading>
                  Log In with Twitter
                </Panel.Heading>
                <Panel.Body>
                  <Row>
                    &nbsp;
                    <Button bsStyle="info" type="submit" onClick={this.doTwitter}>Log In</Button>
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

export default Login