import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';

class CommunityMember extends React.Component {

  getName = (account) => {
    return account.metadata.name || this.getUrlFrom(account.urls);
  }
  
  getUrlFrom = (urls) => {
    return (urls || '').split(',')[0].replace("mailto:","").replace("https://www.twitter.com/","@")
  }

  render() {
    return (
      <Row>
        <Col md={8}>
          <Link to={`account/${this.props.member.id}`}>{this.getName(this.props.member)}</Link>
        </Col>
        { this.props.member.id !== this.props.senderId &&
        <Col md={4}>
          Give
          &nbsp;
          <Field name={`coins-${this.props.member.id}`} component="input" type="text" size="3" placeholder="?"/>
          &nbsp;
          karma saying
          &nbsp;
          <Field name={`message-${this.props.member.id}`} component="input" type="text" size="16" maxLength="128" placeholder="Optional message"/>
          {false && JSON.stringify(this.props.member)}
        </Col>
        }
      </Row>
    );
  }
}

export default connect(null, null)(CommunityMember);
