import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Membership() {
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState("");
  const [programme, setProgramme] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const profilePhone = localStorage.getItem('phone') || '';
    const profileFaculty = localStorage.getItem('faculty') || '';
    const profileProgramme = localStorage.getItem('programme') || '';
    setPhone(profilePhone);
    setFaculty(profileFaculty);
    setProgramme(profileProgramme);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetch('http://localhost:8080/api/membership/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fullName: localStorage.getItem('fullName'), email: localStorage.getItem('email'), phone, faculty, programme, userIdentifier: localStorage.getItem('userId') })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || 'Unable to submit application');
        return;
      }
      setMessage('Application submitted. A librarian will review and register you as a member.');
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setMessage('Server error. Try again later.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Membership Application</h1>
      <p>Please complete the form to request library membership. A librarian will review your application.</p>
      {message && <div style={{ margin: '12px 0', padding: '12px', border: '1px solid #1d3205' }}>{message}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', opacity: 0.7 }}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', height: '44px', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', opacity: 0.7 }}>Faculty</label>
          <input value={faculty} onChange={(e) => setFaculty(e.target.value)} style={{ width: '100%', height: '44px', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', opacity: 0.7 }}>Programme</label>
          <input value={programme} onChange={(e) => setProgramme(e.target.value)} style={{ width: '100%', height: '44px', padding: '8px' }} />
        </div>
        <button type="submit" style={{ padding: '12px 20px', background: '#1d3205', color: '#fff', border: 'none' }}>Submit Application</button>
      </form>
    </div>
  );
}
