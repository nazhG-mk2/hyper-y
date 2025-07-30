import { FaBullhorn } from "react-icons/fa";

import * as Sentry from "@sentry/react";

const widgetStyle = {
  position: 'fixed',
  bottom: '74px',
  right: '10px',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  borderRadius: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  padding: '10px 20px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  backgroundColor: '#333',
};

const iconStyle = {
  width: '24px',
  height: '24px',
  fill: '#eee',
  flexShrink: 0,
};

const textStyle = {
  fontSize: '16px',
  fontWeight: 500,
  color: '#fff',
  marginLeft:'12px'
};

const SentryWidget = () => {
  const handleClick = async () => {
    const feedback = Sentry.getFeedback();
    const form = await feedback?.createForm();
    form.appendToDom();
    form.open();
  }

  return <div
    style={widgetStyle}
    className="sentry-widget"
    tabIndex={0}
    aria-label="Report a bug"
    onClick={handleClick}
  >
    {/* Bug Icon (SVG) */}
    <FaBullhorn style={iconStyle} />
    <span className="sentry-widget-text hide-in-small-screens" style={textStyle}>
      Report Bug
    </span>
  </div>
};

export default SentryWidget;