import {getStore} from '@netlify/blobs';
import {scryptSync,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {BrainError} from './providers.mjs';
export function openBrainStore(env=process.env) {
  const blob=getStore({name:'knowledge-daily-brain',consistency:'strong'});
  const key=scryptSync(env.KNOWLEDGE_OWNER_PASSWORD,'uko-encryption-v1',32);
  function encode(data) {
    const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    const encrypted=Buffer.concat([cipher.update(JSON.stringify(data)),cipher.final()]);
    return JSON.stringify({v:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),body:encrypted.toString('base64')});
  }
  function decode(text) {
    try {
      const value=JSON.parse(text),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(value.iv,'base64'));
      decipher.setAuthTag(Buffer.from(value.tag,'base64'));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.body,'base64')),decipher.final()]).toString());
    }catch{throw new BrainError('cloudUnreadable',503);}
  }
  return {
    async read() {const result=await blob.getWithMetadata('state',{type:'text'});return result?{value:decode(result.data),etag:result.etag}:{value:{revision:0,config:null,tasks:[],reports:[],cursor:null,completedDay:null},etag:null};},
    async write(value,etag) {const result=await blob.set('state',encode(value),etag?{onlyIfMatch:etag}:{onlyIfNew:true});if(!result.modified)throw new BrainError('cloudConflict',409);},
    async claim(slot) {const result=await blob.set('run/'+slot,encode({at:new Date().toISOString()}),{onlyIfNew:true});return result.modified;},
  };
}
