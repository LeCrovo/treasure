import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl from 'react-mapbox-gl';

import {
  getMapOptions,
} from './options';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw',
});

const SlippyPhoto = ({ currentMemory }) => (
  <Map {...getMapOptions(currentMemory)} />
);

SlippyPhoto.defaultProps = {
  currentMemory: {},
};

SlippyPhoto.propTypes = {
  currentMemory: PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
  }),
};

export default SlippyPhoto;
