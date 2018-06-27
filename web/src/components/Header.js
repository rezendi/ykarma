import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUser } from '../store/data/actions'

class Header extends React.Component {
  
  componentDidMount() {
    this.props.fetchUser();
  }
  
  render() {
    if (!this.props.user.uid) {
      return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/login'>Login</Link></li>
            </ul>
          </nav>
        </header>
      );
    }
    if (!this.props.user.ykid) {
      return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/signOut'>Sign Out</Link></li>
            </ul>
          </nav>
        </header>
      );
    }
    if (this.props.user.isAdmin) {
      return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/signOut'>Sign Out</Link></li>
              <li><Link to='/profile'>Profile</Link></li>
              <li><Link to='/admin'>Admin</Link></li>
            </ul>
          </nav>
        </header>
      );
    }
    if (this.props.user.isCommunityAdmin) {
      return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/signOut'>Sign Out</Link></li>
              <li><Link to='/profile'>Profile</Link></li>
              <li><Link to='/account/new'>New Account</Link></li>
              <li><Link to='/vendor/new'>New Vendor</Link></li>
              <li><Link to='/user/give'>Give</Link></li>
              <li><Link to='/user/rewards'>Spend</Link></li>
            </ul>
          </nav>
        </header>
      );
    }
    if (this.props.user.isVendor) {
      return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/signOut'>Sign Out</Link></li>
              <li><Link to='/profile'>Profile</Link></li>
              <li><Link to='/vendor'>Vendor Admin</Link></li>
              <li><Link to='/reward/new'>New Reward</Link></li>
              <li><Link to='/user/give'>Give</Link></li>
              <li><Link to='/user/rewards'>Spend</Link></li>
            </ul>
          </nav>
        </header>
      );
    }
    return (
        <header>
          <nav>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/signOut'>Sign Out</Link></li>
              <li><Link to='/profile'>Profile</Link></li>
              <li><Link to='/user/give'>Give</Link></li>
              <li><Link to='/user/rewards'>Spend</Link></li>
            </ul>
          </nav>
        </header>
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
