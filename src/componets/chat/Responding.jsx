import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Responding = ({ texts, speed = 100 }) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);

  useEffect(() => {
    if (textIndex < texts.length) {
      if (letterIndex < texts[textIndex].length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText + texts[textIndex][letterIndex]);
          setLetterIndex(letterIndex + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setLetterIndex(0);
          setTextIndex(textIndex + 1);
          setCurrentText('');
        }, speed * 10); // Delay before starting next text
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, letterIndex, textIndex, texts, speed]);

  return (
    <span>{currentText}</span>
  );
};
Responding.propTypes = {
  texts: PropTypes.arrayOf(PropTypes.string).isRequired,
  speed: PropTypes.number,
};

export default Responding;