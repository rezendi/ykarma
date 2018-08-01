import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { loadAvailableRewards } from '../store/data/actions'
import RewardForm from './RewardForm'

class Rewards extends React.Component {

  componentDidMount() {
    this.props.loadAvailableRewards();
  }

  render() {
    const rewards = this.props.rewards || [];
    return (
        <Grid>
          <Row>
            <Col md={12}>
              <Panel>
                <Panel.Heading>
                  Available Rewards
                </Panel.Heading>
                <Panel.Body>
                  {rewards.map(reward => parseInt(reward.ownerId, 10) === 0 && parseInt(reward.vendorId, 10) !== this.props.user.ykid &&
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
                  {rewards.map(reward => parseInt(reward.vendorId, 10) !== this.props.user.ykid &&
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={6}>
              <RewardForm reward = {{}}/>
            </Col>
          </Row>
        </Grid>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    rewards: state.rewards || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAvailableRewards: () => dispatch(loadAvailableRewards()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rewards);
