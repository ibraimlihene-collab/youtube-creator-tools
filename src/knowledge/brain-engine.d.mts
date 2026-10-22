import type {Entry} from './model';
export interface BrainConfig {version:number;enabled:boolean;autoMove:boolean;cloud:boolean;shareDrive:boolean;shareGmail:boolean;emailReports:boolean;hour:number;timeZone:string;history:Record<string,number>}
export interface BrainMove {id:string;from:string;to:string;expectedUpdatedAt:string}
export interface BrainPlan {day:string;moves:BrainMove[];attention:{id:string;reason:string}[];overdue:number}
export const modelId:string;
export const configId:string;
export function validDay(day:unknown):boolean;
export function dayPlus(day:string,offset:number):string;
export function defaults():BrainConfig;
export function readConfig(records:Entry[]):BrainConfig;
export function zonedDay(now:Date,timeZone:string):string;
export function zonedHour(now:Date,timeZone:string):number;
export type BrainTask = Pick<Entry,'id'|'kind'|'title'|'status'|'updatedAt'|'fields'>;
export function taskSnapshot(records:Entry[]):BrainTask[];
export function planReview(records:Entry[],day:string,capacity:number,history?:Record<string,number>):BrainPlan;
export function applyMoves(records:Entry[],moves:BrainMove[],now?:string):{records:Entry[];applied:BrainMove[]};
