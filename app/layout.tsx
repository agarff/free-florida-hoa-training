import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Free Florida HOA Training | Single-family communities',description:'A public pilot for Florida single-family HOA boards. Proposed self-paced certification and monthly board continuing education for Chapter 720 HOAs. Unapproved beta; no credit or certificates awarded.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
