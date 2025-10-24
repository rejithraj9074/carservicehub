// Utility functions for authentication and role-based redirection

export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  return user.role || null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const redirectToDashboard = (navigate, role) => {
  switch (role) {
    case 'admin':
      navigate('/admin/dashboard');
      break;
    case 'mechanic':
      navigate('/dashboard/mechanic');
      break;
    case 'customer':
    default:
      navigate('/customer');
      break;
  }
};

export const logout = (navigate) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Use navigate for SPA navigation instead of window.location
  if (navigate) {
    navigate('/login');
  } else {
    // Fallback to window.location if navigate is not available
    window.location.href = '/login';
  }
};

export const checkAuthAndRedirect = (navigate) => {
  if (!isAuthenticated()) {
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    return false;
  }
  
  const role = getUserRole();
  if (!role) {
    logout(navigate);
    return false;
  }
  
  return true;
};