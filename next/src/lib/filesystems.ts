import { glob } from 'glob'
import path from 'node:path'

import utilsFactory from './utils'

type ErrorOptionalMessage = { files: object[]; error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { files: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type Filesystem = {
  ext: string;
  name: string;
  filename: string;
  path: string;
  mediumType: string;
}

type Filesystems = {
  albums: Filesystem[]
}

type FilesystemBody = {
  body: Filesystems; status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

async function get<T extends boolean = false>(
  destinationPath: string | string[] | undefined,
  returnEnvelope?: T,
): Promise<T extends true ? FilesystemBody : Filesystems>;

/**
 * Get file/folder listing from local filesystem
 * @param {string} destinationPath path to lookup
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} files
 */
async function get(
  destinationPath: string | string[] | undefined = '',
  returnEnvelope = false,
): Promise<
  Filesystems | ErrorOptionalMessage | FilesystemBody | ErrorOptionalMessageBody
> {
  try {
    if (destinationPath === null || destinationPath === undefined || Array.isArray(destinationPath)) {
      throw new ReferenceError('Filesystem path is missing')
    }
    const utils = utilsFactory()
    const publicPath = utils.safePublicPath('/')
    const globPath = path.join(publicPath, destinationPath)

    if (!globPath.startsWith(publicPath)) {
      return { body: errorSchema('Invalid system path'), status: 404 }
    }

    const files = await glob(decodeURI(`${globPath}/*`))

    const webPaths = files.map((file): Filesystem => {
      const fileExt = utils.type(file) // case-insensitive
      const fileName = path.basename(file, `.${fileExt}`)
      const mediumType = utils.mediumType(utils.mimeType(fileExt))

      return {
        filename: (fileExt === '') ? fileName : `${fileName}.${fileExt}`,
        mediumType: mediumType || 'folder',
        path: file.replace(globPath, destinationPath),
        ext: fileExt,
        name: fileName,
      }
    })

    const body = { files: webPaths, destinationPath }
    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No files or folders are found'), status: 404 }
    }

    throw e
  }
}

export { errorSchema, type Filesystem }
export default get