import React from "react";
import "./landingPage.css";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing_container">
      <h1>Mesh</h1>
      <div className="landing_centre">
        <h1 className="title">Connecting all the things you learn together</h1>
        <p className="description">
          Tired of learning tidbits of information and never seeing the big
          picture? Mesh is the mindmapping tool for education.
        </p>
        <Link to={`/signup`}>
          <button className="button_getStarted">Get Started</button>
        </Link>
      </div>
      <div style={{ height: "50rem" }}></div>
      <footer>
        <div className="footer_container">
          <div className="footer-content">
            <p>&copy; 2023 Mesh</p>
            <ul className="footer-links">
              <li>
                <a className="footer_link" href="#">
                  Home
                </a>
              </li>
              <li>
                <a className="footer_link" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="footer_link" href="#">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* <div>Insert image here</div> */}
    </div>
  );
}

export default LandingPage;
