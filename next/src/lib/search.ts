import type { GalleryAlbum, Item } from '../types/common'

/**
 * Index search keywords from search xml element and dedupe
 *
 * @param {Object[]} items
 * @param {string} items.search
 * @returns {{ indexedKeywords }}
 */
function indexKeywords(items: { search: Item['search'] | GalleryAlbum['search'] }[]) {
  const summedKeywords = items.reduce((out, item) => {
    item.search?.split(', ').forEach((val) => {
      // eslint-disable-next-line no-param-reassign
      out[val] = (out[val] || 0) + 1
    })
    return out
  }, {} as Record<string, number>)

  function isNum(n: string) {
    return Number.isFinite(Number(n))
  }

  const sortedKeywords = Object.entries(summedKeywords).sort(([nameA, numA], [nameB, numB]) => {
    if (numB - numA !== 0) {
      return numB - numA
    }

    if (isNum(nameA) && isNum(nameB)) {
      return Number(nameB) - Number(nameA)
    }

    return nameA.localeCompare(nameB)
  })

  // prepare for combo box in useSearch custom hook
  return {
    indexedKeywords: sortedKeywords.map(([key, count]) => ({
      label: `${key} (${count})`,
      value: key,
    })),
  }
}

export default indexKeywords

export function addGeographyToSearch(item: Item) {
  const hasComma = item.city.lastIndexOf(',') !== -1
  const country = hasComma ? item.city.substring(item.city.lastIndexOf(', ') + 1).trim() : item.city.trim()

  return item.search === null ? country : `${item.search}, ${country}`
}
