import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = () => {
  let medicine="";
    const [gen,setGen]=useState();
  const qrRef = useRef(null);

  const scanQr=(e) => {
    e.target.style.display="none";
    if (!qrRef.current) return;

    const html5QrCode = new Html5Qrcode(qrRef.current.id);

    html5QrCode.start(
      { facingMode: "environment" }, // Use back camera
      {
        fps: 10,                     // Frames per second
        qrbox: { width: 250, height: 250 } // QR scan box size
      },
      (decodedText, decodedResult) => {
        console.log("✅ QR Code detected:", decodedText);
        medicine=decodedText
        request();


      },
      (errorMessage) => {
        // You can log errors if you want
        // console.log("QR scan error:", errorMessage);
      }
    ).catch((err) => {
      console.error("Error starting QR scanner:", err);
    });

    // Cleanup on unmount
    return () => {
      html5QrCode.stop().then(() => {
        console.log("QR Code scanning stopped.");
      }).catch(err => {
        console.error("Failed to stop scanning.", err);
      });
    };

  }


  let request = () => {

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBbWaPGUd05-ihuxu7wVhh-hnTGm2y-aro';
     
    const requestBody = {
      contents: [
        {
          parts: [
            {
        text: `I scanned a QR code on a medicine package. The QR code text is:\n\n${medicine}\n\nPlease provide detailed information about the medicine in the following format:\n\n- ✅ Name of the medicine:\n- 💊 Uses and purpose:\n- ✏️ Dosage guidelines:\n- ⚠️ Warnings (allergies, interactions, pregnancy safety):\n- ⛔ Side effects:\n- 💠 Treats which illness:\n- 📝 Manufacturer details and expiry:\n\nIf some information is missing in the QR code text, mention \"Not available\". Format the output exactly as above using the same symbols.`

            }
          ]
        }
      ]
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.candidates && data.candidates.length > 0) {
           const generatedText=data.candidates[0].content.parts
            .map(part => part.text)
            .join(' ');
            setGen(generatedText)
          console.log('Generated text:', generatedText);
        } else {
          console.log('No candidates returned in the response:', data);
        }
      })
      .catch(error => {
        console.error('Error from Gemini API:', error);
      });
  }
   const stylesdiv={
  
    "display":"flex",
    "justifyContent":"center",
    "alignItem":"center",
    "flexDirection":"row",

   }
   const button={
    "fontSize":"1.5rem",
     "padding":".5rem",
     "border":"none",
      "backgroundColor":" hsl(120, 90%, 37%)",
      "color":"white",
      "borderRadius":"1rem",
      "marginRight":"30vw",
   }
  return (
    <div style={stylesdiv}>
      <div id="qr-reader" ref={qrRef} style={{ width: "300px" }}></div><br/>
      <button style={button} onClick={(e)=>scanQr(e)}>Scan QR Code</button>
    </div>
  );
};

export default QrScanner;
