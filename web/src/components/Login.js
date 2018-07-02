import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { auth } from '../firebase';
import * as firebase from 'firebase'

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
      localStorage.setItem("additionalUserInfo", JSON.stringify(result.additionalUserInfo));
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
    return (
        <Grid>
          <Row>
            <Col md={12}>
              <Panel>
                <Panel.Heading>
                  Login
                </Panel.Heading>
                <Panel.Body>
                  <Row>
                    <Button type="submit" onClick={this.doTwitter}>Log In with Twitter</Button>
                  </Row>
                  <form onSubmit={this.props.handleSubmit(this.doLogin)}>
                    <Row>
                      <label htmlFor="email">Email</label>
                      <Field name="email" component="input" type="text"/>
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
    )
  }
}

Login = reduxForm({
  form: 'login',
})(Login);

export default Login