import {Link} from 'react-router-dom';
import {BrainCircuit,ArrowUpRight} from 'lucide-react';
import {useKnowledge} from './context';
import {reports} from './brain';
export default function BrainNotice() {
  const {data,t}=useKnowledge();
  const report=reports(data.records)[0];
  if(!report)return null;
  return <Link to="/knowledge/assistant" className="uko-info uko-brain-notice" data-testid="brain-notice"><BrainCircuit size={18}/><span>{t('brainReportReady')} · {report.day}</span><ArrowUpRight size={17}/></Link>;
}
