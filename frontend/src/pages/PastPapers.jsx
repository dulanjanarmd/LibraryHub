import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { pastPapersAPI } from '../services/api';
import { Spinner } from 'react-bootstrap';
import { FiEye, FiDownload, FiTrash2, FiFolder, FiFolderMinus, FiFolderPlus, FiExternalLink, FiSearch, FiFileText } from 'react-icons/fi';

const emptyForm = {
  title: '',
  academicYear: '1st Year',
  academicSemester: '1',
  semester: '1',
  intakeBatch: '2024 January',
  faculty: '',
  degreeLevel: 'Undergraduate',
  courseCode: '',
  courseName: '',
  department: '',
  examType: 'End Semester',
  description: ''
};
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ACADEMIC_SEMESTERS = ['1', '2'];
const FACULTIES = ['Faculty of Computing', 'Faculty of Business', 'Faculty of Engineering', 'Faculty of Humanities and Science', 'Faculty of Architecture', 'Faculty of Law'];
const DEGREE_LEVELS = ['Undergraduate', 'Postgraduate'];
const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Quiz', 'Assignment', 'Mock Exam', 'Repeat'];

const PastPapers = () => {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ years: [], semesters: [], degreeLevels: [], faculties: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedIntakeBatch, setSelectedIntakeBatch] = useState('');
  const [searchModule, setSearchModule] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewBlob, setViewBlob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});

  // Global or configurable OneDrive base URL
  const [oneDriveBaseUrl, setOneDriveBaseUrl] = useState(() => {
    return localStorage.getItem('past_papers_onedrive_url') || 'https://onedrive.live.com';
  });
  const [showOneDriveConfig, setShowOneDriveConfig] = useState(false);
  const [tempOneDriveUrl, setTempOneDriveUrl] = useState(oneDriveBaseUrl);

  const saveOneDriveUrl = () => {
    const trimmed = tempOneDriveUrl.trim() || 'https://onedrive.live.com';
    setOneDriveBaseUrl(trimmed);
    localStorage.setItem('past_papers_onedrive_url', trimmed);
    setShowOneDriveConfig(false);
    setSuccess('OneDrive link updated');
    setTimeout(() => setSuccess(''), 3000);
  };

  const openOneDriveForSubject = (subjectName, courseCode) => {
    const term = courseCode || subjectName || '';
    const cleanBase = oneDriveBaseUrl.trim();
    // If it's a direct link to a folder or search link
    let targetUrl = cleanBase;
    if (term) {
      if (cleanBase.includes('sharepoint.com') || cleanBase.includes('onedrive.live.com')) {
        const separator = cleanBase.includes('?') ? '&' : '?';
        targetUrl = `${cleanBase}${separator}q=${encodeURIComponent(term)}`;
      }
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFolder = (key) => {
    setExpandedFolders(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  useEffect(() => { load(); }, [selectedFaculty, selectedDegreeLevel, selectedYear, selectedSem, selectedIntakeBatch, searchModule]);

  const load = async () => {
    try {
      setLoading(true);
      const [fRes, pRes] = await Promise.all([
        pastPapersAPI.getFilters().catch(() => ({ data: { years: [], semesters: [], degreeLevels: [], faculties: [] } })),
        (selectedFaculty || selectedDegreeLevel || selectedYear || selectedSem || selectedIntakeBatch || searchModule) 
          ? pastPapersAPI.filter(selectedYear || null, selectedSem || null, selectedDegreeLevel || null, selectedFaculty || null, selectedIntakeBatch || null, searchModule || null) 
          : pastPapersAPI.getAllPublic(),
      ]);
      if (fRes?.data) setFilters({ 
        years: fRes.data.years || [], 
        semesters: fRes.data.semesters || [],
        degreeLevels: fRes.data.degreeLevels || [],
        faculties: fRes.data.faculties || []
      });
      setPapers(Array.isArray(pRes.data) ? pRes.data : []);
    } catch { setError('Failed to load past papers'); } finally { setLoading(false); }
  };

  const clearFilters = () => { setSelectedFaculty(''); setSelectedDegreeLevel(''); setSelectedYear(''); setSelectedSem(''); setSelectedIntakeBatch(''); setSearchModule(''); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file'); return; }
    if (!form.academicYear || !form.academicSemester || !form.semester || !form.intakeBatch || !form.faculty || !form.degreeLevel) {
      setError('Academic year, academic semester, semester, intake, faculty, and degree level are required');
      return;
    }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if (form[k]) fd.append(k, form[k]); });
      fd.append('file', pdfFile);
      await pastPapersAPI.upload(fd);
      setSuccess('Past paper uploaded successfully');
      setShowUpload(false); setForm(emptyForm); setPdfFile(null); load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { 
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed'); 
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this past paper?')) return;
    try { await pastPapersAPI.delete(id); setSuccess('Paper deleted'); load(); setTimeout(() => setSuccess(''), 4000); }
    catch { setError('Delete failed'); }
  };

  const handleDownload = async (paper) => {
    try {
      const res = await pastPapersAPI.download(paper.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', `${paper.courseCode || paper.title}_${paper.academicYear}_${paper.semester}.pdf`.replace(/\s+/g, '_'));
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError('Download failed'); }
  };

  const handleView = async (paper) => {
    try {
      setViewLoading(true); setViewing(paper); setViewBlob(null);
      const res = await fetch(`${API}/past-papers/view/${paper.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('View failed');
      const blob = await res.blob();
      setViewBlob(URL.createObjectURL(blob));
    } catch { setError('Failed to open PDF viewer'); setViewing(null); setViewBlob(null); }
    finally { setViewLoading(false); }
  };

  const closeViewer = () => {
    if (viewBlob) URL.revokeObjectURL(viewBlob);
    setViewing(null); setViewBlob(null);
  };

  const grouped = useMemo(() => {
    const g = {};
    papers.forEach(p => {
      const key = `${p.academicYear}__${p.academicSemester || p.semester}__${p.semester}`;
      if (!g[key]) g[key] = [];
      g[key].push(p);
    });
    const keys = Object.keys(g).sort((a, b) => {
      const [ya, sa] = a.split('__');
      const [yb, sb] = b.split('__');
      if (ya !== yb) return yb.localeCompare(ya);
      return sa.localeCompare(sb);
    });
    return { groups: g, keys };
  }, [papers]);

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }} className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #ef5a24 100%)', borderRadius: 20, padding: '28px 36px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, marginBottom: 4 }}>Past Papers Archive</h1>
          <p style={{ opacity: 0.8, margin: 0, fontSize: '0.86rem' }}>Past exam papers by year, semester, and course — read online or download</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => setShowOneDriveConfig(true)}
            title="Configure OneDrive / Cloud Storage Link"
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)', 
              borderRadius: 10, 
              padding: '10px 18px', 
              fontWeight: 600, 
              fontSize: '0.84rem', 
              cursor: 'pointer', 
              fontFamily: 'Poppins, sans-serif', 
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <span>☁️</span> OneDrive Link
          </button>
          {isLibrarian && (
            <button onClick={() => setShowUpload(true)} style={{ background: 'white', color: '#7c2d12', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              Upload Past Paper
            </button>
          )}
        </div>
      </div>

      {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#065f46', fontSize: '0.87rem', fontWeight: 500 }}>{success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#b91c1c', fontSize: '0.87rem', fontWeight: 500 }}>{error}</div>}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Faculty</label>
            <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} style={inputStyle}>
              <option value="">All Faculties</option>
              {(filters.faculties.length ? filters.faculties : FACULTIES).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Degree Level</label>
            <select value={selectedDegreeLevel} onChange={e => setSelectedDegreeLevel(e.target.value)} style={inputStyle}>
              <option value="">All Levels</option>
              {(filters.degreeLevels.length ? filters.degreeLevels : DEGREE_LEVELS).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Academic Year</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={inputStyle}>
              <option value="">All Years</option>
              {(filters.years.length ? filters.years : ACADEMIC_YEARS).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Semester</label>
            <select value={selectedSem} onChange={e => setSelectedSem(e.target.value)} style={inputStyle}>
              <option value="">All Semesters</option>
              {(filters.semesters.length ? filters.semesters : ACADEMIC_SEMESTERS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Intake</label>
            <input 
              type="text" 
              value={selectedIntakeBatch} 
              onChange={e => setSelectedIntakeBatch(e.target.value)} 
              placeholder="e.g. 2024 June, 2025 January" 
              style={inputStyle} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>Module Code/Name</label>
            <input 
              type="text" 
              value={searchModule} 
              onChange={e => setSearchModule(e.target.value)} 
              placeholder="Search by code or name..." 
              style={inputStyle} 
            />
          </div>
          <button onClick={clearFilters} style={{ padding: '12px 20px', background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e8ecf0', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '80px 0' }}><Spinner animation="border" style={{ color: '#ef5a24' }} /></div> : papers.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📁</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No past papers found</div>
          <div style={{ fontSize: '0.88rem' }}>Try clearing filters or check back later.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {grouped.keys.map(key => {
            const [y, aSem, s] = key.split('__');
            const isFolderOpen = expandedFolders[key] !== false; // open by default
            const folderPapers = grouped.groups[key];

            return (
              <div 
                key={key} 
                style={{ 
                  background: 'white', 
                  borderRadius: 16, 
                  border: '1px solid #e8ecf0', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Folder Header */}
                <div 
                  onClick={() => toggleFolder(key)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 22px', 
                    background: isFolderOpen ? '#fff7ed' : '#ffffff',
                    borderBottom: isFolderOpen ? '1px solid #fed7aa' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isFolderOpen ? '#ffedd5' : '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isFolderOpen ? '#fff7ed' : '#ffffff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 42, 
                      height: 42, 
                      borderRadius: 10, 
                      background: isFolderOpen ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#f1f5f9', 
                      color: isFolderOpen ? 'white' : '#64748b',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s'
                    }}>
                      <FiFolder />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a2e' }}>
                          {y}
                        </span>
                        <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                          Semester {aSem || s}
                        </span>
                        {s && s !== (aSem || s) && (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                            {s}
                          </span>
                        )}
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 500 }}>
                          ({folderPapers.length} paper{folderPapers.length === 1 ? '' : 's'})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                        Click row subject to instantly open OneDrive folder/search
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOneDriveForSubject(`${y} Semester ${aSem || s}`, '');
                      }}
                      style={{
                        padding: '6px 14px',
                        background: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'Poppins, sans-serif',
                        boxShadow: '0 2px 6px rgba(0,120,212,0.25)'
                      }}
                      title="Open entire semester in OneDrive"
                    >
                      <span>☁️</span> OneDrive <FiExternalLink size={12} />
                    </button>
                    <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                      {isFolderOpen ? <FiFolderMinus size={18} /> : <FiFolderPlus size={18} />}
                    </div>
                  </div>
                </div>

                {/* Table View */}
                {isFolderOpen && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0', color: '#64748b', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 20px', width: 140 }}>Code</th>
                          <th style={{ padding: '12px 20px' }}>Subject / Module</th>
                          <th style={{ padding: '12px 16px', width: 130 }}>Type</th>
                          <th style={{ padding: '12px 16px', width: 150 }}>Faculty / Batch</th>
                          <th style={{ padding: '12px 16px', width: 100 }}>Size</th>
                          <th style={{ padding: '12px 20px', textAlign: 'right', width: 140 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folderPapers.map((p, idx) => (
                          <tr 
                            key={p.id}
                            style={{ 
                              borderBottom: idx === folderPapers.length - 1 ? 'none' : '1px solid #f1f5f9',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fcf8f6'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            {/* Module Code */}
                            <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                              <span style={{ 
                                fontWeight: 700, 
                                color: '#c2410c', 
                                background: '#ffedd5', 
                                padding: '3px 8px', 
                                borderRadius: 6, 
                                fontSize: '0.78rem',
                                letterSpacing: '0.4px',
                                display: 'inline-block'
                              }}>
                                {p.courseCode || 'N/A'}
                              </span>
                            </td>

                            {/* Subject / Module Title with clickable OneDrive redirect */}
                            <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                              <div 
                                onClick={() => openOneDriveForSubject(p.courseName || p.title, p.courseCode)}
                                title="Click to view in OneDrive"
                                style={{ 
                                  fontWeight: 700, 
                                  color: '#1a1a2e', 
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  transition: 'color 0.18s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#0078d4'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#1a1a2e'; }}
                              >
                                <span>{p.courseName || p.title}</span>
                                <span style={{ color: '#0078d4', fontSize: '0.75rem', opacity: 0.85, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <FiExternalLink size={13} />
                                </span>
                              </div>
                              {p.courseName && p.title && p.courseName !== p.title && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{p.title}</div>
                              )}
                              {p.description && (
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{p.description}</div>
                              )}
                            </td>

                            {/* Exam Type */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              {p.examType ? (
                                <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 9px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 600 }}>
                                  {p.examType}
                                </span>
                              ) : '—'}
                            </td>

                            {/* Faculty / Batch */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                              <div style={{ fontSize: '0.76rem', color: '#374151', fontWeight: 500 }}>
                                {p.faculty || '—'}
                              </div>
                              {p.intakeBatch && (
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>
                                  {p.intakeBatch}
                                </div>
                              )}
                            </td>

                            {/* Size */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: '#64748b', fontSize: '0.76rem' }}>
                              {p.fileSize != null ? `${(p.fileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF'}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '14px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button 
                                  onClick={() => openOneDriveForSubject(p.courseName || p.title, p.courseCode)}
                                  title="Open in OneDrive" 
                                  style={{ width: 34, height: 34, background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.color = '#0284c7'; }}
                                >
                                  <FiExternalLink size={15} />
                                </button>
                                <button 
                                  onClick={() => handleView(p)} 
                                  title="Read Online" 
                                  style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #ef5a24, #ff7a45)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s', boxShadow: '0 2px 8px rgba(239,90,36,0.2)' }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                >
                                  <FiEye size={15} />
                                </button>
                                <button 
                                  onClick={() => handleDownload(p)} 
                                  title="Download PDF" 
                                  style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #7c2d12, #c2410c)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s', boxShadow: '0 2px 8px rgba(194,65,12,0.2)' }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                >
                                  <FiDownload size={15} />
                                </button>
                                {isLibrarian && (
                                  <button 
                                    onClick={() => handleDelete(p.id)} 
                                    title="Delete" 
                                    style={{ width: 34, height: 34, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setError(''); setSuccess(''); } }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#7c2d12', margin: 0 }}>Upload Past Paper</h3>
              <button onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Faculty *</label>
                  <select required value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Degree Level *</label>
                  <select required value={form.degreeLevel} onChange={e => setForm({ ...form, degreeLevel: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Academic Year *</label>
                  <select required value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Academic Semester *</label>
                  <select required value={form.academicSemester} onChange={e => setForm({ ...form, academicSemester: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Semester *</label>
                  <select required value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={inputStyle}>
                    <option value="">Select...</option>
                    {ACADEMIC_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Intake *</label>
                  <input 
                    required 
                    value={form.intakeBatch} 
                    onChange={e => setForm({ ...form, intakeBatch: e.target.value })} 
                    placeholder="e.g. 2024 June, 2025 January" 
                    style={inputStyle} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Department</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Module Code</label><input value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. IT3010" style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Module Name</label><input value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} placeholder="e.g. Data Structures and Algorithms" style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Alternative Title (optional)</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 2024 End Semester - Data Structures" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Exam Type</label>
                  <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })} style={inputStyle}>
                    {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div></div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>Description / Notes</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Additional info about the paper (optional)" />
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 12, border: '1.5px dashed #cbd5e1', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select PDF File *</div>
                <input type="file" accept="application/pdf" required onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
                {pdfFile && <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{pdfFile.name}</div>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setShowUpload(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #7c2d12, #ef5a24)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? <Spinner size="sm" /> : 'Upload Past Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OneDrive Link Configuration Modal */}
      {showOneDriveConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowOneDriveConfig(false); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>☁️</span>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a1a2e', margin: 0 }}>OneDrive Cloud Folder</h3>
              </div>
              <button onClick={() => setShowOneDriveConfig(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}>×</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Enter the main OneDrive or SharePoint shared link for past papers. When students click any subject in the folder table, they will automatically be redirected to OneDrive.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>OneDrive / SharePoint Shared URL</label>
              <input
                type="url"
                value={tempOneDriveUrl}
                onChange={e => setTempOneDriveUrl(e.target.value)}
                placeholder="https://1drv.ms/... or https://yourorganization-my.sharepoint.com/..."
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                onClick={() => { setTempOneDriveUrl('https://onedrive.live.com'); }}
                style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Reset Default
              </button>
              <button 
                type="button" 
                onClick={() => setShowOneDriveConfig(false)} 
                style={{ flex: 1, padding: '10px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={saveOneDriveUrl} 
                style={{ flex: 1, padding: '10px 16px', background: '#0078d4', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Save URL
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 10000, padding: 20 }} onClick={e => { if (e.target === e.currentTarget) closeViewer(); }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginBottom: 12, fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,90,36,0.2)', color: '#ef5a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600 }}>{viewing.courseName || viewing.title}</div>
                <div style={{ opacity: 0.7, fontSize: '0.82rem' }}>
                  {viewing.courseCode && <span>[{viewing.courseCode}] </span>}
                  {viewing.academicYear} • Sem {viewing.academicSemester || viewing.semester} • {viewing.intakeBatch || 'Batch not set'} • {viewing.faculty || ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(viewing)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #7c2d12, #c2410c)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Download</button>
              <button onClick={closeViewer} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Close</button>
            </div>
          </div>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
            {viewLoading && !viewBlob && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontFamily: 'Poppins, sans-serif' }}>
                <Spinner animation="border" style={{ color: '#ef5a24' }} />
                <div style={{ fontWeight: 600 }}>Loading PDF viewer...</div>
              </div>
            )}
            {viewBlob && <iframe src={viewBlob} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default PastPapers;