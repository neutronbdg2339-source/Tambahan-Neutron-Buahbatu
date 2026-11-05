 "use client";
import {useEffect,useMemo,useState} from "react";
import {fields,request,RecordData} from "../lib/api";
const blank=()=>Object.fromEntries(fields.map(f=>[f,""])) as RecordData;
export default function Home(){
 const [rows,setRows]=useState<RecordData[]>([]),[form,setForm]=useState<RecordData>(blank()),[editId,setEditId]=useState(""),[search,setSearch]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 async function load(){setBusy(true);try{const r=await request("list");setRows(r.data||[]);setMsg("");}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(r=>fields.some(f=>(r[f]||"").toLowerCase().includes(search.toLowerCase()))),[rows,search]);
 function change(k:string,v:string){setForm(p=>({...p,[k]:v}))}
 async function save(){setBusy(true);try{await request(editId?"update":"create",form,editId||undefined);setMsg(editId?"Data diperbarui.":"Data ditambahkan.");setForm(blank());setEditId("");await load()}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 function edit(r:RecordData){setForm(Object.fromEntries(fields.map(f=>[f,r[f]||""])) as RecordData);setEditId(r.ID||"");window.scrollTo({top:0,behavior:"smooth"})}
 async function del(id:string){if(!confirm("Hapus data ini?"))return;setBusy(true);try{await request("delete",undefined,id);setMsg("Data dihapus.");await load()}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 function exportCsv(){const csv=[fields.join(","),...filtered.map(r=>fields.map(f=>`"${(r[f]||"").replace(/"/g,'""')}"`).join(","))].join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));a.download="Rekap_Kelas_Tambahan_Neutron.csv";a.click();}
 return <main><header><h1>NEUTRON BANDUNG 2 BUAH BATU</h1><div>Pendataan Kelas Tambahan</div></header>
 {msg&&<div className="status">{msg}</div>}
 <section className="panel"><h2>{editId?"Edit Data Tambahan":"Input Kelas Tambahan"}</h2><div className="grid">
 {fields.map((f,i)=><div key={f}><label>{f}</label>{f==="Materi yang dibahas"?<textarea value={form[f]} onChange={e=>change(f,e.target.value)}/>:f==="Tanggal Tambahan"||f==="Deadline Tugas"?<input type="date" value={form[f]} onChange={e=>change(f,e.target.value)}/>:f==="Pengerjaan"?<select value={form[f]} onChange={e=>change(f,e.target.value)}><option value="">Pilih status</option><option>Belum</option><option>Proses</option><option>Selesai</option><option>Tidak ada tugas</option></select>:<input value={form[f]} onChange={e=>change(f,e.target.value)} placeholder={`Isi ${f.toLowerCase()}`}/>}</div>)}
 </div><div style={{marginTop:15}}><button onClick={save} disabled={busy}>{busy?"Memproses…":editId?"Simpan Perubahan":"Tambah Data"}</button>{editId&&<button className="secondary" onClick={()=>{setForm(blank());setEditId("")}}>Batal Edit</button>}</div></section>
 <section className="panel"><div className="toolbar"><h2 style={{marginRight:"auto"}}>Data Kelas Tambahan ({filtered.length})</h2><input placeholder="Cari nama, kelas, mapel…" value={search} onChange={e=>setSearch(e.target.value)}/><button className="secondary" onClick={exportCsv}>Export CSV</button><button className="secondary" onClick={load}>Refresh</button></div>
 <div className="tablewrap"><table><thead><tr>{fields.map(f=><th key={f}>{f}</th>)}<th>Aksi</th></tr></thead><tbody>{filtered.map(r=><tr key={r.ID}>{fields.map(f=><td key={f}>{r[f]}</td>)}<td className="actions"><button onClick={()=>edit(r)}>Edit</button><button className="danger" onClick={()=>del(r.ID||"")}>Hapus</button></td></tr>)}</tbody></table>{!filtered.length&&<div className="empty">{busy?"Memuat data…":"Belum ada data atau pencarian tidak ditemukan."}</div>}</div></section>
 <p className="muted">Internal • Neutron Bandung 2 Buahbatu</p></main>
}
