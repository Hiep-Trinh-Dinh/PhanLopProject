// export async function checkAuth() {
//     try {
//       const response = await fetch('/api/auth/check', {
//         credentials: 'include'
//       });
//       return response.ok;
//     } catch {
//       return false;
//     }
//   }
  
// export async function logout() {
//     await fetch('/api/logout', {
//       method: 'POST',
//       credentials: 'include'
//     });
//     window.location.href = '/login';
//   }