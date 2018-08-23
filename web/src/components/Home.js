import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';
import Tranche from './Tranche';

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

  karmaBreakdown() {
    var myTags = {};
    const spendable = this.props.user.received || [];
    for (var i=0; i < spendable.length; i++) {
      const tags = spendable[i].tags.split(",");
      for (var j in tags) {
        var tag = tags[j];
        myTags[tag] = myTags[tag] ? myTags[tag] + spendable[i].available : spendable[i].available;
      }
    }

    var sortedTags = [];
    for (var key in myTags) {
      sortedTags.push({tag: key, avail: myTags[key]});
    }
    sortedTags = sortedTags.sort(function(a,b) {return (a.avail > b.avail) ? 1 : ((b.avail > a.avail) ? -1 : 0);} );
    sortedTags = sortedTags.reverse();

    var retval = "";
    for (var k in sortedTags) {
      retval+= `${sortedTags[k].avail} "${sortedTags[k].tag}"`;
      retval += k < sortedTags.length - 1 ? ", " : "";
    }
    return retval;
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

    /*
    if (this.props.location.search.indexOf("?first=true")===0) {
      Api.replenish().then(result => {
        console.log('replenish result', result);
        window.location="/";
      });
    }
    */

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
                      <b>Give</b>
                      &nbsp;
                      <Field name="coins" component="input" type="text" size="3" placeholder="?"/>
                      &nbsp;
                      <label htmlFor="coins">coins</label>
                      &nbsp;
                      <label htmlFor="recipient">to</label>
                      &nbsp;
                      <Field name="recipient" component="input" type="text" size="12" placeholder="Email / Twitter"/>
                      &nbsp;
                      <label htmlFor="message">saying</label>
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
                    <hr/>
                  </Row>
                  <Row>
                    <Link to="/user/rewards">View Available Rewards</Link>
                  </Row>
                  <Row>
                    Your karma by flavor: { this.karmaBreakdown() }
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
