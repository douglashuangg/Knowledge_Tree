import React, { useState } from "react";
import "./login.css";

function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("submitted");
  };
  return (
    <>
      <div className="login_title">
        <h1>Login or Register</h1>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label_element">
          Email:
          <input
            type="email"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="label_element">
          Password:
          <input
            type="password"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button type="submit">Login</button>
      </form>
    </>
  );
}

export default Login;
