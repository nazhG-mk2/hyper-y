import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Response from './Response';

const MINIMUM_SPEED = 1;

const Responding = ({ data, time = 4000,
  end = () => { },
  refToScroll = null,
  agent
}) => {
  const { text } = data;

  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [fistRender, setFirstRender] = useState(true);
  const msgRef = useRef(null);

  useEffect(() => {

    // if (skipAnimation) {
    //   setCurrentText(text);
    //   end();
    //   return;
    // }

    if (refToScroll?.current) {
      const { scrollTop, scrollHeight, clientHeight } = refToScroll.current;

      // Verificar si está cerca del final (puedes ajustar el margen, como 50px)
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= (20 + msgRef.current.clientHeight);

      console.log('isAtBottom - msg', isAtBottom ? 'true' : 'false', msgRef.current.clientHeight);


      if (isAtBottom) {
        refToScroll.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }

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
  }, [currentText, textIndex, data, time, end, skipAnimation, text, refToScroll]);

  return (
    <div
      onClick={() => {
        setSkipAnimation(true);
        setCurrentText(text);
      }}
      ref={msgRef}
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
  refToScroll: PropTypes.object,
  data: PropTypes.object,
  time: PropTypes.number,
  end: PropTypes.func
};

export default Responding;