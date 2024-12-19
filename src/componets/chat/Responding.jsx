import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Response from './Response';

const MINIMUM_SPEED = 1;

const Responding = ({ data, time = 4000,
  end = () => { }

}) => {
  const { text } = data;

  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    if (skipAnimation) {
      setCurrentText(text);
      end();
      return;
    }
  
    const speed = Math.max(text?.length / time, MINIMUM_SPEED);
  
    if (textIndex < text?.length) {
      const nextChar = text.charAt(textIndex);
      setCurrentText((prev) => prev + nextChar);
  
      const timeout = setTimeout(() => {
        setTextIndex((prevIndex) => prevIndex + 1);
      }, speed);
  
      return () => clearTimeout(timeout);
    } else {
      end();
    }
  }, [text, textIndex, time, end, skipAnimation]);

  return (
    <div
      onClick={() => {
        setSkipAnimation(true);
        setCurrentText(text);
      }}
      className='pb-8'
    >
      <Response response={text.slice(0, textIndex)} open={true}
      noImg={data.noImg} additionalResponse={data.additional || ''}
      />
    </div>
  );
};
Responding.propTypes = {
  data: PropTypes.object,
  time: PropTypes.number,
  end: PropTypes.func
};

export default Responding;