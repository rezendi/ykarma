import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

import { connect } from 'react-redux'
import { loadCommunities } from '../store/data/actions'

class Admin extends React.Component {

  componentDidMount() {
    this.props.loadCommunities();
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
                  {this.props.communities.map(community =>
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

function mapStateToProps(state, ownProps) {
  return {
    communities: state.communities
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadCommunities: () => dispatch(loadCommunities()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
