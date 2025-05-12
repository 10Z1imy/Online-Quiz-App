import React from 'react';
import './styles.css';

const SecondPage = () => {
    return (
        <div className="section page2">
            <div className="page2-container">
                {/* Contact部分 - 左上角 */}
                <section className="contact-section">
                    <div className="section-content">
                        <h2>Contact</h2>
                        <div className="contact-info">
                            <p>Email: your.email@example.com</p>
                            <p>Phone: +123 456 7890</p>
                            <div className="social-links">
                                <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
                                <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Archives部分 - 右侧 */}
                <section className="archives-section">
                    <div className="section-content">
                        <h2>Archives</h2>
                        <div className="archives-list">
                            <div className="archive-item">
                                <h3>2024</h3>
                                <ul>
                                    <li>January</li>
                                    <li>February</li>
                                    <li>March</li>
                                </ul>
                            </div>
                            <div className="archive-item">
                                <h3>2023</h3>
                                <ul>
                                    <li>October</li>
                                    <li>November</li>
                                    <li>December</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SecondPage; 