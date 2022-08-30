import '../styles/globals.css'
import type { AppProps } from 'next/app'
import "antd/dist/antd.css";
import '../styles/markdown/index.scss'
import '../styles/markdown/codeStyle.scss'
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
