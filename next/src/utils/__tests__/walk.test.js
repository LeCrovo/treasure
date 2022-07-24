import {
  isImage,
  parseHash,
  addParentDirectoryNav,
  associateMedia,
  generateImageFilenames,
  isAnyImageOrVideo,
  mergeMedia,
  getJpgLike,
} from '../walk'

describe('Walk - util', () => {
  describe('isImage', () => {
    test('detect JPG', () => {
      expect(isImage({ mediumType: 'image', ext: 'JPEG' })).toEqual(true)
      expect(isImage({ mediumType: 'image', ext: 'jpeg' })).toEqual(true)
      expect(isImage({ mediumType: 'image', ext: 'JPG' })).toEqual(true)
      expect(isImage({ mediumType: 'image', ext: 'jpg' })).toEqual(true)
    })

    test('ignore RAW', () => {
      expect(isImage({ mediumType: 'image', ext: 'RAW' })).toEqual(false)
      expect(isImage({ mediumType: 'image', ext: 'ARW' })).toEqual(false)
    })
  })

  describe('parseHash', () => {
    test('find 1', () => {
      const path = 'dotca'
      const received = parseHash('path', `http://localhost#path=${path}`)
      expect(received).toBe(path)
    })

    test('find 0', () => {
      const received = parseHash('path', 'http://localhost')
      expect(received).toBeNull()
    })
  })

  describe('addParentDirectoryNav', () => {
    const file = {
      filename: '..',
      content: '..',
      mediumType: 'folder',
      id: 'item-up-directory',
      name: 'UpDirectory',
    }
    let dummyFile

    beforeEach(() => {
      dummyFile = { id: 'testid.js', ext: 'js' }
    })

    test('hide when at root folder', () => {
      expect(addParentDirectoryNav([dummyFile], null)).toEqual([dummyFile])
      expect(addParentDirectoryNav([dummyFile])).toEqual([dummyFile])
      expect(addParentDirectoryNav([dummyFile], '')).toEqual([dummyFile])
    })

    test('one level deep', () => {
      const expectedFile = { ...file, path: '' }
      expect(addParentDirectoryNav([dummyFile], 'galleries')).toEqual([
        expectedFile,
        dummyFile,
      ])
    })

    test('two levels deep', () => {
      const expectedFile = { ...file, path: 'galleries' }
      expect(addParentDirectoryNav([dummyFile], 'galleries/demo')).toEqual([
        expectedFile,
        dummyFile,
      ])
    })

    test('three levels deep', () => {
      const expectedFile = { ...file, path: 'galleries/demo' }
      expect(
        addParentDirectoryNav([dummyFile], 'galleries/demo/thumbs'),
      ).toEqual([expectedFile, dummyFile])
    })
  })

  describe('isAnyImageOrVideo', () => {
    test('images', () => {
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'JPEG' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'jpeg' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'JPG' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'jpg' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'RAW' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'image', ext: 'ARW' })).toEqual(
        true,
      )
    })

    test('videos', () => {
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'mp4' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'webm' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'avi' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'mov' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'm2ts' })).toEqual(
        true,
      )
      expect(isAnyImageOrVideo({ mediumType: 'video', ext: 'mts' })).toEqual(
        true,
      )
    })
  })

  describe('associateMedia', () => {
    test('JPG and RAW', () => {
      /* eslint-disable object-curly-newline */
      const expected = {
        DSC03721: [
          {
            content: 'DSC03721.RAW',
            filename: 'DSC03721.RAW',
            name: 'DSC03721',
            id: 'item-raw-0',
            mediumType: 'image',
            ext: 'RAW',
          },
          {
            content: 'DSC03721.JPG',
            filename: 'DSC03721.JPG',
            name: 'DSC03721',
            id: 'item-jpg-0',
            mediumType: 'image',
            ext: 'JPG',
          },
        ],
        DSC03722: [
          {
            content: 'DSC03722.RAW',
            filename: 'DSC03722.RAW',
            name: 'DSC03722',
            id: 'item-raw-1',
            mediumType: 'image',
            ext: 'RAW',
          },
          {
            content: 'DSC03722.JPG',
            filename: 'DSC03722.JPG',
            name: 'DSC03722',
            id: 'item-jpg-1',
            mediumType: 'image',
            ext: 'JPG',
          },
        ],
        DSC03723: [
          {
            content: 'DSC03723.RAW',
            filename: 'DSC03723.RAW',
            name: 'DSC03723',
            id: 'item-raw-2',
            mediumType: 'image',
            ext: 'RAW',
          },
          {
            content: 'DSC03723.JPG',
            filename: 'DSC03723.JPG',
            name: 'DSC03723',
            id: 'item-jpg-2',
            mediumType: 'image',
            ext: 'JPG',
          },
        ],
        DSC03724: [
          {
            content: 'DSC03724.RAW',
            filename: 'DSC03724.RAW',
            name: 'DSC03724',
            id: 'item-raw-3',
            mediumType: 'image',
            ext: 'RAW',
          },
          {
            content: 'DSC03724.JPG',
            filename: 'DSC03724.JPG',
            name: 'DSC03724',
            id: 'item-jpg-3',
            mediumType: 'image',
            ext: 'JPG',
          },
        ],
      }
      /* eslint-enable object-curly-newline */
      const generated = generateImageFilenames(8, 'jpgraw')
      const received = associateMedia(generated)
      expect(received.grouped).toEqual(expected)
      expect(received.flat).toEqual(generated)
    })

    test('check immutability', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      associateMedia(generated)
      expect(generateImageFilenames(8, 'jpgraw')).toEqual(generated)
    })
  })

  describe('mergeMedia', () => {
    test('JPG and RAW', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      const received = mergeMedia(associateMedia(generated))
      /* eslint-disable object-curly-newline */
      const expected = [
        {
          content: 'DSC03721 +RAW +JPG',
          filename: 'DSC03721.JPG',
          id: 'item-jpg-0',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03721',
        },
        {
          content: 'DSC03722 +RAW +JPG',
          filename: 'DSC03722.JPG',
          id: 'item-jpg-1',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03722',
        },
        {
          content: 'DSC03723 +RAW +JPG',
          filename: 'DSC03723.JPG',
          id: 'item-jpg-2',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03723',
        },
        {
          content: 'DSC03724 +RAW +JPG',
          filename: 'DSC03724.JPG',
          id: 'item-jpg-3',
          mediumType: 'image',
          ext: 'JPG',
          name: 'DSC03724',
        },
      ]
      /* eslint-enable object-curly-newline */
      expect(received).toEqual(expected)
    })

    test('check immutability', () => {
      const generated = generateImageFilenames(8, 'jpgraw')
      mergeMedia(associateMedia(generated))
      expect(generateImageFilenames(8, 'jpgraw')).toEqual(generated)
    })

    test('DOC and RAW', () => {
      const generated = generateImageFilenames(8, 'docraw')
      const received = mergeMedia(associateMedia(generated))
      expect(received).toEqual(generated)
    })

    test('with Up Directory nav', () => {
      const generated = generateImageFilenames(8, 'docraw')
      addParentDirectoryNav(generated, 'fake')
      const received = mergeMedia(associateMedia(generated))
      expect(received).toEqual(generated)
    })
  })

  describe('getJpgLike', () => {
    test('JPG', () => {
      const received = getJpgLike(
        associateMedia(generateImageFilenames(2, 'jpgraw')).grouped.DSC03721,
      )
      expect(received.ext).toEqual('JPG')
      expect(received.index).toEqual(1)
    })

    test('JPEG', () => {
      const received = getJpgLike(
        associateMedia(generateImageFilenames(1, 'jpeg')).grouped.DSC03721,
      )
      expect(received.ext).toEqual('JPEG')
      expect(received.index).toEqual(0)
    })

    test('check immutability', () => {
      const generated = generateImageFilenames(1, 'jpeg')
      getJpgLike(
        associateMedia(generateImageFilenames(1, 'jpeg')).grouped.DSC03721,
      )
      expect(generateImageFilenames(1, 'jpeg')).toEqual(generated)
    })
  })
})
