import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand footer-brand-link">
            <span className="brand-mark">♧</span>
            <span><strong>Made By Her</strong><small>Rural Hands. Brighter Tomorrows.</small></span>
          </Link>
          <p>Handmade • Rural • Real Change</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/our-women">Our Women</Link>
          <Link to="/our-story">Our Story</Link><Link to="/village-partners">Village Partners</Link><Link to="/impact">Impact</Link>
        </div>
        <div>
          <h4>Help</h4>
          <a href="#faq">FAQs</a><a href="#shipping">Shipping & Delivery</a><a href="#returns">Returns & Refunds</a><a href="#contact">Contact Us</a>
        </div>
        <div>
          <h4>Stay Connected</h4>
          <form className="newsletter" onSubmit={e => e.preventDefault()}>
            <input placeholder="Enter your email" type="email" />
            <button><ArrowRight size={16}/></button>
          </form>
          <div className="socials"><Facebook size={15}/><Instagram size={15}/><Youtube size={15}/></div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 Made By Her. All rights reserved.</span>
        <span>Handmade &nbsp; • &nbsp; Rural &nbsp; • &nbsp; Real Change</span>
      </div>
    </footer>
  );
}