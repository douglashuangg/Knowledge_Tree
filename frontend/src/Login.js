import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const url = `${mainUrl}/auth/login`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios
      .post(
        url,
        { username: email, password: password },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        navigate("/");
      })
      .catch((error) => {
        console.error("An error occurred while sending the message:", error);
      });
  };

  return (
    <>
      <Link to={`/`}>Redwood</Link>
      <div className="login_title">
        <h1 className="text-7xl pt-8">Login</h1>
      </div>
      <div className="login_container">
        <form className="login_form" onSubmit={handleSubmit}>
          <div className="login_group">
            <label className="login_label">Email:</label>
            <input
              className="login_input"
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="login_group">
            <label className="login_label">Password:</label>
            <input
              className="login_input"
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <p>Forgot your password?</p>
          </div>
          <button className="login_button" type="submit">
            Log In
          </button>
          <p>
            Don't have an account? <Link to={`/signup`}>Sign up</Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;
