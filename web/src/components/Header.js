import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUser } from '../store/data/actions'
import { Navbar, Nav, NavItem } from 'react-bootstrap'

class Header extends React.Component {
  
  componentDidMount() {
    this.props.fetchUser();
  }
  
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
              <NavItem href='/login'> Login</NavItem>
          : [
              <NavItem href='/signOut'>Sign Out</NavItem>,
              <NavItem href='/profile'>Profile</NavItem>,
              <NavItem href='/user/rewards'>Rewards</NavItem>
          ]}
          { this.props.user && this.props.user.isAdmin ?
            [
              <NavItem href='/admin'>Admin</NavItem>
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
