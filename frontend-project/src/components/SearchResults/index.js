import { Component } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Cookies from "js-cookie";

class SearchResults extends Component {
  followUser = (followingID) => {
    this.createUserFollow(followingID);
  };

  createUserFollow = async (followingID) => {
    const jwtToken = Cookies.get("jwt_token");

    const response = await axios.post(
      "http://localhost:8000/users/follow",
      {
        followingID,
        id: uuidv4(),
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  };

  render() {
    const { usersList } = this.props;

    if (usersList.length === 0) {
      return <li>No User Found</li>;
    }

    return usersList.map((eachEle) => (
      <li key={eachEle.username}>
        <p>{eachEle.username}</p>
        <button type="button" onClick={() => this.followUser(eachEle.id)}>
          Follow
        </button>
      </li>
    ));
  }
}

export default SearchResults;
