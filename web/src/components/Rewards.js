import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { loadAvailableRewards, loadMyRewards } from '../store/data/actions'
import RewardForm from './RewardForm'

class Rewards extends React.Component {

  componentDidMount() {
    this.props.loadAvailableRewards();
    this.props.loadMyRewards();
  }

  render() {
    const rewards = this.props.rewards || [];
    const myRewards = this.props.myRewards || [];
    return (
        <Grid>
          <Row>
            <Col md={12}>
              <Panel>
                <Panel.Heading>
                  Available
                </Panel.Heading>
                <Panel.Body>
                  {rewards.map(reward => reward.ownerId=="0" &&
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
              <Panel>
                <Panel.Heading>
                  Mine (offered)
                </Panel.Heading>
                <Panel.Body>
                  {rewards.map(reward => reward.vendorId==this.props.user.ykid &&
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
              <Panel>
                <Panel.Heading>
                  Mine (owned)
                </Panel.Heading>
                <Panel.Body>
                  {myRewards.map(reward =>
                    <Row key={reward.id}>
                      <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                      <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
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
    myRewards: state.myRewards || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAvailableRewards: () => dispatch(loadAvailableRewards()),
    loadMyRewards: () => dispatch(loadMyRewards()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rewards);
