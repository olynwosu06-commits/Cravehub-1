import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/CheckoutPage.css';

function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/bookings/${id}`)
      .then((res) => setBooking(res.data))
      .catch(() => setError('Could not load this booking'));
  }, [id]);

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Booking not found</h2>
          <Link to="/" className="checkout-btn">Back home</Link>
        </div>
      </div>
    );
  }

  if (!booking) return <div className="checkout-page">Loading...</div>;

  // Format the date nicely
  const dateObj = new Date(booking.date);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="checkout-page">
      <div className="checkout-success">
        <div className="success-icon">
          <i className="bx bx-calendar-check"></i>
        </div>
        <div style={{ 
            background: '#edfbf0', 
            border: '1px solid #b8e8c3', 
            padding: '16px', 
            borderRadius: '10px', 
            margin: '0 auto 24px', 
            maxWidth: '560px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#186a22',
            fontSize: '14px'
            }}>
            <i className="bx bx-envelope" style={{ fontSize: '24px' }}></i>
            <div>
                <strong>A confirmation email has been sent to {booking.email}.</strong>
                <br />
                <span style={{ color: '#555' }}>Please check your spam folder if you don't see it.</span>
            </div>
        </div>
        <h1>Table Reserved!</h1>
        <p>Booking #{booking._id.slice(-6).toUpperCase()}</p>
      </div>

      <div className="order-summary" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '24px' }}>Reservation Details</h2>
        
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#b7122a', marginBottom: '8px' }}>
          {formattedDate}
        </div>
        <div style={{ fontSize: '18px', color: '#1b1b1b', marginBottom: '24px' }}>
          at {booking.time} • {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', color: '#666', fontSize: '14px' }}>
          <p style={{ margin: '0 0 8px' }}>We have your table ready under <strong>{booking.name}</strong>.</p>
          {booking.notes && (
             <p style={{ fontStyle: 'italic', color: '#999' }}>"{booking.notes}"</p>
          )}
          <p style={{ margin: '16px 0 0' }}>If you need to change anything, call us at 09087654367.</p>
        </div>

        <Link to="/" className="checkout-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '24px' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;