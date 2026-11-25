import type {Metadata} from 'next';
import type {ReactNode} from 'react';
/* The wizard is reached from gamefields.eu/budzet-obywatelski/ and the Studio; the indexed page is the WordPress one. */
export const metadata:Metadata={title:'Załóż kampanię do budżetu obywatelskiego · Gamefields',robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}){return children}
