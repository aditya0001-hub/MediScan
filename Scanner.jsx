import React, { useState } from "react";
import './App.css'
import QrScanner from './Images.jsx'
const  Scanner= () => {
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = "AIzaSyBbWaPGUd05-ihuxu7wVhh-hnTGm2y-aro"; 

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResponseText("");

    try {
      const base64Image = await toBase64(file);

      const body = {
        contents: [
          {
            parts: [
              {
                text: `I clicked photo of medicine backside. Please analyze this image and provide details about the medicine and answer all question asked in the following format with the help of the name of medicine:
- ✅ Name of the medicine:
- 💊 Uses and purpose:
- ✏️ Dosage guidelines:
- ⚠️ Warnings (allergies, interactions, pregnancy safety):
- ⛔ Side effects:
- 💠 Treats which illness:
- 📝 Manufacturer details :

If some information is missing search on internet or anything and provide general information,if information in not found mention "Not available".Each line end add \n`
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Image.split(",")[1]
                }
              }
            ]
          }
        ]
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const result = await res.json();

      if (result.candidates && result.candidates.length > 0) {
        setResponseText(result.candidates[0].content.parts[0].text);

      } else {
        setResponseText("❌ No response from Gemini.");
      }
    } catch (err) {
      console.error("Error:", err);
      setResponseText("❌ Error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };
console.log(responseText)
  return (
    <div className="scanner-container">
      <h2>📷 Upload Medicine Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
        <QrScanner/>
      {loading && <p className="loading">⏳ Analyzing image...</p>}
      {responseText && (
        <div className="response-card">
        {responseText}
        </div>
      )}
    </div>
  );
};

export default Scanner;
