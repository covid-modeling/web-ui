import {PropsWithChildren} from 'react'

type Props = Omit<JSX.IntrinsicElements['a'], 'rel' | 'target'>

const OutboundLink = (props: PropsWithChildren<Props>) => (
  <a target="_blank" rel="noopener noreferrer" {...props}>
    {props.children}
  </a>
)

export default OutboundLink
