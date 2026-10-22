import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import '../styles/CheckoutPage.css';

function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/api/bookings', {
        name, email, phone, date, time, guests, notes
      });

      showToast('Table booked!', 'success');
      navigate(`/booking/${data._id}`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to book table', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Book a Table</h1>
        <p>Reserve your spot at CraveHub. We can't wait to host you.</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]} // Today or future
            />
          </label>

          <label>
            Time
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
            >
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
          </label>
        </div>

        <label>
          Party Size
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </label>

        <label>
          Full Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Phone
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" required />
        </label>

        <label>
          Special Requests (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Window seat, birthday celebration, etc."
            rows={2}
          />
        </label>

        <button type="submit" className="checkout-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Booking...' : 'Confirm Reservation'}
        </button>
      </form>
    </div>
  );
}

export default BookingPage;