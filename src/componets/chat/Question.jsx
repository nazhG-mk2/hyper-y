import PropTypes from 'prop-types';
import { memo } from 'react';

const Question = ({
    question
}) => {
  return (
    <span className="bg-light rounded-md px-4 py-2 w-fit self-end mb-5 ml-auto">{
        question
    }</span>
  )
}

Question.propTypes = {
  question: PropTypes.string,
};

export default memo(Question)
