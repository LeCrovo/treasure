import camelCase from 'camelcase'
import fs from 'node:fs/promises'
import xml2js, { type ParserOptions } from 'xml2js'

import transformJsonSchema, { errorSchema, type ErrorOptionalMessage } from '../models/album'
import type { Album, AlbumMeta } from '../types/common'

const parseOptions: ParserOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)

/**
* Get album XML from local filesystem
* @param {string} gallery name of gallery
* @param {string} album name of album
* @returns {string} album XML
*/
async function getXmlFromFilesystem(gallery: NonNullable<AlbumMeta['gallery']>, album: string) {
  const fileBuffer = await fs.readFile(`public/galleries/${gallery}/${album}.xml`)
  return parser.parseStringPromise(fileBuffer)
}

type Envelope = { body: Album, status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Album | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(
  gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][],
  album: AlbumMeta['albumName'] | AlbumMeta['albumName'][],
  returnEnvelope?: T,
): Promise<T extends true ? Envelope : Album>
/**
 * Get Album XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {string} album name of album
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} album containing meta and items with keys filename, photoCity, photoLoc, thumbCaption, photoDesc
 */
async function get(
  gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][],
  album: AlbumMeta['albumName'] | AlbumMeta['albumName'][],
  returnEnvelope: boolean,
): ReturnAlbumOrErrors {
  try {
    if (gallery === null || gallery === undefined || Array.isArray(gallery)) {
      throw new ReferenceError('Gallery name is missing')
    }
    if (!album === null || album === undefined || Array.isArray(album)) {
      throw new ReferenceError('Album name is missing')
    }
    const xml = await getXmlFromFilesystem(gallery, album)
    const body = transformJsonSchema(xml)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = `No album was found; gallery=${gallery}; album=${album};`
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

    // eslint-disable-next-line no-console
    console.error('ERROR', message, e)
    throw e
  }
}

export { transformJsonSchema }
export default get
