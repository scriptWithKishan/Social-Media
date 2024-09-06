import { Component } from "react";
import Cookies from "js-cookie";
import axios from "axios";

import Header from "../Header";

class Home extends Component {
  state = {
    feedDetails: [],
  };

  componentDidMount() {
    this.getPostDetails();
  }

  getPostDetails = async () => {
    const jwtToken = Cookies.get("jwt_token");

    try {
      const response = await axios.get("http://localhost:8000/feeds", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const updatedData = response.data.map((eachEle) => ({
        id: eachEle.id,
        content: eachEle.content,
        image: eachEle.image,
        createdAt: eachEle.created_at,
      }));

      this.setState({ feedDetails: response.data });
    } catch (err) {
      console.log(err.response.data);
    }
  };

  render() {
    return (
      <>
        <Header />
        <div className="home-container">
          <h1>Home</h1>
          <div>{}</div>
        </div>
      </>
    );
  }
}

export default Home;
