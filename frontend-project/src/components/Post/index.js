import axios from "axios";
import { Component } from "react";
import ImageUploader from "react-image-upload";
import "react-image-upload/dist/index.css";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

class Post extends Component {
  state = {
    postImg: null,
    content: "",
  };

  onChangeImage = (img) => {
    this.setState({ postImg: img.file });
  };

  onChangeContent = (event) => {
    this.setState({ content: event.target.value });
  };

  onPostImg = async (event) => {
    event.preventDefault();

    const { content, postImg } = this.state;
    const formData = new FormData();
    const jwtToken = Cookies.get("jwt_token");

    formData.append("content", content);
    formData.append("image", postImg);
    formData.append("id", uuidv4());

    try {
      const response = await axios.post(
        "http://localhost:8000/post",
        formData,
        {
          headers: {
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
    const { content } = this.state;

    return (
      <div>
        <h1>Post</h1>
        <form onSubmit={this.onPostImg}>
          <ImageUploader onFileAdded={this.onChangeImage} />
          <textarea
            onChange={this.onChangeContent}
            cols={30}
            rows={10}
            value={content}
            placeholder="Content"
          ></textarea>
          <button type="submit">Post</button>
        </form>
      </div>
    );
  }
}

export default Post;
