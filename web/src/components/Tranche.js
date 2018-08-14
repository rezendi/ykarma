import React from 'react';
import { Row } from 'react-bootstrap';

class Tranche extends React.Component {
  render() {
    return (
      <Row>
        <li>{JSON.stringify(this.props.json)}</li>
      </Row>
    );
  }
}

export default Tranche;
