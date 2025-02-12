import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import '../styles/NavBar.css';

const NavBar = () => {
  const [userEmail, setUserEmail] = useState('');
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
      <div className="nav-links">
        <Link to="/search">Home</Link> |{' '}
        <Link to="/saved">Saved Products</Link> |{' '}
        <Link to="/compare">Compare Products</Link>
      </div>
      <div className="nav-actions">
        <span>{userEmail || 'Guest'}</span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
};

export default NavBar;