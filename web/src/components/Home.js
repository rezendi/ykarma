import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class Home extends React.Component {

  submitForm = async (values) => {
    // console.log("Submitting form", values);
    this.props.setLoading(true);
    Api.giveKarma(this.props.user.ykid, values).then((res) => {
      this.props.setLoading(false);
      res.ok ? window.location.reload() : alert("Server error!");
    });
  }

  componentDidMount() {
  }

  render() {
    if (!this.props.user || !this.props.user.uid) {
      return (
        <div>Welcome to YKarma!
          { false &&
          <form onSubmit={this.props.handleSubmit(this.submitForm)}>
            <Button type="submit">Submit</Button>
          </form> }
        </div>
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
                  Spendable: { JSON.stringify(this.props.user.received) }
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

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

Home = reduxForm({
  form: 'give',
})(Home);


export default connect(mapStateToProps, mapDispatchToProps)(Home);
