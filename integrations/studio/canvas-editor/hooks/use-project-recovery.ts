"use client";
import {useEffect,useRef,useState} from 'react';
import type {Project} from '@/lib/project';
import {DRAFT_KEY,PREVIOUS_KEY,UNREADABLE_KEY,parseVaultProject} from '@/lib/project-vault';
import {readVaultRecord,updateVaultRecord} from '@/lib/browser-vault';
import {persistDraft} from '@/lib/draft-write';
type RecoveryRecord={schemaVersion:1;raw:string;storedAt:string};
const record=(raw:string):RecoveryRecord=>({schemaVersion:1,raw,storedAt:new Date().toISOString()});
function readBackup(value:unknown){const data=value as RecoveryRecord;if(!data||data.schemaVersion!==1||typeof data.raw!=='string')throw Error('Brak poprawnej poprzedniej kopii. Wczytaj pobrany projekt JSON.');return parseVaultProject(data.raw)}
export function useProjectRecovery(project:Project,onLoad:(p:Project)=>void){
 const [ready,setReady]=useState(false),[enabled,setEnabled]=useState(false),[blocked,setBlocked]=useState(false),[previousAvailable,setPreviousAvailable]=useState(false),[saveStatus,setSaveStatus]=useState('Wczytywanie szkicu…'),[message,setMessage]=useState('');
 const expected=useRef<string|null>(null),sequence=useRef(0),allowInvalid=useRef(false),mounted=useRef(false),backupDone=useRef(false);
 useEffect(()=>{
  mounted.current=true;
  try{
   const raw=localStorage.getItem(DRAFT_KEY);expected.current=raw;
   if(raw!==null){const parsed=parseVaultProject(raw);const params=new URLSearchParams(window.location.search);if(!['arena','sport','pattern','view'].some(key=>params.has(key)))onLoad(parsed)}
   setEnabled(true);
  }catch{setBlocked(true);setSaveStatus('Zapis wstrzymany — odzyskaj szkic');setMessage('Nie udało się odczytać szkicu. Jego dane nie zostały nadpisane. Otwórz Pliki projektu, aby wybrać sposób odzyskania.')}
  setReady(true);
  void readVaultRecord(PREVIOUS_KEY).then(value=>{if(!mounted.current)return;try{readBackup(value);setPreviousAvailable(true)}catch{setPreviousAvailable(false)}}).catch(()=>{});
  return()=>{mounted.current=false;sequence.current++};
 },[onLoad]);
 useEffect(()=>{
  const ticket=++sequence.current;
  if(!ready||!enabled||blocked)return;
  setSaveStatus('Zapisywanie…');
  const timer=window.setTimeout(()=>{
   try{parseVaultProject(project)}catch{setSaveStatus('Uzupełnij nazwę i sprawdź projekt');return}
   void persistDraft(localStorage,expected.current,project,async raw=>{if(backupDone.current)return;await updateVaultRecord(PREVIOUS_KEY,()=>record(raw));backupDone.current=true;if(mounted.current)setPreviousAvailable(true)},()=>mounted.current&&sequence.current===ticket,allowInvalid.current).then(next=>{
    if(next!==null)expected.current=next;
    if(next===null||!mounted.current||sequence.current!==ticket)return;
    allowInvalid.current=false;setMessage('');setSaveStatus('Zapisano w tej przeglądarce');
   }).catch(error=>{if(!mounted.current||sequence.current!==ticket)return;setBlocked(true);setEnabled(false);setSaveStatus('Pobierz projekt, aby zachować zmiany');setMessage((error as Error).message+' Otwórz Pliki projektu. Poprzedni zapis pozostaje zachowany.');});
  },350);
  return()=>{window.clearTimeout(timer);sequence.current++};
 },[project,ready,enabled,blocked]);
 async function authorizeReplacement(){
  allowInvalid.current=false;
  const raw=localStorage.getItem(DRAFT_KEY);
  if(raw!==null){let valid=false;try{parseVaultProject(raw);valid=true}catch{}
   await updateVaultRecord(valid?PREVIOUS_KEY:UNREADABLE_KEY,()=>record(raw));
   if(localStorage.getItem(DRAFT_KEY)!==raw)throw Error('Szkic zmienił się w innej karcie. Spróbuj ponownie.');
   allowInvalid.current=!valid;
  }
  backupDone.current=raw!==null;
  expected.current=raw;setBlocked(false);setEnabled(true);setMessage('');
 }
 async function preserveCurrent(){
  if(blocked)throw Error('Najpierw wybierz sposób odzyskania szkicu. Możesz pobrać bieżący projekt JSON.');
  let raw:string;try{raw=JSON.stringify(parseVaultProject(project))}catch{throw Error('Uzupełnij nazwę i sprawdź bieżący projekt przed wczytaniem innego. Możesz też pobrać jego JSON.');}
  await updateVaultRecord(PREVIOUS_KEY,()=>record(raw));backupDone.current=true;setPreviousAvailable(true);
 }
 async function recoverPrevious(){const next=readBackup(await readVaultRecord(PREVIOUS_KEY));await authorizeReplacement();return next}
 function downloadOriginal(){
  let raw=expected.current;try{raw=localStorage.getItem(DRAFT_KEY)??raw}catch{}
  if(raw===null)throw Error('Brak zachowanych danych do pobrania.');
  const link=document.createElement('a'),url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));link.href=url;link.download='gamefields-szkic-do-odzyskania.txt';link.click();URL.revokeObjectURL(url);
 }
 return {saveStatus,blocked,previousAvailable,message,recoverPrevious,authorizeReplacement,downloadOriginal,preserveCurrent};
}
