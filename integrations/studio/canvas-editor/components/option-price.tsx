'use client';
import type {ReactNode} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
export function OptionPrices({children}:{project:Project;quote:QuoteState;children:ReactNode}){return children}
export function OptionPrice(_props:{candidate:Project;scope:'surface'|'construction'|'graphic'|'material'}){return <small className="studio-option-price">Do indywidualnej wyceny</small>}
