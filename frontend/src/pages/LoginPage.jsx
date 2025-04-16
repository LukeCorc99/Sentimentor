import { useState } from 'react';
import { Mail, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail  } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

// Login screen
const LoginPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm();

  // State variables for password visibility, login failure, and reset message
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Hook to navigate between routes
  const navigate = useNavigate();

  // Handle login
  const login = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/search');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginFailed(true);
    }
  };

  // Handle registration
  const registration = async (data) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      navigate('/search');
    } catch (error) {
      console.error('Registration failed:', error);
      setLoginFailed(true);
    }
  };

  // Handles password reset. Sends an email to the user to reset password
  const forgotPassword = async (email) => {
    try {
      if (!email) {
        setResetMessage('Please enter your email to reset your password.');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setResetMessage('Error: Unable to send password reset email.');
    }
  };

  return (
    <div className="loginContainer">
      <form onSubmit={handleSubmit(login)} className="loginForm">
       
        
        <div className="welcomeSection">
          <h1 className="welcomeHeader">Welcome to Sentimentor</h1>
          <p className="welcomeText">Create an account or sign in if you already have one</p>
          <p className="appDescription">Analyze and compare product reviews with AI-powered sentiment analysis.</p>
        </div>

        <div className="inputGroup">
          <div className="icon">
            <Mail />
          </div>
          <input
            type="text"
            placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' }
            })}
          />
        </div>
        {errors.email && <p className="errorMessage">{errors.email.message}</p>}

        <div className="inputGroup">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          <IconButton onClick={() => setPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </div>
        {errors.password && <p className="errorMessage">{errors.password.message}</p>}

        <button type="submit" className="loginButton signin">
          Sign In
        </button>
        <button type="button" onClick={handleSubmit(registration)} className="loginButton register">
          Create Account
        </button>

        {loginFailed && <p className="errorMessage">Login or registration failed. Please try again.</p>}

        <div className="forgotPasswordSection">
          <button
            type="button"
            className="forgotPasswordButton"
            onClick={() => forgotPassword(getValues('email'))}
          >
            Forgot Password?
          </button>
          {resetMessage && <p className="resetMessage">{resetMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;