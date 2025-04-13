import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import Webnavbar from './webnavbar';
import Footer from './footer';

const AboutUs = () => {
  const [aboutData, setAboutData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch About Us data on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/aboutpage")
      .then((response) => {
        // If you want the latest item, sort by the 'createdAt' field or reverse the data if necessary
        const sortedData = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAboutData(sortedData);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load About Us data");
      });
  }, []);

  // If there is data, use the latest (or first item)
  const latestAboutUs = aboutData[0];  // The most recent entry based on 'createdAt'

  return (
    <>
      <Webnavbar />
      <Container className="my-5">
        <div className="text-center mb-5">
          <h1 className="display-4">About TelSet</h1>
          <p className="lead">Your Ultimate Destination for Television Excellence</p>
        </div>

        <div className="row align-items-center">
          <div className="col-md-6">
            <img 
              src={latestAboutUs && latestAboutUs.image ? `http://localhost:5000${latestAboutUs.image}` : "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85"} 
              alt="Television Collection" 
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            {latestAboutUs ? (
              <>
                <h2 className="mb-4">{latestAboutUs.title}</h2>
                <p className="text-muted">{latestAboutUs.description}</p>
              </>
            ) : (
              <p>Loading About Us information...</p>
            )}

            <p className="text-muted">
              Our mission is to transform your viewing experience through innovative 
              technology, expert recommendations, and unparalleled customer service. 
              Whether you're a cinephile, sports enthusiast, or casual viewer, we have 
              the perfect screen for your needs.
            </p>

            <div className="mt-4">
              <h3>Why Choose Us?</h3>
              <ul className="list-unstyled">
                <li className="mb-2">&#10004; 10+ Years Industry Experience</li>
                <li className="mb-2">&#10004; 5000+ Satisfied Customers</li>
                <li className="mb-2">&#10004; Free Installation & Setup</li>
                <li className="mb-2">&#10004; 5-Year Warranty on All Products</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </>
  );
};

export default AboutUs;
