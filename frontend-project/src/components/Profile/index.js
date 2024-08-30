import { Component } from "react";
import axios from "axios";
import Cookies from "js-cookie";

class Profile extends Component {
  state = {
    userDetails: {},
  };

  componentDidMount() {
    this.getUserDetails();
  }

  getUserDetails = async () => {
    try {
      const jwtToken = Cookies.get("jwt_token");
      const response = await axios.get("http://localhost:8000/profile", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      console.log(response);
      this.setState({ userDetails: response.data });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  render() {
    const { userDetails } = this.state;

    return (
      <div className="profile-container">
        <h1>Profile</h1>
      </div>
    );
  }
}

export default Profile;
