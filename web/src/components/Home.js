import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';

class Home extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form", values);
    fetch('/accounts/give', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.props.user.ykid,
        recipient: values.recipient,
        amount: values.coins,
        message: values.message,
      })
    })
    .then(res => {
      if (!res.ok) {
        alert("Server error!");
      } else {
        window.location.reload();
      }
    });
  }

  render() {
    // console.log("user", this.props.user);
    if (!this.props.user || !this.props.user.uid) {
      return (
        <div>Welcome to YKarma!</div>
      );
    }
    if (!this.props.user.ykid) {
      return (
        <div>Fetching account for { this.props.user.displayName || this.props.user.email }...</div>
      );
    }
    return (
      <Grid>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Home
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  Howdy { this.props.user.email } you have { this.props.user.givable } karma available to give
                </Row>
                <Row>
                  Spendable: { JSON.stringify(this.props.user.spendable) }
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Give
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <Field name="coins" component="input" type="text" size="7" placeholder="Number"/>
                    <label htmlFor="coins">coins</label>
                    &nbsp;
                    <label htmlFor="recipient">to</label>
                    <Field name="recipient" component="input" type="text" placeholder="Email or Twitter handle"/>
                    &nbsp;
                    <label htmlFor="message">saying</label>
                    <Field name="message" component="input" type="text" size="28" maxLength="128" placeholder="Add an optional message here"/>
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

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

Home = reduxForm({
  form: 'give',
})(Home);


export default connect(mapStateToProps, null)(Home);
