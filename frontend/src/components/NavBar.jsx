import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { FaHome, FaBookmark, FaBalanceScale, FaUserCircle, FaPowerOff } from 'react-icons/fa';
import '../styles/NavBar.css';

const NavBar = () => {
  const [userEmail, setUserEmail] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="signout-btn" onClick={handleSignOut}>
          <FaPowerOff className="icon" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="nav-center">
        <div className="segment">
          <Link to="/search" className="segment-btn">
            <FaHome className="icon" />
            <span>Home</span>
          </Link>
          <Link to="/saved" className="segment-btn">
            <FaBookmark className="icon" />
            <span>Saved Products</span>
          </Link>
          <Link to="/compare" className="segment-btn">
            <FaBalanceScale className="icon" />
            <span>Compare Products</span>
          </Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="popover-container">
          {showPopover && (
            <div className="popover">
              <p>Currently logged in as:</p>
              <p><strong>{userEmail || 'Guest'}</strong></p>
            </div>
          )}
          <button className="account-btn" onClick={() => setShowPopover(!showPopover)}>
            <FaUserCircle className="icon" />
            <span>Account</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
