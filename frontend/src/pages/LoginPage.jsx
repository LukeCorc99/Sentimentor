import { useState } from 'react';
import { Lock, Mail, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail  } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/search');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginFailed(true);
    }
  };

  const handleRegistration = async (data) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      navigate('/search');
    } catch (error) {
      console.error('Registration failed:', error);
      setLoginFailed(true);
    }
  };

  const handleForgotPassword = async (email) => {
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
    <div className="login-container">
      <form onSubmit={handleSubmit(handleLogin)} className="login-form">
        <div className="lockIcon" style={{ marginBottom: '20px' }}>
          <Lock style={{ fontSize: 30 }} />
        </div>
        <h2>Login</h2>

        <div className="input-group">
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
        {errors.email && <p className="error-message">{errors.email.message}</p>}

        <div className="input-group">
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
        {errors.password && <p className="error-message">{errors.password.message}</p>}

        <button type="submit" className="login-button signin">
          Sign In
        </button>
        <button type="button" onClick={handleSubmit(handleRegistration)} className="login-button register">
          Create Account
        </button>

        {loginFailed && <p className="error-message">Login or registration failed. Please try again.</p>}

        {/* Forgot Password Section */}
        <div className="forgot-password-section">
          <button
            type="button"
            className="forgot-password-button"
            onClick={() => handleForgotPassword(getValues('email'))}
          >
            Forgot Password?
          </button>
          {resetMessage && <p className="reset-message">{resetMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
