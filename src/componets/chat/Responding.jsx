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
  const isFirstRender = useRef(true);
  const msgRef = useRef(null);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (refToScroll?.current) {
        const { scrollTop, scrollHeight, clientHeight } = refToScroll.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 5;

        // Actualiza la referencia si el usuario hace scroll manual
        isUserScrolling.current = !isAtBottom;
      }
    };

    const scrollElement = refToScroll.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [refToScroll]);

  useEffect(() => {
    let tolerance = 0;
    if (isFirstRender.current) {
      tolerance += msgRef.current.clientHeight;
    }
    const { scrollTop, scrollHeight, clientHeight } = refToScroll.current;
    
    if (refToScroll?.current && !isUserScrolling.current) {
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= tolerance;
      if (isAtBottom) {
        refToScroll.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [currentText, refToScroll, isFirstRender, isUserScrolling]);

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
  }, [currentText, textIndex, data, time, end, skipAnimation, text, refToScroll]);

  return (
    <div
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