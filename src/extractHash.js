

export default function extractHash(str) {
  const match = /\{\{__lrhash\$\$:([0-9a-z]+)\}\}/g.exec(str)
  return match && match[1]
}
