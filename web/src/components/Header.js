import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUser } from '../store/data/actions'
import { Navbar, Nav, NavItem } from 'react-bootstrap'
import { auth } from '../firebase'

class Header extends React.Component {
  
  componentDidMount() {
      this.props.fetchUser();
      this.setState({start: (new Date()).getTime()})
  }
  
  poll = () => {
    console.log("polling");
    if (auth.tokenPosted() && this.props) {
      this.props.fetchUser();
      clearInterval(this.polling);
      console.log("fetched user");
    }
    var diff = (new Date()).getTime() - this.state.start
    // console.log("diff", diff);
    if (diff > 8000) {
      clearInterval(this.polling);
    }
  }
  
  polling = setInterval(this.poll, 400);

  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/'>YKarma</Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          { !this.props.user || !this.props.user.uid ?
              <NavItem key='login' href='/login'> Login</NavItem>
          : [
              <NavItem key='signout' href='/signOut'>Sign Out</NavItem>,
              <NavItem key='profile' href='/profile'>Profile</NavItem>,
              <NavItem key='rewards' href='/user/rewards'>Rewards</NavItem>
          ]}
          { this.props.user && this.props.user.isAdmin ?
            [
              <NavItem key='admin' href='/admin'>Admin</NavItem>
            ]
          : null}
        </Nav>
      </Navbar>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchUser: () => dispatch(fetchUser()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
