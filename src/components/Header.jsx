import React from 'react';
import '../index.css';

function Header(){

    return(
        <header className="main-header">
            <h1 className="logo-tix-q">Tix-Q</h1>
            <nav className="header-nav">
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Events</a></li>
                    <li><a href="#">Help</a></li>
                    <li><a href="#">My Cart</a></li>
                    <li><a href="#">Sign in/Register</a></li>
                </ul>
            </nav>
        </header>
    )

}

export default Header