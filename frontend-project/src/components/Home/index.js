import { Component } from "react";
import Cookies from "js-cookie";

class Home extends Component {
  onClickLogout = () => {
    const { history } = this.props;

    Cookies.remove("jwt_token");
    history.replace("/login-register");
  };

  render() {
    return (
      <div className="home-container">
        <h1>Home</h1>
        <button type="button" onClick={this.onClickLogout}>
          Logout
        </button>
      </div>
    );
  }
}

export default Home;
