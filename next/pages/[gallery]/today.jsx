import styled from 'styled-components'
import { get as getGalleries } from '../../src/lib/galleries'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getAlbum } from '../../src/lib/album'
import ThumbImg from '../../src/components/ThumbImg'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)

  // reverse order for albums in ascending order (oldest on top)
  const allItems = await [...albums].reverse().reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = items.filter((item) => item?.filename?.substring?.(5, 10) === new Date().toLocaleDateString().substring(5, 10))
    return prev.concat(itemsMatchDate)
  }, Promise.resolve([]))

  return {
    props: { items: allItems },
  }
}

export async function getStaticPaths() {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

const Wrapper = styled.ul`
  list-style: none;
  padding-left: 2px;
`

function Today({ items }) {
  return (
    <Wrapper>
      {items.map((item) => (
        <ThumbImg
          caption={item.caption}
          key={item.filename}
          id={`select${item.id}`}
          src={item.thumbPath}
        />
      ))}
    </Wrapper>
  )
}

export default Today
