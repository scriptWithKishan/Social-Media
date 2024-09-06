import { Component } from "react";
import { withRouter, Link } from "react-router-dom/cjs/react-router-dom.min";
import Cookies from "js-cookie";

class Header extends Component {
  logoutButton = () => {
    const { history } = this.props;
    Cookies.remove("jwt_token");
    history.replace("/login-register");
  };

  render() {
    return (
      <>
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/search">Search</Link>
        <Link to="/post">Post</Link>
        <button type="button" onClick={this.logoutButton}>
          Logout
        </button>
      </>
    );
  }
}

export default withRouter(Header);
