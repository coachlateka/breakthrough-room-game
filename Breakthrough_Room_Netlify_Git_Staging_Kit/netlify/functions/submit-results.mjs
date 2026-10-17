import { getStore } from '@netlify/blobs';
import { randomUUID, createHash } from 'node:crypto';

const allowedOrigin = process.env.GAME_ORIGIN || '';
const buckets = ['Identity','Healing','Ownership','Alignment','Activation'];
const safe = (s, max=200) => String(s ?? '').trim().slice(0,max);
const validChoice = v => Number.isInteger(v) && v >= 0 && v <= 3;
const mean = a => a.length ? Math.round((a.reduce((x,y)=>x+y,0)/a.length+1)*25) : null;
function report(a) {
  const d=a && typeof a==='object'?a:{};
  const id=d.identity||{}, he=d.healing||{}, ow=d.ownership||{}, al=d.alignment||{}, ac=d.activation||{};
  const choose = x => Array.isArray(x) ? x.filter(validChoice) : [];
  const hc=he.choices && he.choices.mirror;
  const vals=[choose([id.mirror,id.cushion]),choose([hc]),choose([ow.mirror,ow.response]),choose([al.fear,al.comfort,al.purpose])];
  const scores=[...vals.map(mean),(validChoice(ac.vision)&&validChoice(ac.support))?(safe(ac.commitment,300)?100:75):null];
  const focus=['Healing and restoration','Healthy relationships','Clarity and direction','Purpose and growth'][ac.vision]||'Personal growth';
  const support=['Independent reflection','Healing guidance','Coaching accountability','Leadership mentoring'][ac.support]||'Unspecified';
  const recommended=['Self-guided reflection resources','Brand New Me™ Healing Journey','WRUL™ Break Through Coaching','Kingdom Legacy Leaders™ Mentoring'][ac.support]||'Self-guided reflection resources';
  return {scores, focus, support, recommended, commitment:safe(ac.commitment,300), complete:scores.every(x=>x!==null)&&vals.every((v,i)=>v.length===[2,1,2,3][i])};
}
const enc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const template=(first,r)=>`<div style="font-family:Georgia,serif;max-width:620px;margin:auto;background:#faf6ec;padding:28px;color:#193e32"><h1 style="color:#ac854b">Your Breakthrough Blueprint™</h1><p>Hello ${enc(first)},</p><p>You unlocked all five keys! Here is your personal reflection summary.</p>${buckets.map((x,i)=>`<p><b>${x}:</b> ${r.scores[i]===null?'More reflection needed':r.scores[i]+'/100'}</p>`).join('')}<p><b>Your 90-day priority:</b> ${enc(r.focus)}</p><p><b>Support preference:</b> ${enc(r.support)}</p><p><b>Pathway to explore:</b> ${enc(r.recommended)}</p><p><b>Your next action:</b> ${enc(r.commitment||'Choose one practical step this week.')}</p><p style="font-size:12px">These are self-reported reflections, not clinical scores or diagnoses.</p><p>Kingdom F.I.T. Life Academy™ · Heal. Grow. Thrive. Leave a Legacy.</p></div>`;
async function send(to,subject,html){
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.FROM_EMAIL,to:[to],subject,html})});
  if(!r.ok)throw new Error('Mail provider rejected request: '+r.status);
}
export default async function handler(request){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(process.env.ENABLE_RESULTS!=='true'||!process.env.RESEND_API_KEY||!process.env.FROM_EMAIL) return Response.json({error:'Results service is not enabled yet.'},{status:503});
 const origin=request.headers.get('origin')||'';
 if(allowedOrigin && origin!==allowedOrigin)return Response.json({error:'Origin not allowed'},{status:403});
 if(Number(request.headers.get('content-length')||0)>30000)return Response.json({error:'Submission too large'},{status:413});
 try{
  const data=await request.json();
  if(data.website)return Response.json({error:'Invalid submission'},{status:400}); // honeypot
  const first=safe(data.firstName,80), email=safe(data.email,250).toLowerCase();
  if(!first|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof data.marketingConsent!=='boolean')return Response.json({error:'Please check your details.'},{status:400});
  const result=report(data.answers);
  if(!result.complete)return Response.json({error:'Please complete all room reflections before unlocking your results.'},{status:422});
  const id=randomUUID(), store=getStore('breakthrough-leads');
  const emailHash=createHash('sha256').update(email).digest('hex');
  await store.setJSON(id,{id,createdAt:new Date().toISOString(),first,email,emailHash,marketingConsent:data.marketingConsent,consentLabel:'Yes, send me KFLA coaching insights and offers',result});
  await send(email,'Your personal Breakthrough Blueprint™',template(first,result));
  const owner=safe(process.env.COACH_EMAIL||'thrive@kingdomfitlife.com',250);
  await send(owner,'New Breakthrough Room™ assessment',`<p>New completed game: ${enc(first)} (${enc(email)})</p><p>Priority: ${enc(result.focus)}</p><p>Support: ${enc(result.support)}</p><p>Suggested pathway: ${enc(result.recommended)}</p><p>Marketing consent: ${data.marketingConsent?'Yes':'No'}</p><p>Record reference: ${id}. Keep detailed assessment answers private.</p>`);
  return Response.json({verified:true,submissionId:id,result});
 }catch(e){console.error('Breakthrough submission error',e.message);return Response.json({error:'Unable to complete delivery. Please try again later.'},{status:500});}
}
