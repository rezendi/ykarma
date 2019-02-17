import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { withTranslation, Trans } from 'react-i18next';

function Readme({ t, i18n }) {
  return (
    <Row>
      <Col md={12}>
        <h2>YKarma</h2>
        <p>{t('Welcome to YKarma!')}</p>
        <p>{t('YKarma is')}</p>
        <p>{t('The basic concept')}</p>
        <p><Trans i18nKey="For more info">For more information, see <a href="https://github.com/rezendi/ykarma/blob/master/README.md">the project README</a> or email <a href="mailto:info@ykarma.com">info@ykarma.com</a>.</Trans></p>
      </Col>
    </Row>
  );
}

export default withTranslation()(Readme);
