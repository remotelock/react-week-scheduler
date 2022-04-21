import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calender from './Calender';
import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.auth_token) {
      navigate('/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="container">
      <div className="logout-button">
        <Button
          onClick={handleLogout}
          variant="outlined"
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </div>
      <Calender />
    </div>
  );
}
