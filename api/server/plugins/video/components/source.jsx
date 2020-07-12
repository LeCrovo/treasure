const React = require('react');

function Source({ extension, gallery, source }) {
  const src = `/galleries/${gallery}/media/videos/${source}`;
  let type = '';
  if (extension === 'mp4') {
    type = 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"';
  }

  if (extension === 'webm') {
    type = 'video/webm; codecs="vp8, vorbis"';
  }

  if (extension === 'ogv') {
    type = 'video/ogg; codecs="theora, vorbis"';
  }

  return (<source src={src} type={type} />);
}

module.exports = Source;
