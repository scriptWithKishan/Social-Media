import { Component } from "react";
import Cookies from "js-cookie";

import Header from "../Header";

class Home extends Component {
  render() {
    return (
      <>
        <Header />
        <div className="home-container">
          <h1>Home</h1>
        </div>
      </>
    );
  }
}

export default Home;
