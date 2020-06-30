const tape = require('tape-catch');

tape('Utilities', { skip: false }, (describe) => {
  const lib = require('../index');
  const path = require('path');

  describe.test('* Config - Get', (assert) => {
    const value = lib.config.get('supportedFileTypes.photo');
    assert.ok(value, 'Retrieve value');
    assert.ok(value.length, 'Get array type');
    assert.ok(value[0], 'jpg', 'Read array index 0');
    assert.ok(value[1], 'jpeg', 'Read array index 1');
    assert.end();
  });

  describe.test('* Env - Load and Get', (assert) => {
    let actual;
    let expected;

    actual = lib.env.get('HISTORY_ENV_LOADED');
    expected = true;
    assert.equal(actual, expected, 'Get env as bool');

    actual = lib.env.get('HISTORY_ENV_TESTED');
    expected = 1;
    assert.equal(actual, expected, 'Get env as number');

    actual = lib.env.get('HISTORY_ENV_FAKE');
    expected = null;
    assert.equal(actual, expected, 'Cannot find missing variable');

    assert.end();
  });

  describe.test('* File - Get File Type', (assert) => {
    assert.equal(lib.file.type(), false, 'No argument');
    assert.equal(lib.file.type('file.type'), 'type', 'Normal type');
    assert.equal(lib.file.type('.gitignore'), 'gitignore', 'Dot file');
    assert.equal(lib.file.type('.eslintrc-test'), 'eslintrc-test', 'Long type');
    assert.equal(lib.file.type('jquery.min.js'), 'js', 'Double type');
    assert.equal(lib.file.type('image.JPG'), 'JPG', 'Uppercase type');
    assert.equal(lib.file.type('image.JPeG'), 'JPeG', 'Mixed case type');
    assert.equal(lib.file.type('word.'), '', 'No type (w/ dot)');
    assert.equal(lib.file.type('word'), '', 'No type');
    assert.equal(lib.file.type('folder/file.type'), 'type', 'Normal type with relative path (forward slash)');
    assert.equal(lib.file.type('folder\file.type'), 'type', 'Normal type with relative path (back slash)');
    assert.end();
  });

  describe.test('* File - Get Mime Type', (assert) => {
    assert.equal(lib.file.mimeType(), false, 'No argument');
    assert.equal(lib.file.mimeType('.eslintrc-test'), false, 'Unsupported type');
    assert.equal(lib.file.mimeType('jquery.min.js'), 'application/javascript', 'JavaScript');
    assert.equal(lib.file.mimeType('image.JPG'), 'image/jpeg', 'Uppercase JPEG');
    assert.equal(lib.file.mimeType('image.JPeG'), 'image/jpeg', 'Mixed case JPEG');
    assert.equal(lib.file.mimeType('word'), false, 'No type');
    assert.equal(lib.file.mimeType('folder/file.mp4'), 'video/mp4', 'Video type with relative path (forward slash)');
    assert.equal(lib.file.mimeType('folder\file.webm'), 'video/webm', 'Video type with relative path (back slash)');
    assert.end();
  });

  describe.test('* File - Extension to Mime type', (assert) => {
    ['raw', 'arw'].forEach((type) => {
      const mime = lib.file.mimeType(type);
      assert.equal(mime, 'image/raw', `Image (${type})`);
    });

    ['m2ts', 'mts'].forEach((type) => {
      const mime = lib.file.mimeType(type);
      assert.equal(mime, 'video/mp2t', `Video (${type})`);
    });

    assert.end();
  });

  describe.test('* File - Get Medium Type', (assert) => {
    assert.equal(lib.file.mediumType(), false, 'No argument');
    assert.equal(lib.file.mediumType(''), false, 'Blank type');
    assert.equal(lib.file.mediumType(1), false, 'Not string');
    assert.equal(lib.file.mediumType('FAKE'), false, 'Fake type');
    assert.equal(lib.file.mediumType('image/jpeg'), 'image', 'JPEG is image');
    assert.equal(lib.file.mediumType('image'), 'image', 'image is image');
    assert.equal(lib.file.mediumType('photo'), 'image', 'photo is image');
    assert.equal(lib.file.mediumType('video/mp4'), 'video', 'MP4 is video');
    assert.equal(lib.file.mediumType('video'), 'video', 'video is video');
    assert.equal(lib.file.mediumType('video/webm'), 'video', 'WebM is video');
    assert.end();
  });

  describe.test('* File - Extension to Medium type', (assert) => {
    lib.config.get('rawFileTypes.photo').forEach((type) => {
      const medium = lib.file.mediumType(lib.file.mimeType(type));
      assert.equal(medium, 'image', `Image (${type})`);
    });

    lib.config.get('rawFileTypes.video').forEach((type) => {
      const medium = lib.file.mediumType(lib.file.mimeType(type));
      assert.equal(medium, 'video', `Video (${type})`);
    });

    assert.end();
  });

  describe.test('* File - Ensure absolute path', (assert) => {
    const test = lib.file.absolutePath;
    assert.equal(
      test('./server/plugins/utils/test'), __dirname,
      'Relative resolved to Absolute folder',
    );
    assert.equal(
      test('./server/plugins/utils/test/fixtures/aitch.html'), path.join(__dirname, './fixtures/aitch.html'),
      'Relative resolved to Absolute file',
    );
    assert.equal(
      test('./server/plugins/utils/test/'), path.join(__dirname, '/'),
      'Relative resolved to Absolute folder trailing slash',
    );
    if (lib.platform === 'windows') {
      assert.equal(
        test('./server/plugins/utils/test/'), path.join(__dirname, '\\'),
        'Relative resolved to Absolute folder trailing backslash',
      );
    }
    assert.equal(
      test(__dirname), __dirname,
      'Absolute resolved to folder',
    );
    assert.equal(
      test(path.join(__dirname, './fixtures/aitch.html')), path.join(__dirname, './fixtures/aitch.html'),
      'Absolute to file',
    );
    assert.end();
  });

  describe.test('* File - Convert thumbs path to photos path', (assert) => {
    const test = lib.file.photoPath;
    assert.equal(test(), undefined, 'Missing path arg');
    assert.equal(test('media/thumbs/2001/2001-03-21-01.jpg'), 'media/photos/2001/2001-03-21-01.jpg', 'Normal path');
    assert.equal(test('media/thumbs/2001/2001-thumbs.jpg'), 'media/photos/2001/2001-thumbs.jpg', 'Thumbs in path');
    assert.end();
  });

  describe.test('* File - Convert video filename to thumbs path', (assert) => {
    const test = lib.file.videoToThumbsPath;
    assert.equal(test(), undefined, 'Missing path arg');
    assert.equal(test('2001-video-description.mp4'), undefined, 'Missing gallery');
    assert.equal(
      test('2001-video-description.mp4', 'demo'),
      '/static/gallery-demo/media/thumbs/2001/2001-video-description.jpg', 'Single Video',
    );
    assert.equal(
      test('2002-03-21-01.mp4', 'demo'),
      '/static/gallery-demo/media/thumbs/2002/2002-03-21-01.jpg', 'Single Video as Year',
    );
    assert.equal(
      test('2003-video.avi,2004-video.mts', 'demo'),
      '/static/gallery-demo/media/thumbs/2003/2003-video.jpg', 'Multiple videos',
    );
    assert.end();
  });

  describe.test('* File - Glob', async (assert) => {
    try {
      const expectedHtm = path.join(__dirname, './fixtures/aitch.htm');
      const expectedHtml = path.join(__dirname, './fixtures/aitch.html');

      let files = await lib.file.glob('./server/plugins/utils/test/fixtures', '*.fake');
      assert.equal(files.length, [].length, 'Find nothing (*.fake)');

      files = await lib.file.glob('./server/plugins/utils/test/fixtures', '*.htm');
      assert.equal(path.resolve(files[0]), expectedHtm, 'Find HTM (*.htm)');

      files = await lib.file.glob('./server/plugins/utils/test/fixtures', '*.html');
      assert.equal(path.resolve(files[0]), expectedHtml, 'Find HTML (*.html)');

      files = await lib.file.glob('./server/plugins/utils/test/fixtures', '*.htm*');
      assert.equal(path.resolve(files[0]), expectedHtm, 'Find HTM (*.htm*)');
      assert.equal(path.resolve(files[1]), expectedHtml, 'Find HTML (*.htm*)');

      files = await lib.file.glob('./server/plugins/utils/test/fixtures', '*.*');
      assert.equal(path.resolve(files[0]), expectedHtm, 'Find HTM (*.*)');
      assert.equal(path.resolve(files[1]), expectedHtml, 'Find HTML (*.*)');

      files = await lib.file.glob('./server/plugins/utils/test/fixtures/aitch.html', '.htm', { ignoreExtension: true });
      assert.equal(path.resolve(files[0]), expectedHtm, 'Find HTM (.htm)');
    } catch (error) {
      assert.fail(error);
    }
    assert.end();
  });

  function getFailurePath({
    assert, testPath, message,
  }) {
    try {
      lib.file.safePublicPath(testPath);
      assert.fail('Safe path incorrectly found');
    } catch (error) {
      if (error.isBoom) {
        assert.pass(message);
      } else {
        assert.fail('Error should be boom');
      }
    }
  }

  function getSuccessPath({
    assert, testPath, expected, message,
  }) {
    try {
      const actual = lib.file.safePublicPath(testPath);
      assert.ok(actual.endsWith(expected), message);
    } catch (e) {
      assert.fail(`Safe path incorrectly missed (${testPath});`);
    }
  }

  describe.test('* File - Safe Public Path - Throws an exception', (assert) => {
    assert.plan(3);

    getFailurePath({
      assert, testPath: undefined, message: 'Execute with undefined arg',
    });

    getFailurePath({
      assert, testPath: null, message: 'Execute with null arg',
    });

    getFailurePath({
      assert, testPath: true, message: 'Execute with true arg',
    });
  });

  describe.test('* File - Safe Public Path - Traverse up directory(s)', (assert) => {
    assert.plan(2);

    getFailurePath({
      assert, testPath: '../', message: 'Up one folder',
    });

    getFailurePath({
      assert, testPath: '../../', message: 'Up two folders',
    });
  });

  describe.test('* File - Safe Public Path - Root', (assert) => {
    assert.plan(2);

    const normalPath = path.normalize('/history/public');

    getSuccessPath({
      assert, testPath: '', expected: normalPath, message: 'Public folder system path (Blank)',
    });

    getSuccessPath({
      assert, testPath: '/', expected: path.normalize(`${normalPath}/`), message: 'Public folder system path (Slash)',
    });
  });

  describe.test('* File - Safe Public Path - File', (assert) => {
    assert.plan(1);

    const normalPath = path.normalize('/history/public/fixtures/exists.txt');

    getSuccessPath({
      assert, testPath: '/fixtures/exists.txt', expected: normalPath, message: 'Public folder with file',
    });
  });

  describe.test('* File - Safe Public Path - Root absolute path', (assert) => {
    assert.plan(2);

    const testPath = path.join(__dirname, '../../../../../public/test/fixtures');
    const normalFilePath = path.normalize('/history/public/test/fixtures/exists.txt');
    const normalFolderPath = path.normalize('/history/public/test/fixtures');

    getSuccessPath({
      assert, testPath: path.join(testPath, '/exists.txt'), expected: normalFilePath, message: 'Public folder absolute file',
    });

    getSuccessPath({
      assert, testPath, expected: normalFolderPath, message: 'Public folder with absolute folder',
    });
  });
});
