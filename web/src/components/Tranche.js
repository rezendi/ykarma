import React from 'react';
import { Row, Col } from 'react-bootstrap';

class Tranche extends React.Component {
  render() {
    return (
      <Row>
        <Col md={12}>
          {JSON.stringify(this.props.json)}
        </Col>
      </Row>
    );
  }
}

export default Tranche;
