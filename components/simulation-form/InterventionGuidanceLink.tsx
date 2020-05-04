import Chevron from '../../svg/Chevron.svg'
import OutboundLink from '../OutboundLink'
import styles from './InterventionGuidanceLink.module.css'

type Props = {
  logo: JSX.Element
  href: string
  text: string
}

export default function InterventionGuidanceLink(props: Props) {
  return (
    <OutboundLink href={props.href} className={styles.link}>
      <div className={styles.logo}>{props.logo}</div>
      <p className={styles.text}>{props.text}</p>
      <Chevron className={styles.chevron} />
    </OutboundLink>
  )
}
