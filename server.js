const express=require("express");
const session=require("express-session");
const Database=require("better-sqlite3");
const path=require("path");
const crypto=require("crypto");

const app=express();
const db=new Database(process.env.DB_PATH||"rs.sqlite");
const PORT=process.env.PORT||3000;
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD;

if(!ADMIN_PASSWORD){
 console.warn("⚠️ Définissez ADMIN_PASSWORD avant le déploiement.");
}

db.exec(`CREATE TABLE IF NOT EXISTS submissions(
 id TEXT PRIMARY KEY,
 created_at TEXT NOT NULL,
 prenom TEXT NOT NULL,
 nom TEXT NOT NULL,
 age INTEGER NOT NULL,
 telephone TEXT NOT NULL,
 latitude REAL,
 longitude REAL,
 reseaux TEXT,
 reseau_principal TEXT,
 pseudo TEXT,
 temps TEXT,
 motif TEXT,
 experience INTEGER,
 amelioration TEXT,
 camera_verified INTEGER DEFAULT 0
)`);

app.use(express.json({limit:"100kb"}));
app.use(express.static(path.join(__dirname,"public")));
app.use(session({
 secret:process.env.SESSION_SECRET||crypto.randomBytes(32).toString("hex"),
 resave:false,saveUninitialized:false,
 cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:8*60*60*1000}
}));

function auth(req,res,next){
 if(req.session.admin)return next();
 res.status(401).json({error:"Non autorisé"});
}
function clean(v,max=1000){return String(v??"").trim().slice(0,max)}

app.post("/api/submissions",(req,res)=>{
 const b=req.body||{};
 if(!b.prenom||!b.nom||!b.age||!b.telephone||!b.consent)
   return res.status(400).json({error:"Champs obligatoires manquants"});
 const id="RS-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();
 db.prepare(`INSERT INTO submissions
 (id,created_at,prenom,nom,age,telephone,latitude,longitude,reseaux,reseau_principal,pseudo,temps,motif,experience,amelioration,camera_verified)
 VALUES (@id,@created_at,@prenom,@nom,@age,@telephone,@latitude,@longitude,@reseaux,@reseau_principal,@pseudo,@temps,@motif,@experience,@amelioration,@camera_verified)`).run({
  id,created_at:new Date().toISOString(),prenom:clean(b.prenom,100),nom:clean(b.nom,100),
  age:Number(b.age),telephone:clean(b.telephone,40),
  latitude:Number.isFinite(Number(b.latitude))?Number(b.latitude):null,
  longitude:Number.isFinite(Number(b.longitude))?Number(b.longitude):null,
  reseaux:JSON.stringify(Array.isArray(b.reseaux)?b.reseaux.slice(0,20):[]),
  reseau_principal:clean(b.reseauPrincipal,50),pseudo:clean(b.pseudo,100),
  temps:clean(b.temps,100),motif:clean(b.motif,100),
  experience:Number(b.experience)||null,amelioration:clean(b.amelioration,3000),
  camera_verified:b.cameraVerified?1:0
 });
 res.json({ok:true,id});
});

app.post("/api/admin/login",(req,res)=>{
 if(!ADMIN_PASSWORD)return res.status(500).json({error:"ADMIN_PASSWORD n'est pas configuré"});
 if(crypto.timingSafeEqual(Buffer.from(clean(req.body.password,200)),Buffer.from(ADMIN_PASSWORD)))
   {req.session.admin=true;return res.json({ok:true});}
 res.status(401).json({error:"Mot de passe incorrect"});
});
app.post("/api/admin/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/admin/me",(req,res)=>res.json({authenticated:!!req.session.admin}));
app.get("/api/admin/submissions",auth,(req,res)=>{
 const rows=db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
 rows.forEach(r=>{try{r.reseaux=JSON.parse(r.reseaux||"[]")}catch{r.reseaux=[]}});
 res.json(rows);
});

app.delete("/api/admin/submissions/:id",auth,(req,res)=>{
 const r=db.prepare("DELETE FROM submissions WHERE id=?").run(req.params.id);
 res.json({ok:true,deleted:r.changes});
});

app.listen(PORT,()=>console.log(`R.S V2 lancé sur http://localhost:${PORT}`));
