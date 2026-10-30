const express=require("express"), webpush=require("web-push"), fs=require("fs"), path=require("path");
const app=express(), PORT=process.env.PORT||3000, DATA=path.join(__dirname,"data.json");
app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
function read(){try{return JSON.parse(fs.readFileSync(DATA,"utf8"))}catch{return{subscriptions:[],reminders:[]}}}
function write(d){fs.writeFileSync(DATA,JSON.stringify(d,null,2))}
const keyPath=path.join(__dirname,"vapid-keys.json");
const keys=fs.existsSync(keyPath)?JSON.parse(fs.readFileSync(keyPath,"utf8")):webpush.generateVAPIDKeys();
if(!fs.existsSync(keyPath))fs.writeFileSync(keyPath,JSON.stringify(keys,null,2));
webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:admin@example.com",keys.publicKey,keys.privateKey);
app.get("/api/config",(_q,r)=>r.json({vapidPublicKey:keys.publicKey}));
app.post("/api/subscribe",(q,r)=>{const s=q.body;if(!s?.endpoint||!s?.keys)return r.status(400).json({error:"Invalid subscription"});const d=read();if(!d.subscriptions.some(x=>x.endpoint===s.endpoint))d.subscriptions.push(s);write(d);r.json({ok:true})});
app.post("/api/reminders",(q,r)=>{const {taskId,title,remindAt}=q.body||{},ts=Date.parse(remindAt);if(!taskId||!title||!Number.isFinite(ts))return r.status(400).json({error:"taskId, title and valid remindAt required"});if(ts<=Date.now())return r.status(400).json({error:"Reminder time must be in the future"});const d=read();d.reminders=d.reminders.filter(x=>x.taskId!==taskId);d.reminders.push({taskId,title,remindAt:new Date(ts).toISOString(),sent:false});write(d);r.json({ok:true})});
setInterval(async()=>{const d=read();let changed=false;for(const x of d.reminders){if(!x.sent&&Date.parse(x.remindAt)<=Date.now()){x.sent=true;changed=true;const payload=JSON.stringify({title:"TaskFlow Reminder",body:`Your task "${x.title}" is due soon.`});await Promise.all(d.subscriptions.map(async s=>{try{await webpush.sendNotification(s,payload)}catch(e){if(e.statusCode===404||e.statusCode===410){d.subscriptions=d.subscriptions.filter(z=>z.endpoint!==s.endpoint);changed=true}else console.error("Push failed:",e.message)}}))}}if(changed)write(d)},15000);
app.listen(PORT,()=>console.log(`TaskFlow running at http://localhost:${PORT}`));