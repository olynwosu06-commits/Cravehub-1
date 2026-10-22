import React from "react";
import './Footer.css';

function Footer() {
    return (
        <div className="footer-div">
            <section className="main-section">
                <div className="first">
                    <h1>CRave<span>hub</span></h1>
                    <p>Made best for your cravings</p>
                </div>

                <div  className="second">
                    <h3>MENU</h3>
                    <ul>
                        <li>Combo Packs</li>
                        <li>Main Dishes</li>
                        <li>Cakes</li>
                        <li>Protein and Drinks </li>
                    </ul>
                </div>

                <div className="third">
                    <h3>ORDER</h3>
                    <ul>
                        <li>Order Online</li>
                        <li>Whatsapp</li>
                        <li></li>
                    </ul>
                </div>

                <div className="fourth">
                    <h3>CONTACT</h3>
                    <ul>
                        <li>09087654367</li>
                        <li>order@cravehub.com</li>
                        <li>Get Directions</li>
                    </ul>
                </div>
            </section>

            <section className="sub-main-section">
                <div>
                    <hr />
                </div>
                <div className="sub">
                    <div>© 2026 CRAVEHUB Kitchen. All rights reserved. | Site by Lumina Vision Lab</div>
                    <div>
                        <p>Instagram</p>
                        <p>Facebook</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Footer;