import React from 'react';
import { Grid } from 'react-bootstrap';
import Readme from './Readme';

class About extends React.Component {
  render() {
    return (
      <Grid>
        <Readme/>
      </Grid>
    );
  }
}

export default About;
