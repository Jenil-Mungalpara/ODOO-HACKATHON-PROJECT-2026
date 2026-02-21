import { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { MdEdit, MdDelete } from 'react-icons/md';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Dispatcher', phone: '' });
  const [error, setError] = useState('');

  const load = () => {
    API.get('/users').then(r => setUsers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '' });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.put(`/users/${editing._id}`, form);
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await API.delete(`/users/${id}`); load(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', type: 'badge' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdAt', label: 'Joined', type: 'date' },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-8" onClick={e => e.stopPropagation()}>
          <button className="btn-icon" onClick={() => openEdit(row)}><MdEdit /></button>
          <button className="btn-icon" onClick={() => handleDelete(row._id)}><MdDelete /></button>
        </div>
      )
    }
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Settings — User Management</h1>
      </div>
      <div className="card">
        <DataTable columns={columns} data={users} emptyMessage="No users found." />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Edit User"
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" form="userForm">Save</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <form id="userForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option>Admin</option><option>Fleet Manager</option><option>Dispatcher</option>
                <option>Safety Officer</option><option>Financial Analyst</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
