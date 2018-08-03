import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { loadReward, setLoading } from '../store/data/actions'
import RewardForm from './RewardForm';
import Api from '../store/Api';

class Reward extends React.Component {
  componentDidMount() {
    this.setState({editing: false});
    this.props.loadReward(this.props.match.params.id);
  }
  
  toggleEditing = () => {
    this.setState({editing: this.state.editing ? false : true});
  };
  
  getSpendable = () => {
    if (!this.props.user.received || !this.props.user.received.tags) {
      return "nada";
    }
    var spendable = 0;
    const tags = this.props.user.received.tags;
    const tag = this.props.reward.tag;
    for (var i=0; i < tags.length; i++) {
      if (tags[i].indexOf(tag) >= 0) {
        spendable += this.props.user.received.amounts[i];
      }
    }
    return spendable;
  };

  doPurchase = async () => {
    this.props.setLoading(true);
    Api.purchaseReward(this.props.reward.id).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        return alert("Server error!");
      }
      res.json().then(json => {;
        if (json.success) {
          this.props.history.push('/user/rewards');
        } else {
          alert("Server failure! " + JSON.stringify(json));
        }
      });
    });
  };

  render() {
    if (this.props.reward.id === undefined) {
      return (
        <div>Loading...</div>
      );
    }
    if (this.state && this.state.editing) {
      return (
        <RewardForm reward = {this.props.reward}/>
      );
    }
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.reward.metadata.name} { this.props.user.ykid===this.props.reward.vendorId && <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>}
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <div>Description: {this.props.reward.metadata.description}</div>
                  <div>Quantity: {this.props.reward.quantity} Cost: {this.props.reward.cost} {this.props.reward.tag} karma</div>
                </Row>
                { this.props.reward.ownerId === this.props.user.ykid &&
                <Row>
                  You own this reward.
                </Row>
                }
                { this.props.reward.ownerId === 0 &&
                <Row>
                  You have {this.getSpendable()} "{this.props.reward.tag}" karma to spend
                </Row>}
                { this.props.reward.ownerId === 0 && this.getSpendable() !== "nada" && this.getSpendable() > 0 &&
                <Row>
                  <Button type="submit" onClick={this.doPurchase}>Purchase</Button>
                </Row>
                }
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
    reward: state.rewards.reward
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadReward: (rewardId) => dispatch(loadReward(rewardId)),
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reward);
