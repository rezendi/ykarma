import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

class Admin extends React.Component {
  state = {communities: []}
  
  componentDidMount() {
    fetch('/communities')
      .then(res => res.json())
      .then(communities => this.setState({ communities }));
  }
  
  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                Admin
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  {this.state.communities.map(community =>
                    <Col md={3} key={community.id}>
                      <Link to={`/community/${community.id}`}>{community.metadata.name}</Link>
                    </Col>
                  )}
                </Row>
                <Row>
                  <Link to='/community/new'>New Community</Link>
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Admin;