import React from 'react';

const ContactInfo = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="section-content">
        <h2>联系我</h2>
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>example@email.com</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>123-456-7890</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>所在城市</span>
          </div>
        </div>
        <div className="social-links">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <i className="fab fa-weixin"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo; 