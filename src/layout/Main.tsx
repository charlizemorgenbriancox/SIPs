import React from 'react'
import { useEffect } from 'react';

import GithubIcon from '../icons/Github'
import TwitterIcon from '../icons/Twitter'
import LightModeIcon from '../icons/LightMode'
import DarkModeIcon from '../icons/DarkMode'

const toggleTheme = (e) => {
  e.preventDefault();
  const element = document.body;
  document.getElementById("theme-toggle-dark-icon")?.classList.toggle("hidden");
  document.getElementById("theme-toggle-light-icon")?.classList.toggle("hidden");
  const result = element.classList.toggle("dark");
  localStorage.setItem('theme', result ? 'dark' : 'light');
}

const initTheme = () => {
  const element = document.body;
  if(element.classList.contains('dark')) {
    document.getElementById("theme-toggle-light-icon")?.classList.remove("hidden");
  }
  else {
    document.getElementById("theme-toggle-dark-icon")?.classList.remove("hidden");
  }
}

const Main: React.FC = ({ children }) => {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <main>
      {/* matomo */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            var _paq = window._paq = window._paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="https://analytics.synthetix.io/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '5']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
          `,
        }}
      />
      <header className="site-header" role="banner">
        <div className="wrapper">
          <a className="site-title" rel="author" href="/">
            SIPs
          </a>
          <nav className="site-nav">
            <input type="checkbox" id="nav-trigger" className="nav-trigger" />
            <label htmlFor="nav-trigger">
              <span className="menu-icon">
                <svg viewBox="0 0 18 15" width="18px" height="15px">
                  <path d="M18,1.484c0,0.82-0.665,1.484-1.484,1.484H1.484C0.665,2.969,0,2.304,0,1.484l0,0C0,0.665,0.665,0,1.484,0 h15.032C17.335,0,18,0.665,18,1.484L18,1.484z M18,7.516C18,8.335,17.335,9,16.516,9H1.484C0.665,9,0,8.335,0,7.516l0,0 c0-0.82,0.665-1.484,1.484-1.484h15.032C17.335,6.031,18,6.696,18,7.516L18,7.516z M18,13.516C18,14.335,17.335,15,16.516,15H1.484 C0.665,15,0,14.335,0,13.516l0,0c0-0.82,0.665-1.483,1.484-1.483h15.032C17.335,12.031,18,12.695,18,13.516L18,13.516z"></path>
                </svg>
              </span>
            </label>

            <div className="trigger">
              <a className="page-link" href="/all-sip">
                All SIPs
              </a>
              <a className="page-link" href="/all-sccp">
                All SCCPs
              </a>
              <a className="page-link" href="/all-stp">
                All STPs
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="page-content">
        <div className="wrapper">{children}</div>
      </main>

      <footer className="site-footer h-card">
        <div className="wrapper">
          <h2 className="footer-heading">SIPs</h2>

          <div className="footer-col-wrapper">
            <div className="footer-col footer-col-1">
              <ul className="contact-list">
                <li className="p-name">
                  SIPs
                </li>
                <li className="p-name">
                  <a href="#" className="page-link inline-block align-middle" onClick={toggleTheme}>
                    <span id="theme-toggle-dark-icon" className="hidden"><DarkModeIcon className="svg-icon" /></span>
                    <span id="theme-toggle-light-icon" className="hidden"><LightModeIcon className="svg-icon" /></span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col footer-col-2">
              <ul className="social-media-list">
                <li>
                  <a href="https://github.com/Synthetixio/SIPs">
                    <GithubIcon className="svg-icon" />
                    <span className="username">Synthetixio/SIPs</span>
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/synthetix_io">
                    <TwitterIcon className="svg-icon" />
                    <span className="username">synthetix_io</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col footer-col-3">
              <p>
                Synthetix Improvement Proposals (SIPs) describe standards for
                the Synthetix platform, including core protocol specifications,
                client APIs, and contract standards.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <script type="text/javascript" src="/mathjax-config.js" defer />
      <script
        type="text/javascript"
        id="MathJax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
        defer
      />
    </main>
  )
}

export default Main
