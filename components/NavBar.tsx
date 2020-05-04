import Link from 'next/link'
import {PropsWithChildren} from 'react'
import styles from './NavBar.module.css'

type Props = {
  loggedIn: boolean
}

export default function NavBar(props: PropsWithChildren<Props>) {
  return (
    <div className={styles.NavBar}>
      <h1>
        <Link href={props.loggedIn ? '/simulations' : '/'}>
          <a>Covid Simulator</a>
        </Link>
      </h1>

      <div className={styles.NavBarContent}>{props.children}</div>

      <h1>
        <Link href="/about">
          <a>About</a>
        </Link>
      </h1>

      {props.loggedIn && <a href="/logout">Log out</a>}
    </div>
  )
}
