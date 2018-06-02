import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

const Admin = (props) => {
  return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                Admin
              </Panel.Heading>
              <Panel.Body>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
  )
}

export default Admin