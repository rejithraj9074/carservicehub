// Utility functions for authentication and role-based redirection

export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  return user.role || null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const redirectToDashboard = (role) => {
  switch (role) {
    case 'admin':
      window.location.href = '/admin/dashboard';
      break;
    case 'mechanic':
      window.location.href = '/dashboard/mechanic';
      break;
    case 'customer':
    default:
      window.location.href = '/customer';
      break;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const checkAuthAndRedirect = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  
  const role = getUserRole();
  if (!role) {
    logout();
    return false;
  }
  
  return true;
};