// src/components/Text.tsx
import React, { useState } from 'react';

interface TextProps {
    onNext: () => void; // Function to call when "Next" button is clicked
  }

  const Text: React.FC<TextProps> = ({onNext}) => {
    const [inputValue, setInputValue] = useState('');
    const [submittedText, setSubmittedText] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = () => {
        setSubmittedText(inputValue);
        setInputValue(''); // Clear the textbox after submitting
    };

    const handleNextClick = () => {
        onNext(); // Call the onNext function when "Next" button is clicked
      };

    return (
        <div>
            <input
                id="inputText"
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Type your message"
            />
            <button onClick={handleSubmit}>Submit</button>
            <p>Your response:</p>

            <button className="btn" onClick={handleNextClick}>
                  Next
            </button>
            
        </div>
    );
};

export default Text;
