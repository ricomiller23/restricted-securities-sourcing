import React, { useState, useEffect } from 'react';

const STAGES = ["New", "Contacted", "Meeting Scheduled", "Dead"];

export default function CrmBoard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (leadId, nextStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(updated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    const note = {
      text: newNote.trim(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotes = [...(selectedLead.notes || []), note];
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updatedNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
        setSelectedLead(updated);
        setNewNote('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLead = async (leadId) => {
    if (!confirm("Are you sure you want to remove this lead from your CRM?")) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        setSelectedLead(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.status === stage);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Lead Sourcing CRM Board</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Track conversations and pipeline stages for surfaced Form 144 candidate sellers.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="status-dot" style={{ display: 'inline-block' }}></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading outreach pipeline...</p>
        </div>
      ) : (
        <div className="crm-board">
          {STAGES.map(stage => (
            <div key={stage} className="crm-column">
              <div className="column-header">
                <div className="column-title">
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 
                      stage === 'New' ? 'var(--accent-blue)' :
                      stage === 'Contacted' ? 'var(--accent-purple)' :
                      stage === 'Meeting Scheduled' ? 'var(--color-success)' : 'var(--text-muted)'
                  }}></span>
                  {stage}
                </div>
                <div className="column-count">{columns[stage].length}</div>
              </div>

              <div className="column-cards">
                {columns[stage].map(lead => (
                  <div key={lead.id} className="crm-card" onClick={() => setSelectedLead(lead)}>
                    <div className="card-top">
                      <span className="card-title">{lead.issuer}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                        {lead.score}
                      </span>
                    </div>

                    <div className="card-meta">
                      <div>Target: {lead.seller}</div>
                      <div>Size: ${lead.aggregateMktValue.toLocaleString()} ({lead.impliedPrice ? `$${lead.impliedPrice.toFixed(2)}/sh` : 'n/a'})</div>
                      {lead.issuerPhone && <div style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>📞 {lead.issuerPhone}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {lead.notes?.length || 0} logs
                      </span>
                      <select 
                        className="form-control" 
                        style={{ width: '100px', fontSize: '0.75rem', padding: '0.2rem', height: '24px' }}
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}

                {columns[stage].length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--glass-border)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No leads in {stage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Notes Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>{selectedLead.issuer} — Lead File</h3>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>Outreach & Contact info</h4>
                <p style={{ marginBottom: '0.4rem' }}><strong>Issuer Phone:</strong> <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{selectedLead.issuerPhone || 'Not available'}</span></p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Issuer Address:</strong> {selectedLead.issuerAddress || 'Not available'}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Seller Name:</strong> {selectedLead.seller}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Seller Address:</strong> {selectedLead.sellerAddress || 'Not available'}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Broker / Clearing House:</strong> {selectedLead.broker || '—'}</p>
                {selectedLead.brokerAddress && <p style={{ marginBottom: '0.4rem' }}><strong>Broker Address:</strong> {selectedLead.brokerAddress}</p>}
              </div>

              <div>
                <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>Transaction Timeline & Details</h4>
                <p style={{ marginBottom: '0.4rem' }}><strong>Filing Share Price:</strong> ${selectedLead.impliedPrice ? selectedLead.impliedPrice.toFixed(2) : '0.00'}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Shares to Sell:</strong> {selectedLead.sharesToSell.toLocaleString()}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Value:</strong> ${selectedLead.aggregateMktValue.toLocaleString()}</p>
                <p style={{ marginBottom: '0.4rem' }}><strong>Acquisition Basis:</strong> {selectedLead.acquisitionBasis || 'n/a'}</p>
                <p style={{ marginBottom: '0.4rem', color: 'var(--color-warning)' }}><strong>Deposit Timeframe:</strong> {selectedLead.depositWindow || 'Immediate'}</p>
                <p style={{ marginBottom: '0.4rem', color: 'var(--color-success)' }}><strong>Sale Execution Window:</strong> {selectedLead.saleWindow || 'Immediate'}</p>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--glass-border)' }} />

            <div>
              <h4 style={{ marginBottom: '0.75rem' }}>Outreach Logs & Notes</h4>
              <div className="notes-list">
                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  selectedLead.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <div className="note-date">{note.date}</div>
                      <div>{note.text}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No historical interactions logged yet.</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type an outreach log (e.g. 'Called issuer, confirmed restricted status')..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNote();
                  }}
                />
                <button className="btn-primary" onClick={addNote}>Add Log</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button 
                className="btn-secondary" 
                style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                onClick={() => deleteLead(selectedLead.id)}
              >
                Delete Lead
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-control"
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn-secondary" onClick={() => setSelectedLead(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
