import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { setLoading, loadAvailableRewards } from '../store/data/actions'
import Api from '../store/Api';
import Tranche from './Tranche';

class Home extends React.Component {

  componentDidMount() {
    this.props.loadAvailableRewards();
  }

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

  getTopReward() {
    return this.props.rewards.length > 0 ? this.props.rewards[0] : null;
  }
  
  render() {
   if (!this.props.user || Object.keys(this.props.user).length === 0) {
      return (
        <Grid><Row>Loading...</Row></Grid>
      );
    }

   if (!this.props.user.uid) {
      return (
        <Grid><Row>Welcome to YKarma!</Row></Grid>
      );
    }

    if (!this.props.user.ykid) {
      return (
        <Grid><Row>Fetching account for { this.props.user.displayName || this.props.user.email }...</Row></Grid>
      );
    }

    if (this.props.user.flags === '0x0000000000000000000000000000000000000000000000000000000000000001') {
      setTimeout(() => {
        window.location="/";
      }, 6000);
      return (
        <Grid><Row>First login detected, populating your account...</Row></Grid>
      );
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
                  <Col md={12}>
                    Howdy, { this.props.user.email || this.props.user.handle }!
                    You are a member of { this.props.user.community.metadata ? this.props.user.community.metadata.name : 'no known community' } which has { this.props.user.community.accounts } members.
                  </Col>
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
                <Col md={12}>
                  <Row>
                    You have { this.props.user.givable } karma available to give.
                    <hr/>
                  </Row>
                  <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                    <Row>
                      <b>Send</b>
                      &nbsp;
                      <Field name="coins" component="input" type="text" size="3" placeholder="?"/>
                      &nbsp;
                      <label htmlFor="coins">karma</label>
                      &nbsp;
                      <label htmlFor="recipient">to</label>
                      &nbsp;
                      <Field name="recipient" component="input" type="text" size="12" placeholder="Email / Twitter"/>
                      &nbsp;
                      <label htmlFor="message">because</label>
                      &nbsp;
                      <Field name="message" component="input" type="text" size="16" maxLength="128" placeholder="Optional message"/>
                      &nbsp;
                      <Button bsStyle="info" type="submit">Give</Button>
                    </Row>
                  </form>
                </Col>
              </Panel.Body>
            </Panel>
          </Col>

          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Spend
              </Panel.Heading>
              <Panel.Body>
                <Col md={12}>
                  <Row>
                    You have { this.totalSpendable() } total karma available to spend.
                    <Link className="pull-right" to="/profile">view details</Link>
                    <hr/>
                  </Row>
                  { this.getTopReward() &&
                  <Row>
                    Top reward:
                    &nbsp;
                    <Link to={`/reward/${this.getTopReward().id}`}>{this.getTopReward().metadata.name || 'n/a'}</Link>
                    ,
                    <span> {this.getTopReward().cost}</span>
                    {this.getTopReward().tag && <span> <em>{this.getTopReward().tag}</em> </span>}
                    <span> karma</span>
                  </Row>
                  }
                  <Row>
                    <Link className="pull-right" to="/user/rewards">View All Available Rewards</Link>
                  </Row>
                </Col>
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
                  <Tranche key={idx} json={tranche}/>
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
                  <Tranche key={idx} json={tranche}/>
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
    rewards: state.rewards.available || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
    loadAvailableRewards: () => dispatch(loadAvailableRewards()),
  }
}

Home = reduxForm({
  form: 'give',
})(Home);


export default connect(mapStateToProps, mapDispatchToProps)(Home);
