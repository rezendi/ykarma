import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import { setLoading, loadAvailableRewards } from '../store/data/actions'
import Api from '../store/Api';
import Tranche from './Tranche';
import Readme from './Readme';

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

  getTopReward() {
    for (var i in this.props.rewards) {
      if (this.props.rewards[i].ownerId === 0)
        return this.props.rewards[i];
    }
    return null;
  }
  
  render() {
    const { t } = this.props;
   if (!this.props.user || Object.keys(this.props.user).length === 0) {
      return (
        <Grid>
          <Row>{t('Loading…')}</Row><
        /Grid>
      );
    }

   if (!this.props.user.uid) {
      return (
        <Grid>
          <Readme/>
        </Grid>
      );
    }

    if (!this.props.user.community || !this.props.user.community.id) {
      return (
        <Grid>
          <Row><Col md={12}>Hi, { this.props.user.displayName || this.props.user.email }! {t('You are not (yet) a member of any YKarma community')}</Col></Row>
          <Readme/>
        </Grid>
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
        <Grid>
          <Row>{t('First login detected, populating your account…')}</Row>
          <Row>{t('Please wait while we pile another block or two on the blockchain…')}</Row>
        </Grid>
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
                    {t('Howdy,')} { this.props.user.email || this.props.user.handle }!
                    &nbsp;
                    {t('You are a member of')} { this.props.user.community.metadata ? this.props.user.community.metadata.name : 'no known community' } {t('which has')} { this.props.user.community.accounts } {t('members / invitees')}
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
                    {t('You have')} { this.props.user.givable } {t('karma available to give')}
                    <br/>{t('For every 100 you give, you get 10 to spend')}
                    <hr/>
                  </Row>
                  <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                    <Row>
                      <b>Send</b>
                      &nbsp;
                      <Field name="coins" component="input" type="text" size="3" placeholder="?"/>
                      &nbsp;
                      <label htmlFor="coins">{t('karma')}</label>
                      &nbsp;
                      <label htmlFor="recipient">{t('to')}</label>
                      &nbsp;
                      <Field name="recipient" component="input" type="text" size="12" placeholder="Email / Twitter"/>
                      &nbsp;
                      <label htmlFor="message">{t('because')}</label>
                      &nbsp;
                      <Field name="message" component="input" type="text" size="16" maxLength="128" placeholder="Optional message"/>
                      &nbsp;
                      <Button bsStyle="info" type="submit">{t('Give')}</Button>
                    </Row>
                  </form>
                </Col>
              </Panel.Body>
            </Panel>
          </Col>

          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('Spend')}
              </Panel.Heading>
              <Panel.Body>
                <Col md={12}>
                  <Row>
                    {t('You have')} { this.props.user.spendable } {t('total karma available to spend')}
                    <Link className="pull-right" to="/profile">view details</Link>
                    <hr/>
                  </Row>
                  { this.getTopReward() &&
                  <Row>
                    {t('Top reward')}:
                    &nbsp;
                    <Link to={`/reward/${this.getTopReward().id}`}>{this.getTopReward().metadata.name || 'n/a'}</Link>
                    ,
                    <span> {this.getTopReward().cost}</span>
                    {this.getTopReward().tag && <span> <em>{this.getTopReward().tag}</em> </span>}
                    <span> karma</span>
                  </Row>
                  }
                  <Row>
                    <Link className="pull-right" to="/user/rewards">{t('View All Available Rewards')}</Link>
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
                {t('Given')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.given.sort((a,b) => { return a.block - b.block }).map((tranche, idx) =>
                  <Tranche key={idx} json={tranche}/>
                )}
              </Panel.Body>
            </Panel> }
          </Col>
          <Col md={6}>
            {this.props.user.received.length > 0 &&
            <Panel>
              <Panel.Heading>
                {t('Received')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.received.sort((a,b) => { return a.block - b.block }).map((tranche, idx) =>
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


const connected = connect(mapStateToProps, mapDispatchToProps)(Home);
export default withTranslation()(connected);
