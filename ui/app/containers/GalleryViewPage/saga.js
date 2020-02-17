/* global fetch */
import { Dropbox } from 'dropbox';
import { call, put, takeLatest } from 'redux-saga/effects';

import request from '../../utils/request';

import { LOAD_GALLERY } from './constants';
import { galleryLoaded, galleryLoadingError } from './actions';

// Dropbox API v2 request/response handler
export function* getDropboxGalleryFile(gallery) {
  const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN, fetch });

  try {
    const galleryFileUrl = yield call([dbx, dbx.filesGetTemporaryLink], { path: `/public/gallery-${gallery}/xml/gallery.xml` });
    const galleryFile = yield call(request, galleryFileUrl.link);

    yield put(galleryLoaded(galleryFile));
  } catch (error) {
    yield put(galleryLoadingError(error));
  }
}

function* getGalleryFile({ gallery, host }) {
  if (host !== 'dropbox') {
    console.error('Only Dropbox is currently supported');
    return;
  }

  yield call(getDropboxGalleryFile, gallery);
}

// ROOT saga manages WATCHER lifecycle
export default function* GalleryViewPageSagaWatcher() {
  yield takeLatest(LOAD_GALLERY, getGalleryFile);
}
