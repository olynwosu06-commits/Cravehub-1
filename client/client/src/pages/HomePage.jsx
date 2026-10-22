
import { Link, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { homeSections } from '../data/HomeData';
import React, { useEffect, useRef, useState } from 'react';
import { useFave } from '../context/FaveContext';

function HomePage() {

  const navigate = useNavigate();

  const { addToCart } = useCart(); 
  const { toggleFave, isFave } = useFave();
  const { items, isFetching } = useMenu();
 
  const popularItems = items.filter((item) =>
    homeSections.popular.includes(item.id)
  );

  const recommendedItems = items.filter((item) =>
    homeSections.recommended.includes(item.id)
  );

  const cravingItems = items.filter((item) =>
    homeSections.craving.includes(item.id)
  );


  // For image popular flow
  const popularRef = useRef(null);
  const [popularVisible, setPopularVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPopularVisible(true);
          observer.disconnect();
      }
      },
      {
        threshold: 0.2,
      }
    );

    if (popularRef.current) {
      observer.observe(popularRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // For Feast Bucket flow
  const feastRef = useRef(null);
  const [feastVisible, setFeastVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeastVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (feastRef.current) {
      observer.observe(feastRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // FOR RECOMMENDED FLOW

    const recommendedRef = useRef(null);
    const [recommendedVisible, setRecommendedVisible] = useState(false);

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRecommendedVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (recommendedRef.current) {
      observer.observe(recommendedRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // FOR MORE THAN FLOW

    const moreRef = useRef(null);
    const [moreVisible, setmoreVisible] = useState(false);

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setmoreVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (moreRef.current) {
      observer.observe(moreRef.current);
    }

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
  const elements = document.querySelectorAll(".animate-on-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((element) => observer.observe(element));

  return () => observer.disconnect();
}, []);


  // CRAVING
        const cravingRef = useRef(null);
    const [cravingVisible, setcravingVisible] = useState(false);

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setcravingVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (cravingRef.current) {
      observer.observe(cravingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className='homepage'>

      {/* HERO SECTION */}

      <section className="hero-section">

        {/* HERO TEXT */}
        <div className="hero-text">

          <h4>FRESH . TASTY . ALWAYS</h4>

          <h1>
            GOOD FOOD.
            <br />
            <span>GOOD MOOD.</span>
          </h1>

          <p>
            Delicious meals, snacks and drinks made for whatever you are craving.
          </p>

          <div className="hero-buttons">

            <Link to="/menu" className="hero-button primary-button">
              Explore Menu
              <i className="bx bx-right-arrow-alt"></i>
            </Link>

            <button
              type="button"
              className="hero-button secondary-button"
            >
              Today's Offers
            </button>
            

          </div>

        </div>


        {/* HERO IMAGE */}
        <div className="hero-img">
          

          {/* Rotating decoration */}
          <div className="hero-ring"></div>
          <p>Cravings <br /> Delivered</p>

          {/* Floating decorations */}
          <span className="hero-dot dot-one"></span>
          <span className="hero-dot dot-two"></span>
          <span className="hero-dot dot-three"></span>

          <span className="hero-sparkle sparkle-one">✦</span>
          <span className="hero-sparkle sparkle-two">✦</span>
          <span className="hero-sparkle sparkle-three">✦</span>


          {/* Food image */}
          <img
            src="https://res.cloudinary.com/daaiil1ah/image/upload/v1790449401/66fdfc6fb93ad3ed26b4f8b2cd994347-removebg-preview_qjldtq.png"
            alt="Delicious food"
          />

        </div>

      </section>

      {/* POPULAR NOW */}

      <section
        ref={popularRef}
        className={`popular ${popularVisible ? 'popular-visible' : ''}`}
      >
        <div className='popular-text'>
          <div>
            <h1>Popular Right Now</h1>
            <p>These favorites are loved by many!</p>
          </div>

          <div className='link'>
            <Link to="/menu">View All Menu<i className="bx bx-arrow-right-stroke"></i>  </Link>
          </div>
        </div>

          <div className='popular-img'>
            {popularItems.map((item) => (
              <div className="popular-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                  <div className="popular-footer">
                    <span>N{item.price.toFixed(2)}</span>
                    <button
                      className="popular-add-button"
                      onClick={() =>
                        addToCart({
                          _id: item._id,
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          rating: item.rating,
                          description: item.description,
                        })
                      }
                      >
                      +
                    </button> 
                  </div>
              </div>
            ))}
          </div>
      </section>

      {/* FEAST BUCKET */}

      <section
        ref={feastRef}
        className={`feast-bucket ${feastVisible ? 'feast-visible' : ''}`}
      >
        <div className='feast-bucket-text'>
            <button type="button">Today's Special</button>
            <h1>THE FEAST BUCKET</h1>
            <p>12pcs Fried Chicken, 2 Large Sides and 4 Biscuits</p>
            <div>
              <h3>N20.99</h3>
              <button onClick={() => navigate('/menu')}>Order now</button>
            </div>
        </div>

        <div>
          <img src="https://res.cloudinary.com/daaiil1ah/image/upload/v1790442842/yes-removebg-preview_q8w4ad.png" alt="" />
        </div>
      </section>

      {/* RECOMMENDED FOR YOU */}
      <section
        ref={recommendedRef}
        className={`recommended ${recommendedVisible ? 'recommended-visible' : ''}`}
        >
        <div className='recommended-text'>
            <h1>Recommended for you</h1>
        </div>

        <div className='recommended-img'>
          {recommendedItems.map((item) => {
            const favorited = isFave(item._id);
            const handleFave = () =>
              toggleFave({
                _id: item._id,
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                rating: item.rating,
                description: item.description,
              });

            return (
              <div className="recommended-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <button
                  className={`favorite-button ${favorited ? 'active' : ''}`}
                  onClick={handleFave}
                  aria-label="Toggle favorite"
                >
                  <i className={favorited ? 'bx bxs-heart' : 'bx bx-heart'}></i>
                </button>

                <div className="recommended-footer">
                  <h3>{item.name}</h3>
                  <span>N{item.price.toFixed(2)}</span>
                </div>

                <p>{item.description} filled w y</p>

                <button
                  className="recommended-add-button"
                  onClick={() => addToCart({ ...item })}
                >
                  +   Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </section>


      {/* WHY SO FRESH */}
      <section className="so-fresh animate-on-scroll">
        <div className='so-fresh-info'>
          <h1>Why SoFresh</h1>
          <p>Everything we do is built around freshness, quality, and making healthy easy for you.</p>
        </div>

        <div className='so-fresh-content'>
          <div className='so-fresh-div'>
            <div  className='so-fresh-div-icon'>
              <i class="bx bx-leaf" style={{color: '#44f42b'}} />
              </div> 
            <div className='so-fresh-text'>
              <h1>Made fresh on order</h1>
              <p>Every meal prepared right after you order order</p>
            </div>
          </div>

          <div className='so-fresh-div'>
            <div className='so-fresh-div-icon'>
              <i class="bx bx-lock" style={{color: '#f9a611'}} />
            </div>
            <div className='so-fresh-text'>
              <h1>Secure checkout</h1>
              <p>Encrypted checkout keeps your payment protected</p>
            </div>
          </div>

          <div className='so-fresh-div'>
            <div  className='so-fresh-div-icon'>
              <i class="bx bx-bus" style={{color: '#ee3b39'}} />
            </div>
            <div className='so-fresh-text'>
              <h1>Fast & reliable</h1>
              <p>Quick delivery to your door or ready for pickup</p>
            </div>
          </div>
        </div>
      </section>


      {/* MORE THAN JUST A FOOD */}
      <section
        ref={moreRef}
        className={`more-than ${moreVisible ? 'more-visible' : ''}`}
      >
        <div>
          <img src="https://res.cloudinary.com/daaiil1ah/image/upload/v1790804627/_Savoring_the_Art_of_Cooking__x0rxiq.jpg" alt="" />
        </div>

        <div className='more-text'>
          <p>our story</p>
          <h1>more than just food</h1>
          <p className='mr'>At <span>cravehub</span>, we bring together fresh ingredients, comforting favorites and bold flavors to make every craving worth it.</p>
          <button>Discover More</button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className='works animate-on-scroll'>
        <div className='works-intro'>
          <h1>How it Works</h1>
        </div>

        <div className='works-content'>
          <div className='works-div'>
            <div className='works-text1'>
              <i class="bx bx-heart" />
              <h1>Find Your Nearest Restaurant</h1>
            </div>
            <div className='works-text2'>
              <p>Enter your location and we will connect you to the closest branch available for pickup or delivery.</p>
            </div>
          </div>
          
          <div className='works-div'>
            <div className='works-text1'>
              <i class="bx bx-heart" />
              <h1>Pick Your Favourite Meals</h1>
            </div>
            <div className='works-text2'>
              <p>Browse our delicious menu, customise your order, and place it in just a few clicks.</p>
            </div>
          </div>

          <div className='works-div'>
            <div className='works-text1'>
              <i class="bx bx-heart" />
              <h1>Relax While We Handle the Rest</h1>
            </div>
            <div className='works-text2'>
              <p>Choose pickup or delivery and enjoy freshly prepared meals made with care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CRAVING COMBOS */}
      <section
        ref={cravingRef}
        className={`craving animate-on-scroll ${cravingVisible ? 'craving-visible' : ''}`}
      >
        <div className='craving-text'>
          <h4>CRAVING COMbo</h4>
          <h1>SO FREsh, so good!</h1>
          <p>Something fresh for every craving</p>
        </div>
        <div className='craving-img'>
          {cravingItems.map((item) => (
          <div className="craving-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div  className="craving-overlay">
              <h3>{item.name}</h3>
              <p>{item.description} filled w y</p>
            </div>
            
          </div>
          ))}
        </div>
      </section>

      {/* BOOK A TABLE */}
      <section className='planning animate-on-scroll'>
        <i className='bx bx-restaurant'></i>
        <div className='booking'>
          <h1>Planning a dinner?</h1>
          <p>Book a table in seconds and enjoy a seemless dining experience with priority seating.</p>
          <Link className='booking-button' to="/book" >Book a Table Now</Link>        
        </div>

        <i className='bx bx-cycling'></i>
        <div className='delivery'>
          <h1>Free Dilevery on first order</h1>
          <p>Sse code <span>cravewelcome</span> to unlock free delivery on your next meal</p>
          <button>Claim now</button>
        </div>
      </section>

          {/*FOLLOW*/}
      <section className='follow animate-on-scroll'>
        <h1>Your <span>Healthy</span> Lifestyle Made Easier</h1>
        <p>Follow Along for Daily Fresh Inspiration. Wherever life takes you, SoFresh fits right in, giving you real food that’s ready when you are.</p>
        <div>
          <button>Follow us on Instagram</button>
          <button>Follow us on Tiktok</button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;