import { Component } from "react";
import ImageUploader from "react-image-upload";
import "react-image-upload/dist/index.css";
import { RiDeleteRow } from "react-icons/ri";
import { BsCamera } from "react-icons/bs";
import axios from "axios";
import Cookies from "js-cookie";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";

class UpdateProfile extends Component {
  state = {
    firstName: "",
    lastName: "",
    bio: "",
    profileImage: null,
  };

  onChangeFirstName = (event) => {
    this.setState({ firstName: event.target.value });
  };

  onChangeLastName = (event) => {
    this.setState({ lastName: event.target.value });
  };

  onChangeBio = (event) => {
    this.setState({ bio: event.target.value });
  };

  onChangeImage = (img) => {
    this.setState({ profileImage: img.file });
  };

  onUpdateProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const { firstName, lastName, bio, profileImage } = this.state;
    const jwtToken = Cookies.get("jwt_token");

    if (firstName) formData.append("firstName", firstName);
    if (lastName) formData.append("lastName", lastName);
    if (bio) formData.append("bio", bio);
    if (profileImage) formData.append("image", profileImage);

    try {
      const response = await axios.put(
        "http://localhost:8000/update-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      window.location.reload();
    } catch (err) {
      console.log(err.response.data);
    }
  };

  render() {
    const { firstName, lastName, bio } = this.state;

    return (
      <div className="update-profile-container">
        <h1>Update Profile</h1>
        <form onSubmit={this.onUpdateProfile}>
          <ImageUploader
            style={{ height: 100, width: 100, background: "rgb(100 99 43)" }}
            deleteIcon={<RiDeleteRow />}
            uploadIcon={<BsCamera />}
            onFileAdded={this.onChangeImage}
          />
          <input
            type="text"
            value={firstName}
            onChange={this.onChangeFirstName}
            placeholder="First Name"
          />
          <input
            type="text"
            value={lastName}
            onChange={this.onChangeLastName}
            placeholder="Last Name"
          />
          <textarea
            value={bio}
            cols="20"
            rows="5"
            onChange={this.onChangeBio}
            placeholder="Bio"
          />
          <button type="submit">Save</button>
        </form>
      </div>
    );
  }
}

export default withRouter(UpdateProfile);
