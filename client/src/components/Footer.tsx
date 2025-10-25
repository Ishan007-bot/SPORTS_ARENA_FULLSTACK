import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div className="footer-top">
        <p className="footer-issue-text">
          If you find any issues, please contact the <a href="https://www.linkedin.com/in/ishanganguly01/" className="developer-link">developer here</a>.
        </p>
      </div>
      
      <div className="footer-content">
        <div className="footer-section about-section">
          <h3 className="section-title">About Sports Arena</h3>
          <p className="section-description">
            I made this Project as part of my MERN Course project.
          </p>
        </div>
        
        <div className="footer-section resources-section">
          <h3 className="section-title">Resources</h3>
          <div className="footer-links">
            <a href="https://github.com/Ishan007-bot/SPORTS_ARENA_FULLSTACK" target="_blank" rel="noopener noreferrer" className="footer-link">Github</a>
            <a href="#" className="footer-link">Sports Arena Version 1</a>
          </div>
        </div>
        
        <div className="footer-section scaler-section">
          <h3 className="section-title">Scaler Resources</h3>
          <div className="footer-links">
            <a href="https://www.interviewbit.com/" target="_blank" rel="noopener noreferrer" className="footer-link">InterviewBit</a>
            <a href="https://www.scaler.com/academy/mentee-dashboard/" target="_blank" rel="noopener noreferrer" className="footer-link">Scaler</a>
            <a href="https://www.scaler.com/school-of-technology/" target="_blank" rel="noopener noreferrer" className="footer-link">Scaler School of Technology</a>
            <a href="https://www.scaler.com/school-of-business/" target="_blank" rel="noopener noreferrer" className="footer-link">Scaler School of Business</a>
          </div>
        </div>
        
        <div className="footer-section developer-section">
          <div className="developer-info">
            <div className="developer-image">
              <img src="/Scaler-pic.jpg" alt="Ishan Ganguly" className="developer-photo" />
            </div>
            <div className="developer-details">
              <h4 className="developer-title">Developer</h4>
              <p className="developer-name">Ishan Ganguly</p>
              <p className="developer-batch">Batch of '28 SST</p>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;