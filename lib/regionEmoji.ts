import emojiFlags from 'emoji-flags'

export default function flagAndName(
  regionID: string,
  regionName: string
): string {
  const country = emojiFlags.countryCode(regionID)
  return country ? `${country.emoji} ${regionName}` : regionName
}
