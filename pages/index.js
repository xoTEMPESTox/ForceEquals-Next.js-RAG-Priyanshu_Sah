import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null); // New state for PDF URL

  // Effect to create and revoke object URL for PDF display
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url); // Clean up URL when component unmounts or file changes
    } else {
      setPdfUrl(null);
    }
  }, [file]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'X-PROTECTED-KEY': process.env.NEXT_PUBLIC_PROTECTED_API_KEY || 'changeme'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setUploadResponse(data);
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!question) {
      setError('Please enter a question');
      return;
    }
    
    if (!sessionId) {
      setError('Please upload a PDF first');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PROTECTED-KEY': process.env.NEXT_PUBLIC_PROTECTED_API_KEY || 'changeme'
        },
        body: JSON.stringify({ session_id: sessionId, question })
      });

      if (!response.ok) {
        throw new Error(`Ask failed: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      console.error('Ask error:', error);
      setError(`Ask error: ${error.message}`);
    }
    setLoading(false);
  };

  const themeStyles = {
    backgroundColor: '#1a202c',
    color: '#e2e8f0',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const cardStyles = {
    backgroundColor: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const inputStyles = {
    flex: 1,
    padding: '0.75rem',
    marginBottom: '0',
    border: '1px solid #4a5568',
    borderRadius: '0.375rem',
    backgroundColor: '#4a5568',
    color: '#e2e8f0',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
    outline: 'none',
  };

  const buttonStyles = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, opacity 0.3s ease, transform 0.1s ease',
    opacity: loading ? 0.7 : 1,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };

  const primaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#6366f1',
    color: 'white',
    '&:hover': {
      backgroundColor: '#4f46e5',
    },
  };

  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#4a5568',
    color: '#e2e8f0',
    '&:hover': {
      backgroundColor: '#2d3748',
    },
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
      <div style={{
        ...themeStyles,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: '1.5rem',
        padding: '1.5rem',
        boxSizing: 'border-box',
        width: '100vw',
        minHeight: '100vh',
      }}>
      <h1 style={{ textAlign: 'center', color: themeStyles.color, fontSize: '2.5rem', paddingBottom: '1rem' }}>Mini PDF Q&A App</h1>

      {error && (
        <div style={{ backgroundColor: '#f56565', color: 'white', padding: '1rem', borderRadius: '0.375rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {!uploadResponse && (
            <div style={{ ...cardStyles, flex: 1, border: '2px dashed #6366f1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h2 style={{ marginBottom: '1.5rem', color: themeStyles.color, fontSize: '1.75rem' }}>Upload PDF</h2>
              <div style={{ marginBottom: '1rem', width: '80%' }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{ ...inputStyles, padding: '0.5rem' }}
                />
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  style={primaryButtonStyles}
                >
                  {loading ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>
            </div>
          )}

          {uploadResponse && file && (
            <div style={{ ...cardStyles, flex: 1, overflow: 'auto' }}>
              <h2 style={{ marginBottom: '1.5rem', color: themeStyles.color, fontSize: '1.75rem' }}>PDF Stats</h2>
              <p><strong>Filename:</strong> {file.name}</p>
              <p><strong>File Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
              <p><strong>Session ID:</strong> {uploadResponse.session_id}</p>
              <p><strong>Number of chunks:</strong> {uploadResponse.num_chunks}</p>
              <p><strong>Approximate characters:</strong> {uploadResponse.approx_chars}</p>
            </div>
          )}
        </div>

        {uploadResponse && file && pdfUrl && (
          <div style={{ ...cardStyles, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h2 style={{ marginBottom: '1.5rem', color: themeStyles.color, fontSize: '1.75rem', textAlign: 'center' }}>PDF Display</h2>
            <div style={{ border: '2px dashed #6366f1', padding: '1rem', borderRadius: '0.5rem', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: themeStyles.color }}>
              <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{file.name}</p>
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none', flex: 1 }}
                title="PDF Viewer"
              >
                This browser does not support PDFs. Please download the PDF to view it: <a href={pdfUrl}>Download PDF</a>
              </iframe>
            </div>
          </div>
        )}
      </div>

      <div style={{ ...cardStyles, maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', color: themeStyles.color, fontSize: '1.75rem' }}>Ask Question</h2>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question about the PDF"
            disabled={loading || !sessionId}
            style={inputStyles}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question || !sessionId}
            style={primaryButtonStyles}
          >
            {loading ? 'Asking...' : 'Ask Question'}
          </button>
        </div>

        {answer && (
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '0.375rem', backgroundColor: '#4a5568', color: themeStyles.color }}>
            <h3 style={{ marginBottom: '1rem', color: themeStyles.color, fontSize: '1.25rem' }}>Answer:</h3>
            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{answer}</p>

            {sources.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: themeStyles.color, fontSize: '1.125rem' }}>Sources:</h4>
                {sources.map((source, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '0.375rem', backgroundColor: '#2d3748', border: '1px solid #4a5568', color: themeStyles.color }}>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Chunk ID:</strong> {source.chunk_id}</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Similarity Score:</strong> {source.score.toFixed(4)}</p>
                    <p><strong>Snippet:</strong> {source.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}