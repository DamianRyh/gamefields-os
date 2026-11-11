/* eslint-disable @next/next/no-img-element */
export function BrandWordmark({className="",inverse=false}:{className?:string;inverse?:boolean}) {
  return <img className={`brand-wordmark ${className}`} src={inverse?"/brand/logo-white.svg":"/brand/logo-black.svg"} width={647} height={136} alt="gamefields"/>;
}
