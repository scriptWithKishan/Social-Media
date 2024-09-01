import { Component } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import Header from "../Header";
import UpdateProfile from "../UpdateProfile";

class Profile extends Component {
  state = {
    userDetails: {},
    showUpdate: false,
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
      const data = response.data;

      const updatedData = {
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        bio: data.bio,
        profileImage: data.profile_image,
      };
      this.setState({ userDetails: updatedData });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  showUpdate = () => {
    this.setState({ showUpdate: true });
  };

  render() {
    const { userDetails, showUpdate } = this.state;

    return (
      <>
        <Header />
        <div className="profile-container">
          <h1>Profile</h1>
          <button type="button" onClick={this.showUpdate}>
            Update Profile
          </button>
          {showUpdate && <UpdateProfile />}
          <img src={userDetails.profileImage} />
          <p>
            {userDetails.firstName} {userDetails.lastName}
          </p>
        </div>
      </>
    );
  }
}

export default Profile;
