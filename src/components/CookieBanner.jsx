"use client";
import CookieConsent from "react-cookie-consent";
import Image from "next/image";
import {
    Button
  } from "@clickhouse/click-ui";

export default function CookieBanner({ setConsent }) {

    const handleDecline = () => {
        setConsent(false)
    }

    const handleAccept = () => {
        setConsent(true)
    }

    return (
         <CookieConsent
    overlay
    overlayClasses="overlayclass"
    location="none" // Changed from "bottom" to "none"
    buttonText="Accept cookies"
    declineButtonText="Reject cookies"
    enableDeclineButton
    flipButtons
    cookieName="cookie-consent"
    disableStyles={true}
    containerClasses="cookie-container"
    contentClasses="cookie-content"
    // buttonClasses="accept-button"
    buttonWrapperClasses="both-buttons"
    // declineButtonClasses="decline-button"
    expires={150}
    onDecline={handleDecline}
    onAccept={handleAccept}
    ButtonComponent={Button}
    customDeclineButtonProps={{type: "secondary"}}
    style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "400px",
        maxHeight: "310px",
        height: "310px",
        width: "90%",
        zIndex: "999"
    }}
    overlayStyle={{
        backgroundColor: "rgba(0,0,0,0.7)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: "998"
    }}
>
    <div style={{ fontSize: "0.875rem",  textAlign: "center" }}>    
         <div style={{display: "flex", justifyContent: "center"}}>
         <Image
                    src="/cookie.png"
                    alt="cookie-image"
                    width={80}
                    height={80}
                  />
         </div>
        <h3 style={{fontWeight: 600}}>Could we interest you in a cookie?</h3>
        <p style={{padding: "0.5em 0 0 0", fontSize: "0.875rem", color: "#DFDFDF"}}>
        ClickHouse uses cookies to make your experience extra sweet! Some keep things running smoothly (essential cookies), while others help us improve<br/>our site (analytics cookies).&nbsp;
        <a
            href="https://clickhouse.com/legal/cookie-policy"
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
                color: "rgb(252, 255, 116)",
                textDecoration: "none"
            }}
        >
            Learn more
        </a>
        </p>
        <hr className="cookie-divider" />
    </div>
</CookieConsent> 
    );
} 