import React from 'react';
import { Row, Col } from 'react-bootstrap';

class Readme extends React.Component {
  render() {
    return (
      <Row>
        <Col md={12}>
          <h2>YKarma</h2>
          <p>Welcome to YKarma!</p>
          <p>YKarma is an experimental project to model reputation as a spendable currency.</p>
          <p>The basic concept: every person in a community or organization is allotted 100 "karma coins" to distribute each week. These must be given away to other people before they can be used. The recipients can then spend these coins on various rewards (a day off, a conference ticket, a coffee with someone notable, etc.)</p>
          <p>For more information, see <a href="https://github.com/rezendi/ykarma/blob/master/README.md">the project README</a> or email <a href="mailto:info@ykarma.com">info@ykarma.com</a>.</p>
        </Col>
      </Row>
    );
  }
}

export default Readme;
