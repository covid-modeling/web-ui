import {PropsWithChildren} from 'react'
import NavBar from './NavBar'

type Props = {
  loggedIn: boolean
}

export default function AppFrame(props: PropsWithChildren<Props>) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none">
        <NavBar loggedIn={props.loggedIn} />
      </div>
      <div className="flex-1">{props.children}</div>
    </div>
  )
}
