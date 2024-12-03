import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Response from './Response';

const MINIMUM_SPEED = 1;

const Responding = ({ data, time = 4000,
  end = () => { },
  agent
}) => {
  const { text } = data;

  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    
    const speed = Math.max(text?.length / time, MINIMUM_SPEED);

    if (textIndex < text?.length) {
      setCurrentText(text.slice(0, textIndex + 1));

      const timeout = setTimeout(() => {
        setTextIndex(textIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setSkipAnimation(false);
      end();
    }
  }, [currentText, textIndex, data, time, end, skipAnimation, text]);

  return (
    <div
      onClick={() => {
        setSkipAnimation(true);
        setCurrentText(text);
      }}
      className='pb-6'
    >
      <Response agent={agent} response={currentText} open={true}
      noImg={data.noImg} additionalResponse={data.additional || ''}
      />
    </div>
  );
};
Responding.propTypes = {
  agent: PropTypes.string,
  data: PropTypes.object,
  time: PropTypes.number,
  end: PropTypes.func
};

export default Responding;