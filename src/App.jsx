import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const apiKey = "AIzaSyCf2QHjWZKUdDxcOq6CzR5lD7JwzbBmBV8"; // Votre clé (si utilisée)

const BRAND = {
  name: "G7 Performance",
  title: "Bilan Neuro-Fonctionnel",
  company: "Institut Santé Mentale & Performance",
  logo: "G7-Sante-logo-ronde-2.png", 
  email: "info@institut.com",
};

// --- DATA ---
const SECTIONS = [
  {
    id: 's1', icon: "🛑", title: "Le Frein Principal", desc: "Motif & Impact",
    qs: [
      { id: 'q1', type: 'text', label: "Quel symptôme limite le plus votre performance actuellement ?" },
      { id: 'q2', type: 'radio', label: "Depuis combien de temps ?", options: ["Récent (< 3 mois)", "Persistant (3-12 mois)", "Chronique (> 1 an)"] },
      { id: 'q3', type: 'slider', label: "Impact sur votre capacité décisionnelle (0-10)", min: 0, max: 10 }
    ]
  },
  {
    id: 's2', icon: "🩺", title: "Métabolique & Risques", desc: "Facteurs de santé",
    qs: [
      { id: 'q4', type: 'slider', label: "Niveau d'énergie au réveil (Batterie)", min: 0, max: 10 },
      { id: 'q5', type: 'radio', label: "Historique Glycémie / Tension :", options: ["Aucun", "Sucre élevé connu", "Médication tension", "Les deux"] },
      { id: 'q6', type: 'radio', label: "Hérédité diabétique :", options: ["Non", "Oui (Grands-parents)", "Oui (Parents/Fratrie)"] }
    ]
  },
  {
    id: 's3', icon: "🔥", title: "Douleur & Inflammation", desc: "Signes physiques",
    qs: [
      { id: 'q7', type: 'radio', label: "Douleurs physiques récurrentes ?", options: ["Non", "Oui"] },
      { id: 'q8', type: 'checkbox', label: "Signes inflammatoires :", options: ["Raideurs matin", "Problèmes peau", "Rétention d'eau", "Maux de tête", "Aucun"] }
    ]
  },
  {
    id: 's4', icon: "🧠", title: "Cerveau & Cognition", desc: "Charge mentale",
    qs: [
      { id: 'q9', type: 'radio', label: "Brouillard Mental (Brain Fog) ?", options: ["Jamais", "Parfois", "Souvent", "Constant"] },
      { id: 'q10', type: 'radio', label: "État d'esprit dominant :", options: ["Anxieux/Vigilant", "Déprimé/Éteint", "Irritable", "Stable/Performant"] },
      { id: 'q11', type: 'slider', label: "Capacité à gérer la pression", min: 0, max: 10 }
    ]
  },
  {
    id: 's5', icon: "🥗", title: "Axe Intestin-Cerveau", desc: "Digestion & Énergie",
    qs: [
      { id: 'q12', type: 'radio', label: "Coup de barre après les repas ?", options: ["Non", "Oui, léger", "Oui, fort (Brouillard)"] },
      { id: 'q13', type: 'checkbox', label: "Symptômes digestifs :", options: ["Ballonnements", "Gaz", "Constipation", "Reflux", "Aucun"] },
      { id: 'q14', type: 'radio', label: "Tour de taille :", options: ["Stable", "Prise récente", "Surpoids installé"] }
    ]
  },
  {
    id: 's6', icon: "🌙", title: "Hygiène de Vie", desc: "Sommeil & Habitudes",
    qs: [
      { id: 'q15', type: 'number', label: "Heures de sommeil (moyenne nuit)" },
      { id: 'q16', type: 'radio', label: "Récupération au réveil :", options: ["Non reposé", "Moyen", "Parfaite"] },
      { id: 'q17', type: 'radio', label: "Consommation excitants/alcool :", options: ["Nulle/Rare", "Modérée", "Régulière/Excessive"] }
    ]
  },
  {
    id: 's7', icon: "🛡️", title: "Clinique & Sécurité", desc: "Médical",
    qs: [
      { id: 'q18', type: 'text', label: "Allergies connues ?" },
      { id: 'q19', type: 'textarea', label: "Diagnostics médicaux connus :" },
      { id: 'q20', type: 'textarea', label: "Médicaments (Rx) actuels :" },
      { id: 'q21', type: 'radio', label: "Adhérence médication :", options: ["Oui 100%", "Oublis", "Modif. doses", "Arrêt", "N/A"] },
      { id: 'q22', type: 'textarea', label: "Produits naturels / Vitamines :" }
    ]
  },
  {
    id: 's8', icon: "⭐", title: "Projection", desc: "Le Futur",
    qs: [
      { id: 'q23', type: 'textarea', label: "Si on règle ce problème, quel est votre prochain grand projet ?" }
    ]
  }
];

// --- LOGIQUE (Moteur) ---
const analyze = (answers, bmi) => {
  const recs = ["Signes Vitaux (Standard)"];
  if (bmi > 25) recs.push(`⚖️ Gestion poids (IMC: ${bmi})`);
  
  // Logique simplifiée pour démo
  const txt = JSON.stringify(answers).toLowerCase();
  if (txt.includes('sucre') || txt.includes('tension') || bmi > 27) recs.push("🩸 Dépistage Métabolique (Afinion 2)");
  if (txt.includes('urine') || txt.includes('foncées')) recs.push("💧 Analyse Urinaire");
  if (txt.includes('douleur') || txt.includes('inflamm')) recs.push("🔥 Bilan Inflammatoire");
  
  return recs;
};

// --- COMPOSANTS UI ---
const Input = ({ q, val, setVal }) => {
  const cls = "w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  
  if (q.type === 'text') return <input className={cls} value={val||''} onChange={e=>setVal(e.target.value)} placeholder="Votre réponse..." />;
  if (q.type === 'number') return <input type="number" className={cls + " text-center font-bold text-lg"} value={val||''} onChange={e=>setVal(e.target.value)} placeholder="0" />;
  if (q.type === 'textarea') return <textarea className={cls + " h-24 resize-none"} value={val||''} onChange={e=>setVal(e.target.value)} placeholder="Détails..." />;
  
  if (q.type === 'slider') return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2"><span>Min</span><span>Max</span></div>
      <input type="range" min={q.min} max={q.max} value={val||0} onChange={e=>setVal(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
      <div className="text-center font-bold text-2xl text-indigo-700 mt-2">{val||0}/10</div>
    </div>
  );

  if (q.type === 'radio' || q.type === 'checkbox') {
    const isMulti = q.type === 'checkbox';
    const curr = val || (isMulti ? [] : '');
    const toggle = (opt) => {
      if (!isMulti) return setVal(opt);
      if (curr.includes(opt)) setVal(curr.filter(x=>x!==opt));
      else setVal([...curr, opt]);
    };
    return (
      <div className="space-y-2">
        {q.options.map(opt => {
          const active = isMulti ? curr.includes(opt) : curr === opt;
          return (
            <button key={opt} onClick={()=>toggle(opt)} className={`w-full text-left p-3 rounded-lg border transition-all ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-50 text-slate-700'}`}>
              {active ? "✓ " : ""}{opt}
            </button>
          );
        })}
      </div>
    );
  }
  return null;
};

// --- APP PRINCIPALE ---
export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [user, setUser] = useState({ name:'', dob:'', nam:'', email:'', w:'', h:'', sex:'' });
  
  const bmi = (user.w && user.h) ? (user.w / ((user.h/100)**2)).toFixed(1) : null;

  const next = () => setStep(s => Math.min(s+1, SECTIONS.length+1));
  const prev = () => setStep(s => Math.max(s-1, 0));

  // Génération du rapport texte
  const getReport = () => {
    let txt = `BILAN G7 - ${user.name}\n${user.date || new Date().toLocaleDateString()}\n`;
    txt += `IMC: ${bmi || 'N/A'}\n\n`;
    SECTIONS.forEach(s => {
      txt += `[${s.title}]\n`;
      s.qs.forEach(q => {
        const v = data[q.id];
        txt += `${q.label} ${Array.isArray(v) ? v.join(', ') : (v || '-')}\n`;
      });
      txt += `\n`;
    });
    const recs = analyze(data, bmi);
    txt += `RECOMMANDATIONS:\n${recs.map(r=>"- "+r).join('\n')}`;
    return txt;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans text-slate-800 flex items-center justify-center p-4">
      
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col transition-all" style={{minHeight: '650px'}}>
        
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
           <div className="font-black text-xl tracking-tighter text-indigo-900">G7<span className="text-indigo-400">.</span></div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{step === 0 ? 'Accueil' : step > SECTIONS.length ? 'Terminé' : `Étape ${step}/${SECTIONS.length}`}</div>
        </div>

        {/* CONTENU DÉFILANT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {/* STEP 0: ACCUEIL */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">💼</div>
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{BRAND.appName}</h1>
               <p className="text-slate-500 text-lg mb-8 max-w-md">{BRAND.title}</p>
               
               <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-left shadow-sm">
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nom Complet</label>
                   <input className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={user.name} onChange={e=>setUser({...user, name:e.target.value})} placeholder="Votre nom"/>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Naissance</label><input type="date" className="w-full p-3 rounded-xl border border-slate-200" value={user.dob} onChange={e=>setUser({...user, dob:e.target.value})}/></div>
                   <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Sexe</label><select className="w-full p-3 rounded-xl border border-slate-200 bg-white" value={user.sex} onChange={e=>setUser({...user, sex:e.target.value})}><option value="">-</option><option value="F">F</option><option value="H">H</option></select></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Poids (kg)</label><input type="number" className="w-full p-3 rounded-xl border border-slate-200" value={user.w} onChange={e=>setUser({...user, w:e.target.value})}/></div>
                   <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Taille (cm)</label><input type="number" className="w-full p-3 rounded-xl border border-slate-200" value={user.h} onChange={e=>setUser({...user, h:e.target.value})}/></div>
                 </div>
                 {bmi && <div className="text-center text-xs font-bold text-indigo-500 bg-indigo-50 p-2 rounded-lg">IMC Estimé : {bmi}</div>}
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1"># RAMQ</label>
                   <input className="w-full p-3 rounded-xl border border-slate-200 uppercase" value={user.nam} onChange={e=>setUser({...user, nam:e.target.value})} placeholder="ABCD 1234..."/>
                 </div>
               </div>
               
               <button disabled={!user.name || !user.nam} onClick={next} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none">
                 Commencer l'analyse
               </button>
            </div>
          )}

          {/* QUESTIONS */}
          {step > 0 && step <= SECTIONS.length && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm border border-slate-100">{SECTIONS[step-1].icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{SECTIONS[step-1].title}</h2>
                  <p className="text-slate-500">{SECTIONS[step-1].desc}</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {SECTIONS[step-1].qs.map(q => (
                  <div key={q.id}>
                    <label className="block font-bold text-slate-700 mb-3 ml-1">{q.label}</label>
                    <Input q={q} val={data[q.id]} setVal={v => setData({...data, [q.id]: v})} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIN */}
          {step > SECTIONS.length && (
            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">✅</div>
               <h2 className="text-3xl font-bold text-slate-900 mb-2">Bilan Prêt</h2>
               <p className="text-slate-500 mb-8">Votre profil a été analysé. Veuillez procéder à l'envoi.</p>
               
               <div className="w-full space-y-3">
                 <a href={`mailto:${BRAND.email}?subject=Bilan G7 - ${user.name}&body=${encodeURIComponent(getReport())}`} className="block w-full p-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Envoyer par Courriel</a>
                 <button onClick={()=>window.print()} className="block w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">Sauvegarder PDF</button>
               </div>

               <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full text-left">
                 <div className="text-xs font-bold text-slate-400 uppercase mb-2">Aperçu clinique</div>
                 <div className="text-sm font-mono text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                   {getReport()}
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* FOOTER NAV */}
        {step > 0 && step <= SECTIONS.length && (
          <div className="p-4 bg-white border-t border-slate-100 flex justify-between sticky bottom-0 z-20">
            <button onClick={prev} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Retour</button>
            <button onClick={next} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">Suivant</button>
          </div>
        )}

      </div>
    </div>
  );
}