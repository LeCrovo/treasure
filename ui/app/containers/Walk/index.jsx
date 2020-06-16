import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import actions from './actions';
import config from '../../../../config.json';
import reducer from './reducer';
import saga from './saga';
import { makeSelectFiles, makeSelectPath } from './selectors';
import { useInjectSaga } from '../../utils/injectSaga';
import { useInjectReducer } from '../../utils/injectReducer';
import walkUtils from './util';

import GenericList from '../../components/GenericList';
import ListFile from './ListFile';
import Menu from './Menu';
import OrganizePreviews from '../../components/OrganizePreviews';

const {
  addParentDirectoryNav,
  isImage,
  parseQueryString,
  organizeByMedia,
} = walkUtils;

function Walk({
  doListDirectory,
  files,
  location: { search: querystring },
  statePath,
}) {
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });
  const [stateItems, setItems] = useState([]);
  const qsPath = parseQueryString('path', querystring);
  const path = qsPath || statePath;

  useEffect(() => {
    doListDirectory(path);
  }, [doListDirectory, path]);

  const loading = !files || files.length === 0;
  const itemFiles = files.map((file) => ({
    id: file.path,
    content: file.filename,
    ...file,
  }));
  addParentDirectoryNav(itemFiles, path);

  const itemImages = itemFiles.filter((file) => isImage(file));
  const hasImages = !loading && itemImages.length > 0;

  const Components = [
    <Helmet key="walk-Helmet">
      <title>Walk</title>
      <meta name="description" content="Description of Walk" />
    </Helmet>,
    <Menu
      key="walk-Menu"
      showMenu={hasImages}
      imageFilenames={stateItems.map((i) => i.filename)}
      path={path}
    />,
    <GenericList
      key="walk-GenericList"
      component={ListFile}
      items={organizeByMedia(itemFiles)}
      loading={loading}
      error={false}
    />,
  ];

  if (hasImages) {
    let items = itemImages;
    if (stateItems.length > 0) {
      items = stateItems;
    } else {
      setItems(itemImages);
    }

    Components.push(<OrganizePreviews
      key="walk-OrganizePreviews"
      items={items.map((item) => ({
        ...item,
        content: [
          <span key={`label-${item.filename}`}>{item.filename}</span>,
          <img
            key={`thumbnail-${item.filename}`}
            alt="No preview yet"
            src={`http://localhost:8000/public/${path}/${item.filename}`}
            width={config.resizeDimensions.preview.width}
            height={config.resizeDimensions.preview.height}
          />,
        ],
      }))}
      setItems={setItems}
    />);
  }

  return Components;
}

const mapStateToProps = createStructuredSelector({
  files: makeSelectFiles(),
  statePath: makeSelectPath(),
});

const mapDispatchToProps = (dispatch) => ({
  doListDirectory: (path) => dispatch(actions.listDirectory(path)),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(Walk);
