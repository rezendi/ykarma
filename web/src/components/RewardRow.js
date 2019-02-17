import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

class RewardRow extends React.Component {
  render() {
    const { t } = this.props;
    return (
      <Row key={this.props.reward.id}>
        <Col md={12}>
          <Link to={`/reward/${this.props.reward.id}`}>{this.props.reward.metadata.name || 'n/a'}</Link>
          &nbsp;
          <span>{t('cost')}: {this.props.reward.cost}</span>
          {this.props.reward.tag && <span> "{this.props.reward.tag}" </span>}
          <span> karma</span>
          { this.props.showAvailable && this.props.reward.ownerId === 0 &&
          <span>, {this.props.reward.quantity} {t('available')}</span> }
          { this.props.reward.ownerId > 0 && <span>, sold</span> }
        </Col>
      </Row>
    );
  }
}

export default withTranslation()(RewardRow);
