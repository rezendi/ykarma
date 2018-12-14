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
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            { !this.props.user || !this.props.user.uid || !this.props.user.community || !this.props.user.community.id ?
                (this.props.user.community && this.props.user.community.id===0
                 ? <NavItem key='signout' href='/signOut'>Sign Out</NavItem>
                 : <NavItem key='login' href='/login'> Login</NavItem>
                )
            : [
                <NavItem key='profile' href='/profile'>Profile</NavItem>,
                <NavItem key='rewards' href='/user/rewards'>Rewards</NavItem>,
                <NavItem key='community' href={'/community/'+this.props.user.community.id}>Community</NavItem>,
                <NavItem key='signout' href='/signOut'>Sign Out</NavItem>,
            ]}
            { this.props.user && this.props.user.isAdmin ?
              [
                <NavItem key='admin' href='/admin'>Admin</NavItem>
              ]
            : null}
          </Nav>
        </Navbar.Collapse>
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
