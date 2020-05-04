import AppFrame from '../components/AppFrame'
import Button from '../components/Button'
import handleError from '../lib/handle-error'
import {refuteSession} from '../lib/session'
import GitHub from '../svg/GitHub.svg'
import styles from './index.module.css'

export default function IndexPage() {
  return (
    <AppFrame loggedIn={false}>
      <div className={styles.IndexContent}>
        <a href="/api/login">
          <Button icon={<GitHub />} text="Sign in with GitHub" />
        </a>
      </div>
    </AppFrame>
  )
}

export const getServerSideProps = handleError(refuteSession())
