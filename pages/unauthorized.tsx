import Error from 'next/error'
import handleError from '../lib/handle-error'
import {refuteSession} from '../lib/session'

export default function RequestAccessPage() {
  return (
    <Error
      statusCode={401}
      title={'Access has not been enabled for your user'}
    />
  )
}

export const getServerSideProps = handleError(refuteSession())
