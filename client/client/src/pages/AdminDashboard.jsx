import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import '../styles/AdminDashboard.css';

// 👇 PUT YOUR ADMIN EMAIL HERE
const ADMIN_EMAIL = 'emmaprime@gmail.com'; 


function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { refreshMenu } = useMenu();
  const { showToast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);

  // Admin Forms State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', description: '', price: '', image: '', rating: 4.5, category: '', group: ''
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedGroupForCat, setSelectedGroupForCat] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [adminMenuSearch, setAdminMenuSearch] = useState('');

  // ==========================================
  // HOOKS & FETCHING
  // ==========================================

  // Security Guard Redirect
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || user?.email !== ADMIN_EMAIL) {
      navigate('/');
    }
  }, [authLoading, isLoggedIn, user, navigate]);

  // Load Groups & Categories on mount so they are ready for the Add Modal
  useEffect(() => {
    if (isLoggedIn && user?.email === ADMIN_EMAIL) {
      api.get('/api/admin/groups').then(res => {
        setGroups(res.data.groups);
        setCategories(res.data.categories);
      }).catch(err => console.error(err));
    }
  }, [isLoggedIn, user]);

  // Load Tab Data
  useEffect(() => {
    if (!isLoggedIn || user?.email !== ADMIN_EMAIL) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'overview') {
          const { data } = await api.get('/api/admin/stats');
          setStats(data);
        } else if (activeTab === 'orders') {
          const { data } = await api.get('/api/admin/orders');
          setOrders(data);
        } else if (activeTab === 'bookings') {
          const { data } = await api.get('/api/admin/bookings');
          setBookings(data);
        } else if (activeTab === 'users') {
          const { data } = await api.get('/api/admin/users');
          setUsers(data);
        } else if (activeTab === 'menu') {
          const { data } = await api.get('/api/admin/menu');
          setMenuItems(data);
        } else if (activeTab === 'groups') {
          const { data } = await api.get('/api/admin/groups');
          setGroups(data.groups);
          setCategories(data.categories);
        }
      } catch (err) {
        showToast('Failed to load data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, user]);

  // ==========================================
  // ACTIONS
  // ==========================================

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      showToast('Order status updated', 'success');
    } catch { showToast('Failed to update order', 'error'); }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      showToast('Booking status updated', 'success');
    } catch { showToast('Failed to update booking', 'error'); }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await api.delete(`/api/admin/menu/${id}`);
      setMenuItems(menuItems.filter(m => m._id !== id));
      await refreshMenu();
      showToast('Item deleted', 'success');
    } catch { showToast('Failed to delete item', 'error'); }
  };

  const handleSaveMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItemId) {
        // We are editing an existing item
        const { data } = await api.put(`/api/admin/menu/${editingItemId}`, newItem);
        setMenuItems(menuItems.map(m => m._id === editingItemId ? data : m));
        showToast('Menu item updated!', 'success');
      } else {
        // We are creating a new item
        const { data } = await api.post('/api/admin/menu', newItem);
        setMenuItems([data, ...menuItems]);
        showToast('New menu item added!', 'success');
      }
      
      await refreshMenu(); // Update the live site
      closeModal();
    } catch { 
      showToast('Failed to save item', 'error'); 
    }
  };

    const openEditModal = (item) => {
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      rating: item.rating,
      category: item.category,
      group: item.group
    });
    setEditingItemId(item._id);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingItemId(null);
    setNewItem({ name: '', description: '', price: '', image: '', rating: 4.5, category: '', group: '' });
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      const { data } = await api.post('/api/admin/groups', { name: newGroupName });
      setGroups([...groups, data]);
      setNewGroupName('');
      showToast('Group added', 'success');
    } catch { showToast('Group already exists', 'error'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !selectedGroupForCat) return;
    try {
      const { data } = await api.post('/api/admin/categories', { 
        name: newCategoryName, 
        groupId: selectedGroupForCat 
      });
      setCategories([...categories, data]);
      setNewCategoryName('');
      showToast('Category added', 'success');
    } catch { showToast('Category already exists', 'error'); }
  };

    // Filter menu items for the Admin table based on search
  const filteredAdminMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(adminMenuSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(adminMenuSearch.toLowerCase())
  );

    const handleDeleteGroup = async (id, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete "${name}"?\n\nThis will also delete ALL categories inside it. Menu items using these categories will NOT be deleted, but they might break on the menu page.`)) return;
    
    try {
      await api.delete(`/api/admin/groups/${id}`);
      setGroups(groups.filter(g => g._id !== id));
      setCategories(categories.filter(c => c.group !== id)); // Clean up local state
      showToast('Group and its categories deleted', 'success');
    } catch {
      showToast('Failed to delete group', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;
    
    try {
      await api.delete(`/api/admin/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      showToast('Category deleted', 'success');
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  // Prevent rendering until auth is confirmed
  if (authLoading || !isLoggedIn || user?.email !== ADMIN_EMAIL) {
    return <div className="admin-layout" style={{padding: '50px'}}>Checking permissions...</div>;
  }

  return (
    <div className="admin-layout">
      
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="bx bx-layer"></i>
          CRAVE<span>HUB</span> ADMIN
        </div>
        <div className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <i className="bx bx-grid-alt"></i> Overview
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <i className="bx bx-shopping-bag"></i> Orders
          </button>
          <button className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <i className="bx bx-food-menu"></i> Menu Items
          </button>
          <button className={`admin-nav-item ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
            <i className="bx bx-category"></i> Groups & Categories
          </button>
          <button className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <i className="bx bx-calendar"></i> Bookings
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <i className="bx bx-user"></i> Users
          </button>
        </div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={() => navigate('/')} className="admin-nav-item" style={{ border: '1px solid #333' }}>
            <i className="bx bx-arrow-back"></i> Back to Site
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Welcome back, Admin</h1>
            <p>Here is what's happening at CraveHub today.</p>
          </div>
        </div>

        {isLoading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && stats && (
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <h3>Total Revenue</h3>
                  <div className="value">₦{stats.totalRevenue.toFixed(2)}</div>
                  <div className="trend">All time earnings</div>
                </div>
                <div className="admin-stat-card">
                  <h3>Total Orders</h3>
                  <div className="value">{stats.totalOrders}</div>
                  <div className="trend">+{stats.todayOrders} today</div>
                </div>
                <div className="admin-stat-card">
                  <h3>Total Users</h3>
                  <div className="value">{stats.totalUsers}</div>
                  <div className="trend">Registered accounts</div>
                </div>
              </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong>{order.customer.name}</strong><br/>
                          <span style={{fontSize: '12px', color: '#666'}}>{order.customer.phone}</span>
                        </td>
                        <td style={{textTransform: 'capitalize'}}>{order.orderType}</td>
                        <td><strong>₦{order.total.toFixed(2)}</strong></td>
                        <td>
                          <select 
                            className="admin-select"
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No orders found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

           {/* --- MENU TAB --- */}
            {activeTab === 'menu' && (
              <>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* 👇 SEARCH BAR */}
                  <div style={{ position: 'relative', width: '300px' }}>
                    <i className="bx bx-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
                    <input 
                      type="text" 
                      placeholder="Search menu items..." 
                      value={adminMenuSearch}
                      onChange={(e) => setAdminMenuSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button className="admin-btn primary" onClick={() => { setEditingItemId(null); setNewItem({ name: '', description: '', price: '', image: '', rating: 4.5, category: '', group: '' }); setIsAddModalOpen(true); }}>
                    + Add New Menu Item
                  </button>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminMenu.map(item => (
                        <tr key={item._id}>
                          <td><img src={item.image} alt={item.name} style={{width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover'}} /></td>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td>₦{item.price.toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="admin-btn" 
                                style={{ background: '#e5e7eb', color: '#111827' }} 
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </button>
                              <button className="admin-btn danger" onClick={() => handleDeleteMenu(item._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                        {filteredAdminMenu.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                            No menu items found matching "{adminMenuSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* --- GROUPS & CATEGORIES TAB --- */}
            {activeTab === 'groups' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Manage Groups */}
                <div className="admin-table-container" style={{ padding: '24px' }}>
                  <h3>Manage Groups</h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Top-level categories like Food, Drinks, Snacks.</p>
                  
                  <form onSubmit={handleAddGroup} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input 
                      type="text" 
                      placeholder="New Group Name" 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" className="admin-btn primary">Add Group</button>
                  </form>

                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {groups.map(g => (
                    <li key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                      {g.name}
                      <button 
                        onClick={() => handleDeleteGroup(g._id, g.name)}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px' }}
                        title="Delete Group"
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </li>
                    ))}
                  </ul>
                </div>

                {/* Manage Categories */}
                <div className="admin-table-container" style={{ padding: '24px' }}>
                  <h3>Manage Categories</h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Sub-categories that belong to a group.</p>
                  
                  <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <select 
                      value={selectedGroupForCat} 
                      onChange={(e) => setSelectedGroupForCat(e.target.value)}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select a Group...</option>
                      {groups.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="New Category Name" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                      <button type="submit" className="admin-btn primary">Add</button>
                    </div>
                  </form>

                  {groups.map(g => {
                    const groupCats = categories.filter(c => c.group === g._id);
                    if (groupCats.length === 0) return null;
                    
                    return (
                      <div key={g._id} style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px', color: '#b7122a', fontSize: '14px' }}>{g.name}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {groupCats.map(c => (
                            <span key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e5e7eb', padding: '4px 10px', borderRadius: '999px', fontSize: '12px' }}>
                              {c.name}
                              <button 
                                onClick={() => handleDeleteCategory(c._id, c.name)}
                                style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, fontSize: '14px', display: 'flex' }}
                                title="Delete Category"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- BOOKINGS TAB --- */}
            {activeTab === 'bookings' && (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Name</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td>
                          <strong>{booking.name}</strong><br/>
                          <span style={{fontSize: '12px', color: '#666'}}>{booking.phone}</span>
                        </td>
                        <td>{booking.guests}</td>
                        <td>
                          <select 
                            className="admin-select"
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No bookings found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- USERS TAB --- */}
            {activeTab === 'users' && (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Joined</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-badge ${u.email === ADMIN_EMAIL ? 'badge-confirmed' : 'badge-delivered'}`}>
                            {u.email === ADMIN_EMAIL ? 'Admin' : 'Customer'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- ADD MENU MODAL --- */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2>Add New Menu Item</h2>
            <form onSubmit={handleSaveMenuSubmit}>
              <div className="admin-form-group">
                <label>Item Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Price (₦)</label>
                <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Image URL</label>
                <input required type="url" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} placeholder="https://..." />
              </div>
              
              {/* DYNAMIC DROPDOWNS */}
              <div className="admin-form-group">
                <label>Group</label>
                <select 
                  required 
                  value={newItem.group || ''} 
                  onChange={e => setNewItem({...newItem, group: e.target.value, category: ''})}
                >
                  <option value="">Select Group...</option>
                  {groups.map(g => (
                    <option key={g._id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <select 
                  required 
                  value={newItem.category || ''} 
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  disabled={!newItem.group}
                >
                  <option value="">Select Category...</option>
                  {categories
                    .filter(c => {
                      const groupObj = groups.find(g => g.name === newItem.group);
                      return groupObj && c.group === groupObj._id;
                    })
                    .map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="admin-form-group">
                <label>Rating (0.0 to 5.0)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="5" 
                  value={newItem.rating} 
                  onChange={e => setNewItem({...newItem, rating: e.target.value})} 
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea rows="3" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="admin-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;