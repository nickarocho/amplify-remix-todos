import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from 'remix'

import { Amplify } from 'aws-amplify'
import config from '../src/aws-exports'
import styles from '@aws-amplify/ui-react/styles.css'

import { AmplifyProvider } from '@aws-amplify/ui-react'

Amplify.configure({ ...config, ssr: true })

export function links () {
  return [
    {
      rel: 'stylesheet',
      href: styles
    }
  ]
}

export function meta () {
  return {
    charset: 'utf-8',
    title: 'Amplify To Dos',
    viewport: 'width=device-width,initial-scale=1'
  }
}

export default function App () {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AmplifyProvider>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </AmplifyProvider>
      </body>
    </html>
  )
}
