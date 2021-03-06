import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { loadAccount, loadRewardsVendedBy } from '../store/data/actions'
import RewardRow from './RewardRow';

class Account extends React.Component {
  componentDidMount() {
    this.props.loadAccount(this.props.match.params.id);
    this.props.loadRewardsVendedBy(this.props.match.params.id);
    this.setState({editing: false});
  }
  
  getUrlFrom = (urls, idx) => {
    var url = (urls || '').split(' ').length < idx ? null : (urls || '').split(' ')[idx-1].replace("mailto:","").replace("https://twitter.com/","@")
    return url && !url.startsWith("slack:") ? url : null;
  }

  getTotalSoldRewards = (offered) => {
    return offered.filter(offer => offer.ownerId > 0).reduce((acc, offer) => {
      return acc + offer.quantity;
    }, 0);
  }

  getTotalSoldKarma = (offered) => {
    return offered.filter(offer => offer.ownerId > 0).reduce((acc, offer) => {
      return acc + offer.cost;
    }, 0);
  }

  render() {
    const { t } = this.props;
    if (!this.props.account.id) {
      return (
        <div>Loading…</div>
      );
    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {t('Profile')}
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={8}>
                    { this.props.account.metadata && this.props.account.metadata.name && <b>{ this.props.account.metadata.name }</b> }
                    <div>
                      <i>{ this.getUrlFrom(this.props.account.urls, 1) }</i>
                    </div>
                    { this.getUrlFrom(this.props.account.urls, 2) &&
                    <div>
                      <i>{ this.getUrlFrom(this.props.account.urls, 2) }</i>
                    </div> }
                    { this.getUrlFrom(this.props.account.urls, 3) &&
                    <div>
                      <i>{ this.getUrlFrom(this.props.account.urls, 3) }</i>
                    </div> }
                  </Col>
                  { this.props.account.providerData && this.props.account.providerData.length > 0 && this.props.account.providerData[0].photoURL &&
                  <Col md={4}>
                    <img alt="avatar" style={{float:"right"}} width={64} height={64} src={this.props.account.providerData[0].photoURL}/>
                  </Col> }
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {t('Rewards')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.vended.map(reward =>
                  <RewardRow key={reward.id} reward={reward} showAvailable={true} />
                )}
                {t('Has sold')} {this.getTotalSoldRewards(this.props.vended)} {t('rewards for a total of')} {this.getTotalSoldKarma(this.props.vended)} {t('karma')}
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state, ownProps) {
  //console.log("account", state.account);
  return {
    account: state.account,
    vended: state.account.vended || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAccount: (accountId) => dispatch(loadAccount(accountId)),
    loadRewardsVendedBy: (vendorId) => dispatch(loadRewardsVendedBy(vendorId)),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(Account);
export default withTranslation()(connected);
