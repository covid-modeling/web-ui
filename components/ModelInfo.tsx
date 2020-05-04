import {MinimalModelSpec, ModelSpec} from '../lib/models'
import Code from '../svg/Code.svg'
import Link from '../svg/Link.svg'
import styles from './ModelInfo.module.css'
import OutboundLink from './OutboundLink'
import btnStyles from './styles/button.module.css'

type Props = {
  modelSpec: ModelSpec | MinimalModelSpec
  minimal?: boolean
}

export default function ModelInfo(props: Props) {
  const spec = props.modelSpec
  const fullSpec = spec as ModelSpec
  const links = spec.metaURLs

  return (
    <div
      className={`${
        props.minimal ? styles.minimalcontainer : styles.largecontainer
      } ${styles.container}`}
    >
      {!props.minimal && (
        <>
          <h1 className="text-3.2xl font-bold">{fullSpec.name}</h1>
          <h2 className="text-sm font-bold">{fullSpec.origin}</h2>
          <p>{fullSpec.description}</p>
        </>
      )}

      <div className={styles.links}>
        {links?.paper ? (
          <OutboundLink href={links.paper} className={btnStyles.button}>
            <Link />
            Read the paper
          </OutboundLink>
        ) : null}

        {links?.website ? (
          <OutboundLink href={links.website} className={btnStyles.button}>
            <Link />
            Website
          </OutboundLink>
        ) : null}

        {links?.code ? (
          <OutboundLink href={links.code} className={btnStyles.button}>
            <Code />
            Code
          </OutboundLink>
        ) : null}
      </div>
    </div>
  )
}
