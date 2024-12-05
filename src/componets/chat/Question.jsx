import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

const Question = ({
  refToScroll = null,
  question
}) => {

  useEffect(() => {

    const t = setTimeout(() => {
      if (refToScroll?.current) {
        const { scrollTop, scrollHeight, clientHeight } = refToScroll.current;

        // Verificar si está cerca del final (puedes ajustar el margen, como 50px)
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 50;

        if (isAtBottom) {
          refToScroll.current.scrollTo({
            top: scrollHeight,
            behavior: "smooth",
          });
        } else {
          console.log("El usuario no está al final, no se hace scroll automático.");
        }
      }
    }, 100);

    return () => clearTimeout(t);

  }, [refToScroll]);

  return (
    <span className="bg-light rounded-md px-4 py-2 w-fit self-end mb-5 ml-auto">{
      question
    }</span>
  )
}

Question.propTypes = {
  question: PropTypes.string,
  refToScroll: PropTypes.object,
};

export default memo(Question)
