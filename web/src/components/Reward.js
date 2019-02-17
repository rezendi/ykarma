import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
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
    const received = this.props.user.received;
    if (!received) {
      return "nada";
    }
    var spendable = 0;
    const tag = this.props.reward.tag;
    for (var i=0; i < received.length; i++) {
      if (received[i].tags.indexOf(tag) >= 0) {
        spendable += received[i].available;
      }
    }
    return spendable;
  };

  doPurchase = async () => {
    this.props.setLoading(true);
    Api.purchaseReward(this.props.reward.id).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        return alert(this.props.t("Server error!"));
      }
      res.json().then(json => {;
        if (json.success) {
          this.props.history.push('/user/rewards');
        } else {
          alert(this.props.t("Server failure!") + " " + JSON.stringify(json));
        }
      });
    });
  };

  render() {
    const { t } = this.props;
    if (this.props.reward.id === undefined) {
      return (
        <div>{t('Loading...')}</div>
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
                  <Col md={6}>
                    <i>{t('Cost:')}</i> {this.props.reward.cost} {this.props.reward.tag} {t('karma')}
                    &nbsp;
                    <i>{t('Available:')}</i> {this.props.reward.quantity}
                  </Col>
                  <Col md={6}>
                    <i>{t('Description:')}</i> {this.props.reward.metadata.description}
                  </Col>
                </Row>
                <hr/>
                <Row>
                  <Col md={12}>
                    { this.props.reward.ownerId === this.props.user.ykid &&
                    <div>You own this reward.</div> }
                    { this.props.reward.ownerId === 0 && this.getSpendable() !== "nada" && this.getSpendable() > 0 &&
                    <Button bsStyle="info" type="submit" onClick={this.doPurchase}>{t('Purchase')}</Button> }
                  </Col>
                </Row>
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

Reward = connect(mapStateToProps, mapDispatchToProps)(Reward);

export default withTranslation()(Reward);