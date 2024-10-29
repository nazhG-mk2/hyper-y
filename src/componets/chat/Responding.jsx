import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Response from './Response';

const Responding = ({ texts, speed = 50,
  end = () => { }

}) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (textIndex < texts.length) {
      const updateText = texts.slice(0, textIndex + 1)
      console.log(updateText);

      setCurrentText(texts.slice(0, textIndex + 1));

      const timeout = setTimeout(() => {
        console.log('timeout');

        setTextIndex(textIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      end();
    }
  }, [currentText, textIndex, texts, speed, end]);

  return (
    <Response response={currentText} />
  );
};
Responding.propTypes = {
  texts: PropTypes.arrayOf(PropTypes.string).isRequired,
  speed: PropTypes.number,
  end: PropTypes.func
};

export default Responding;