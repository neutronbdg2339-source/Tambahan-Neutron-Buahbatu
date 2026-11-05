export const fields = ["Nama Siswa","Kelompok Kelas","Asal Sekolah","Mata Pelajaran","Materi yang dibahas","Tanggal Tambahan","Hari","Jam Tambahan","Pengerjaan","Deadline Tugas","Jam Pulang Sekolah"] as const;
export type RecordData = Record<(typeof fields)[number], string> & {ID?:string};
const URL=process.env.NEXT_PUBLIC_GAS_URL!; const KEY=process.env.NEXT_PUBLIC_API_KEY!;
export async function request(action:string, data?:Record<string,unknown>, id?:string){
 if(!URL||!KEY) throw new Error("Environment belum diatur. Isi NEXT_PUBLIC_GAS_URL dan NEXT_PUBLIC_API_KEY di Vercel.");
 let res:Response;
 if(action==="list"||action==="get") { const q=new URLSearchParams({action,key:KEY}); if(id)q.set("id",id); res=await fetch(`${URL}?${q}`,{cache:"no-store"}); }
 else {res=await fetch(URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,key:KEY,id,data})});}
 const result=await res.json(); if(!result.success)throw new Error(result.message||"Permintaan gagal"); return result;
}
