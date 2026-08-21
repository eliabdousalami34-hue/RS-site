const form=document.querySelector("#form"),msg=document.querySelector("#msg");
let coords={};
document.querySelector("#geo").onclick=()=>{
 navigator.geolocation?.getCurrentPosition(p=>{
  coords={latitude:p.coords.latitude,longitude:p.coords.longitude};
  form.latitude.value=coords.latitude;form.longitude.value=coords.longitude;
  document.querySelector("#geoStatus").textContent="Position enregistrée";
 },()=>document.querySelector("#geoStatus").textContent="Position refusée ou indisponible");
};
form.onsubmit=async e=>{
 e.preventDefault();msg.textContent="Envoi…";
 const data=Object.fromEntries(new FormData(form));
 data.consent=document.querySelector("#consent").checked;
 data.reseaux=[];
 try{
  const r=await fetch("/api/submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json();if(!r.ok)throw new Error(j.error);
  msg.textContent="✓ Participation enregistrée. Identifiant : "+j.id;
  form.reset();document.querySelector("#geoStatus").textContent="Aucune position";
 }catch(err){msg.textContent="Erreur : "+err.message}
};