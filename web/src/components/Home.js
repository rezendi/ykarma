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

  totalSpendable() {
    var total = 0;
    const spendable = this.props.user.received || [];
    for (var i=0; i < spendable.length; i++) {
      total += parseInt(spendable[i].available, 10);
    }
    return total;
  }

  render() {
    if (!this.props.user || !this.props.user.uid) {
      return (
        <Grid><Row>Welcome to YKarma!
          { false &&
          <form onSubmit={this.props.handleSubmit(this.submitForm)}>
            <Button type="submit">Submit</Button>
          </form> }
        </Row></Grid>
      );
    }

    if (!this.props.user.ykid) {
      return (
        <Grid><Row>Fetching account for { this.props.user.displayName || this.props.user.email }...</Row></Grid>
      );
    }

    if (this.props.location.search.indexOf("?first=true")===0) {
      Api.replenish().then(result => {
        console.log('replenish result', result);
        window.location="/";
      });
    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                Welcome
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  Howdy, { this.props.user.email || this.props.user.handle }!
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Give
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  You have { this.props.user.givable } karma available to give.
                </Row>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <b>Give</b>
                    <Field name="coins" component="input" type="text" size="7" placeholder="Number"/>
                    <label htmlFor="coins">coins</label>
                    &nbsp;
                    <label htmlFor="recipient">to</label>
                    <Field name="recipient" component="input" type="text" size="18" placeholder="Email / Twitter name"/>
                    &nbsp;
                    <label htmlFor="message">saying</label>
                    <Field name="message" component="input" type="text" size="20" maxLength="128" placeholder="Optional message here"/>
                  </Row>
                  <Row>
                    <Button bsStyle="info" type="submit">Submit</Button>
                  </Row>
                </form>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Spend
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  You have { this.totalSpendable() } karma available to spend.
                </Row>
                <Row>
                  By tag if relevant
                </Row>
                <Row>
                  Top affordable reward
                </Row>
                <Row>
                  Create a reward
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {this.props.user.given.length > 0 &&
            <Panel>
              <Panel.Heading>
                Given
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.given.map((tranche, idx) =>
                  <Row key={"sen"+idx}>
                    <li>{JSON.stringify(tranche)}</li>
                  </Row>
                )}
              </Panel.Body>
            </Panel> }
          </Col>
          <Col md={6}>
            {this.props.user.received.length > 0 &&
            <Panel>
              <Panel.Heading>
                Received
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.received.map((tranche, idx) =>
                  <Row key={"rec"+idx}>
                    <li>{JSON.stringify(tranche)}</li>
                  </Row>
                )}
              </Panel.Body>
            </Panel> }
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
