// 임시 패치 도구: node scripts/patch-tool.cjs <patch.json>
// patch.json: [{file:"a/m1/mock-05-listening.json", no:2, opt:{"0":"새 보기"}, passage:["from","to"], translation:["from","to"]}]
const fs=require('fs');
const patches=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const cache={};
for(const p of patches){
  const path='src/content/'+p.file;
  cache[path]=cache[path]||JSON.parse(fs.readFileSync(path,'utf8'));
  const q=cache[path].find(x=>x.no===p.no);
  if(!q) throw new Error('no '+p.no+' in '+p.file);
  for(const [i,t] of Object.entries(p.opt||{})) q.options[+i]=t;
  for(const [i,t] of Object.entries(p.note||{})) q.optionNotes[+i]=t;
  for(const k of ['passage','translation']) if(p[k]){ if(!q[k].includes(p[k][0])) throw new Error(p.no+' '+k+' miss: '+p[k][0]); q[k]=q[k].replace(p[k][0],p[k][1]); }
}
for(const [path,d] of Object.entries(cache)) fs.writeFileSync(path,JSON.stringify(d,null,2)+'\n');
console.log('patched',patches.length);
