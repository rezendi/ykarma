import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';

class Home extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form", values);
    fetch('/accounts/give', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.props.user.ykid,
        email: values.email,
        amount: values.coins,
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
    if (!this.props.user || !this.props.user.uid) {
      return (
        <div>Please log in</div>
      );
    }
    if (!this.props.user.ykid) {
      return (
        <div>Account for { this.props.user.displayName || this.props.user.email } not found...</div>
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
                  Howdy { this.props.user.email } { this.props.user.ykid } { this.props.user.givable } { this.props.user.given }  { this.props.user.spendable }
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
                    <Field name="coins" component="input" type="text" placeholder="Number of coins"/>
                    <label htmlFor="coins">coins</label>
                  </Row>
                  <Row>
                    <label htmlFor="email">to</label>
                    <Field name="email" component="input" type="text" placeholder="Recipient's email address"/>
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
