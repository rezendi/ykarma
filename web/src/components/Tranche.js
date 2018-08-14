import React from 'react';
import { connect } from 'react-redux'
import { Row, Col } from 'react-bootstrap';

class Tranche extends React.Component {

  getSender = () => {
    if (this.props.json.sender === this.props.user.ykid) {
      return "you";
    }
    return this.props.json.sender;
  }

  getReceiver = () => {
    if (this.props.json.receiver === this.props.user.ykid) {
      return "you";
    }
    return this.props.json.receiver;
  };

  render() {
    return (
      <Row>
        <Col md={12}>
          <Row>
            <Col md={12}>
              &rarr;
              {this.getSender(this.props.json)} sent {this.props.json.amount} "{this.props.json.tags}" karma to {this.getReceiver(this.props.json)} at block {this.props.json.block}
            </Col>
          </Row>
          { this.props.json.message &&
          <Row>
            <Col md={1}>
            </Col>
            <Col md={11}>
              saying <i>{this.props.json.message}</i>
            </Col>
          </Row>}
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

export default connect(mapStateToProps, null)(Tranche);
