import { jwtDecode } from 'jwt-decode';

export function getIdFromJWT() {
  const token = getJWT();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    console.log('Decoded JWT:', decoded);
    
    const id = 
      decoded.sub || 
      decoded.nameid || 
      decoded.userId ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded.nameIdentifier;
    
    if (id) {
      return id;
    } else {
      console.error('ID not found in JWT payload. Available fields:', Object.keys(decoded));
      return null;
    }
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function getJWT() {
  return localStorage.getItem('jwt-token');
}

export function getRoleFromJWT() {
  const token = getJWT();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    const role = 
      decoded.role || 
      decoded.roles ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
    
    if (role) {
      return role;
    } else {
      console.warn("Role not found in JWT payload");
      return null;
    }
  } catch (error) {
    console.error('Error decoding JWT role:', error);
    return null;
  }
}

export function getEmailFromJWT() {
  const token = getJWT();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.email || 
           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
           null;
  } catch (error) {
    console.error('Error decoding JWT email:', error);
    return null;
  }
}