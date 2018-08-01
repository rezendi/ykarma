import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { loadOwnedRewards, loadVendedRewards, loadAvailableRewards } from '../store/data/actions'
import RewardForm from './RewardForm'

class Rewards extends React.Component {

  componentDidMount() {
    this.props.loadOwnedRewards();
    this.props.loadAvailableRewards();
    this.props.loadVendedRewards();
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col md={6}>
              <RewardForm reward = {{}}/>
            </Col>
            <Col md={6}>
              <Panel>
                <Panel.Heading>
                  Available Rewards
                </Panel.Heading>
                <Panel.Body>
                  {this.props.availableRewards.map(reward => parseInt(reward.ownerId, 10) === 0 && parseInt(reward.vendorId, 10) !== this.props.user.ykid &&
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Panel>
                <Panel.Heading>
                  Rewards you have offered
                </Panel.Heading>
                <Panel.Body>
                  {this.props.vendedRewards.map(reward => parseInt(reward.vendorId, 10) !== this.props.user.ykid &&
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={6}>
              <Panel>
                <Panel.Heading>
                  My Rewards
                </Panel.Heading>
                <Panel.Body>
                  {this.props.ownedRewards.map(reward =>
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
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
    availableRewards: state.rewards.available || [],
    ownedRewards: state.rewards.owned || [],
    vendedRewards: state.rewards.vended || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAvailableRewards: () => dispatch(loadAvailableRewards()),
    loadOwnedRewards: () => dispatch(loadOwnedRewards()),
    loadVendedRewards: () => dispatch(loadVendedRewards()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rewards);
