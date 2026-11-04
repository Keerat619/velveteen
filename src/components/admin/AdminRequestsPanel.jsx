import { useCallback, useEffect, useState } from 'react';
import { api, getApiError } from '../../services/api.js';

const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function AdminRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (query) params.search = query;
      if (status) params.status = status;
      const { data } = await api.get('/admin/custom-orders', { params });
      setRequests(data.requests);
      setStatuses(data.statuses);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load custom requests.'));
    } finally {
      setLoading(false);
    }
  }, [query, sort, status]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (requestId, requestStatus) => {
    setUpdating(requestId);
    setNotice('');
    setError('');
    try {
      const { data } = await api.patch(`/admin/custom-orders/${requestId}/status`, { requestStatus });
      setRequests((current) => current.map((request) => request._id === requestId ? { ...request, ...data.request } : request));
      setNotice('Custom request status updated.');
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update the request.'));
    } finally {
      setUpdating('');
    }
  };

  return (
    <section className="admin-panel" aria-labelledby="admin-requests-title">
      <div className="admin-panel-heading">
        <div><p className="admin-eyebrow">Made-to-order enquiries</p><h2 id="admin-requests-title">Custom requests</h2></div>
        <button className="admin-button admin-button--quiet" type="button" onClick={load} disabled={loading}>Refresh</button>
      </div>
      <div className="admin-filter-bar">
        <label className="admin-field admin-field--search"><span>Search name, email, or flower</span><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength="120" onKeyDown={(event) => { if (event.key === 'Enter') setQuery(search.trim()); }} /></label>
        <label className="admin-field"><span>Request status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        <button className="admin-button" type="button" onClick={() => setQuery(search.trim())}>Search</button>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <p className="admin-loading" role="status">Loading requests…</p> : !requests.length ? <p className="admin-empty">No custom requests match these filters.</p> : (
        <div className="admin-record-list">
          {requests.map((request) => (
            <article className="admin-record" key={request._id}>
              <header className="admin-record-header">
                <div><p className="admin-eyebrow">Received {dateTime(request.createdAt)}</p><h3>{request.flowerType}</h3></div>
                <label className="admin-field"><span>Request status</span><select value={request.requestStatus} disabled={updating === request._id} onChange={(event) => updateStatus(request._id, event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
              </header>
              <div className="admin-record-columns">
                <section><h4>Customer</h4><p><strong>{request.customerName}</strong></p><p><a href={`mailto:${request.email}`}>{request.email}</a></p><p><a href={`tel:${request.phone}`}>{request.phone}</a></p></section>
                <section><h4>Brief</h4><p>Preferred colours: {request.preferredColours?.length ? request.preferredColours.join(', ') : 'Not specified'}</p><p>Size: {request.bouquetSize}</p><p>Budget: {request.budget}</p><p>Preferred delivery date: {request.deliveryDate ? dateTime(request.deliveryDate) : 'Not specified'}</p></section>
              </div>
              {request.customMessage && <p className="admin-record-note"><strong>Message:</strong> {request.customMessage}</p>}
              {request.referenceImage && <p className="admin-record-note"><a href={request.referenceImage} target="_blank" rel="noreferrer">Open reference image in a new tab</a></p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
