import {GetServerSideProps} from 'next'
import handleError from '../lib/handle-error'
import redirect from '../lib/redirect'

/* eslint-disable-next-line */
export default function LogoutPage() {}

export const getServerSideProps: GetServerSideProps = handleError(async ctx => {
  redirect(ctx.res, '/api/logout')
  return {props: {}}
})
