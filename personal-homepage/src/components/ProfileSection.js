import React from 'react';
import profileImage from '../assets/images/IMG_5048.PNG';

const ProfileSection = () => {
  return (
    <section id="about" className="archives-section">
      <div className="section-content">
        <h2>Archives</h2>
        <div className="profile">
          <div className="profile-image">
            <img src={profileImage} alt="个人头像" />
          </div>
          <div className="profile-info">
            <h3>Me?</h3>
            <p>
              <ul>
                <li>
                  The Local Group of Galaxies / the Orion Arm / 
                  <br />the Milky Way Galaxy / the Solar System /
                  <br /> the Blue Planet / China /
                  <br /> Xi. Lv 19
                </li>
              </ul>
            </p>
            <div className="skills">
              <h4>Sparkling</h4>
              <ul>
                <li>Luminosity</li>
                <li>Discernment</li>
                <li>Gamified Narrative</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection; 