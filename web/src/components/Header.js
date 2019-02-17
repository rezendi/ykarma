import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next';
import { fetchUser } from '../store/data/actions'
import { Navbar, Nav, NavItem } from 'react-bootstrap'

class Header extends React.Component {
  
  componentDidMount() {
      this.props.fetchUser();
  }
  
  render() {
    const { t } = this.props;
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
                ((this.props.user.community && this.props.user.community.id===0) || this.props.user.uid
                 ? <NavItem key='signout' href='/signOut'>{t('Sign Out')}</NavItem>
                 : <NavItem key='login' href='/login'>{t('Log In')}</NavItem>
                )
            : [
                <NavItem key='profile' href='/profile'>{t('Profile')}</NavItem>,
                <NavItem key='rewards' href='/user/rewards'>{t('Rewards')}</NavItem>,
                <NavItem key='community' href={'/community/'+this.props.user.community.id}>{t('Community')}</NavItem>,
                <NavItem key='signout' href='/signOut'>{t('Sign Out')}</NavItem>,
                <NavItem key='about' href='/about'>{t('About')}</NavItem>,
            ]}
            { this.props.user && this.props.user.isAdmin ?
              [
                <NavItem key='admin' href='/admin'>{t('Admin')}</NavItem>
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

const connected = connect(mapStateToProps, mapDispatchToProps)(Header);
export default withTranslation()(connected);
