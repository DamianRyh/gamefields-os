import type {Metadata} from 'next';
import type {ReactNode} from 'react';
/* Campaign pages are written by residents: not indexed by search engines. */
export const metadata:Metadata={title:'Kampania do budżetu obywatelskiego · Gamefields',robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}){return children}
