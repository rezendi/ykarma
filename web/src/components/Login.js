import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { auth } from '../firebase';

class Login extends React.Component {

  doLogin = async (values) => {
    console.log("Logging in", values.email);
    auth.sendSignInLinkToEmail(values.email);
    alert("Email sent!");
    this.props.history.push("/");
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