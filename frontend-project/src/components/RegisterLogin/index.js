import { Component } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

class RegisterLogin extends Component {
  state = {
    registerUsername: "",
    registerEmail: "",
    registerPassword: "",
    loginUsername: "",
    loginPassword: "",
    registerErr: "",
    loginErr: "",
  };

  onChangeRegisterUsername = (event) => {
    this.setState({ registerUsername: event.target.value });
  };

  onChangeRegisterEmail = (event) => {
    this.setState({ registerEmail: event.target.value });
  };

  onChangeRegisterPassword = (event) => {
    this.setState({ registerPassword: event.target.value });
  };

  onChangeLoginUsername = (event) => {
    this.setState({ loginUsername: event.target.value });
  };

  onChangeLoginPassword = (event) => {
    this.setState({ loginPassword: event.target.value });
  };

  onSubmitRegisterForm = async (event) => {
    event.preventDefault();
    const { registerUsername, registerEmail, registerPassword } = this.state;

    try {
      const response = await axios.post(
        "http://localhost:8000/users/register",
        {
          id: uuidv4(),
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }
      );
      if (response.statusText === "OK") {
        this.loginUser(registerUsername, registerPassword);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        this.setState({
          registerErr: err.response.data,
          loginErr: "",
          registerUsername: "",
          registerEmail: "",
          registerPassword: "",
        });
      } else {
        this.setState({
          registerErr: "Something went wrong. Please try again.",
          loginErr: "",
          registerUsername: "",
          registerEmail: "",
          registerPassword: "",
        });
      }
    }
  };

  onSubmitLoginForm = (event) => {
    event.preventDefault();
    const { loginUsername, loginPassword } = this.state;

    this.loginUser(loginUsername, loginPassword);
  };

  loginUser = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:8000/users/login", {
        username,
        password,
      });
      if (response.statusText === "OK") {
        this.onSuccessLogin(response.data.jwtToken);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        this.setState({ loginErr: err.response.data, registerErr: "" });
      } else {
        this.setState({
          loginErr: "Something went wrong. Please try again",
          registerErr: "",
        });
      }
    }
  };

  onSuccessLogin = (jwtToken) => {
    const { history } = this.props;

    Cookies.set("jwt_token", jwtToken, {
      expires: 30,
      path: "/",
    });
    history.replace("/");
  };

  render() {
    const {
      registerUsername,
      registerEmail,
      registerPassword,
      registerErr,
      loginUsername,
      loginPassword,
      loginErr,
    } = this.state;

    const token = Cookies.get("jwt_token");
    if (token !== undefined) {
      return <Redirect to="/" />;
    }

    return (
      <div className="register-login-container">
        <div className="register-container">
          <form onSubmit={this.onSubmitRegisterForm}>
            <h1>Register</h1>
            <input
              type="text"
              value={registerUsername}
              onChange={this.onChangeRegisterUsername}
              placeholder="Username"
            />
            <input
              type="email"
              value={registerEmail}
              onChange={this.onChangeRegisterEmail}
              placeholder="Email"
            />
            <input
              type="password"
              value={registerPassword}
              onChange={this.onChangeRegisterPassword}
              placeholder="Password"
            />
            <button type="submit">Register</button>
          </form>
          {registerErr && <p>{registerErr}</p>}
        </div>
        <div className="login-container">
          <form onSubmit={this.onSubmitLoginForm}>
            <h1>Login</h1>
            <input
              type="text"
              value={loginUsername}
              onChange={this.onChangeLoginUsername}
              placeholder="Username"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={this.onChangeLoginPassword}
              placeholder="Password"
            />
            <button type="submit">Login</button>
          </form>
          {loginErr && <p>{loginErr}</p>}
        </div>
      </div>
    );
  }
}

export default RegisterLogin;
