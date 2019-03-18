import React from 'react';
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';

class Tranche extends React.Component {
  getDetailString = (dict) => {
    var name = dict.name ? dict.name : this.props.t('unknown');
    var url = (dict.urls || '').split(" ")[0];
    url = url.replace("mailto:",'');
    url = url.replace("https://twitter.com/","@");
    return `${name} (${url})`;
  };

  getSender = () => {
    if (this.props.json.sender === this.props.user.ykid) {
      return this.props.t("you");
    }
    return this.getDetailString(this.props.json.details);
  };

  getReceiver = () => {
    if (this.props.json.receiver === this.props.user.ykid) {
      return this.props.t("you");
    }
    return this.getDetailString(this.props.json.details);
  };

  render() {
    const { t } = this.props;
    return (
      <Row>
        <Col md={12}>
          <Row>
            <Col md={12}>
              &rarr;
              {this.getSender(this.props.json)} {t('sent')} {this.props.json.amount} {t('karma to')} {this.getReceiver(this.props.json)} {t('at block')} {this.props.json.block}
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

Tranche = connect(mapStateToProps, null)(Tranche)

export default withTranslation()(Tranche);
