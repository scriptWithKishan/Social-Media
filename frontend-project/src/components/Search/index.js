import axios from "axios";
import { Component } from "react";
import Cookies from "js-cookie";

import Header from "../Header";
import SearchResults from "../SearchResults";

class Search extends Component {
  state = {
    searchValue: "",
    usersList: [],
    searchResult: false,
  };

  onChangeSearch = (event) => {
    this.setState({ searchValue: event.target.value });
  };

  searchUsers = (event) => {
    event.preventDefault();

    this.getUsers();
  };

  getUsers = async () => {
    const { searchValue } = this.state;
    const jwtToken = Cookies.get("jwt_token");

    try {
      const response = await axios.get(
        `http://localhost:8000/users/search?search=${searchValue}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      const updatedData = response.data.map((eachEle) => ({
        id: eachEle.id,
        username: eachEle.username,
      }));

      this.setState({ usersList: updatedData, searchResult: true });
    } catch (err) {
      console.log(err.response.data);
    }
  };

  render() {
    const { searchValue, usersList, searchResult } = this.state;

    return (
      <>
        <Header />
        <div className="search-container">
          <h1>Search</h1>
          <form onSubmit={this.searchUsers}>
            <input
              type="search"
              value={searchValue}
              onChange={this.onChangeSearch}
              placeholder="Search"
              required
            />
            <button type="submit">Search</button>
          </form>
          <ul>
            {searchResult ? (
              usersList.map((eachEle) => (
                <SearchResults key={eachEle.id} searchDetails={eachEle} />
              ))
            ) : (
              <li>Search Users</li>
            )}
          </ul>
        </div>
      </>
    );
  }
}

export default Search;
