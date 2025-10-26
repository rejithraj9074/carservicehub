export const logout = (navigate) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const role = user.role;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Use navigate for SPA navigation instead of window.location
  if (navigate) {
    switch (role) {
      case 'mechanic':
        navigate('/mechanic/login');
        break;
      case 'admin':
        // Redirect admins to home page login
        navigate('/');
        break;
      case 'customer':
      default:
        navigate('/login');
        break;
    }
  } else {
    // Fallback to window.location if navigate is not available
    switch (role) {
      case 'mechanic':
        window.location.href = '/mechanic/login';
        break;
      case 'admin':
        // Redirect admins to home page login
        window.location.href = '/';
        break;
      case 'customer':
      default:
        window.location.href = '/login';
        break;
    }
  }
};