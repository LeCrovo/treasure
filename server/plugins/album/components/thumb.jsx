const React = require('react');

function Thumb({ item }) {
  const title = [];

  if (item.photoCity) {
    title.push(item.photoCity);
  }

  if (item.ref) {
    if (item.ref.source === 'wikipedia') {
      title.push(`<a href='https://en.wikipedia.org/wiki/${item.ref.name}' target='_blank'>Wiki</a>`);
    }
  }

  if (item.geo && item.geo.lat) {
    const geocode = `${item.geo.lat},${item.geo.lon}`;
    title.push(`<a href='/explore?geocode=${geocode}' target='_blank'>Explore</a>`);
  }

  return (
    <li className="liAlbumPhoto" data-lat={item.geo && item.geo.lat} data-lon={item.geo && item.geo.lon}>
      <div className="albumBoxPhotoImg">
        <a href={item.mediaPath} rel="set" title={title.join(' | ')}>
          <img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />
        </a>
      </div>
      <div className="albumBoxPhotoCaption">
        {item.thumbCaption}
      </div>
    </li>
  );
}

module.exports = Thumb;
