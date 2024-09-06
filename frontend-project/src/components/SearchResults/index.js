import { Component } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Cookies from "js-cookie";

class SearchResults extends Component {
  state = {
    isFollowing: false,
  };

  componentDidMount() {
    this.checkFollowStatus();
  }

  checkFollowStatus = async () => {
    const { searchDetails } = this.props;
    const jwtToken = Cookies.get("jwt_token");

    try {
      const response = await axios.get(
        `http://localhost:8000/users/${searchDetails.id}/follow-status`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      this.setState({ isFollowing: response.data.isFollowing });
    } catch (err) {
      console.log("Error checking follow status", err);
    }
  };

  toggleFollow = async () => {
    const { isFollowing } = this.state;
    const { searchDetails } = this.props;
    const jwtToken = Cookies.get("jwt_token");

    try {
      if (isFollowing) {
        await axios.delete("http://localhost:8000/users/unfollow", {
          data: { followingID: searchDetails.id },
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      } else {
        await axios.post(
          "http://localhost:8000/users/follow",
          { followingID: searchDetails.id, id: uuidv4() },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
      }
      this.setState((prevState) => ({
        isFollowing: !prevState.isFollowing,
      }));
    } catch (err) {
      console.log("Error in follow/unfollow feature", err);
    }
  };

  render() {
    const { searchDetails } = this.props;
    const { isFollowing } = this.state;

    return (
      <li>
        <p>{searchDetails.username}</p>
        <button type="button" onClick={this.toggleFollow}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </li>
    );
  }
}

export default SearchResults;
