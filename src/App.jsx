import React, { useState } from 'react';

// --- CONFIGURATION API GEMINI (Optionnel) ---
const apiKey = "AIzaSyCf2QHjWZKUdDxcOq6CzR5lD7JwzbBmBV8"; 

// --- CONFIGURATION MARQUE & CLINIQUE ---
const BRAND_CONFIG = {
  appName: "G7 Performance",
  formName: "Bilan Neuro-Fonctionnel",
  companyName: "Institut Santé Mentale & Performance",
  logoUrl: "G7-Sante-logo-ronde-2.png", 
  clinicEmail: "info@institut.com", 
  finalInstruction: "Transmettez ce bilan pour analyse préliminaire."
};

// --- STRUCTURE DES QUESTIONS ---
const FORM_STRUCTURE = [
  {
    id: 's1',
    title: "1. Le Frein Principal",
    icon: "🛑", // Emoji simple
    description: "Motif & Impact sur la performance",
    questions: [
      { 
        id: 'q1', 
        type: 'ai_textarea', 
        label: "Quel symptôme ou blocage limite le plus votre performance ou votre bien-être actuellement ?",
        aiPrompt: "Reformule cette plainte en terme médical concis." 
      },
      { id: 'q2', type: 'radio', label: "Depuis combien de temps ce frein est-il présent ?", options: ["Récent (< 3 mois)", "Persistant (3-12 mois)", "Chronique (> 1 an)"] },
      { id: 'q3', type: 'slider', label: "Impact sur votre capacité décisionnelle (0-10)", min: 0, max: 10, minLabel: "Aucun", maxLabel: "Paralysant" }
    ]
  },
  {
    id: 's2',
    title: "2. Métabolique & FINDRISC",
    icon: "🩺",
    description: "Facteurs de risques (Diabète/Coeur)",
    questions: [
      { id: 'q4', type: 'slider', label: "Niveau d'énergie au réveil (Batterie)", min: 0, max: 10, minLabel: "À plat", maxLabel: "100%" },
      { id: 'q_findrisc_1', type: 'radio', label: "Antécédents Glycémiques & Tension :", options: ["Aucun historique", "Sucre élevé déjà détecté", "Médicaments pour tension", "Les deux"] },
      { id: 'q_findrisc_2', type: 'radio', label: "Hérédité diabétique :", options: ["Non", "Oui (Grands-parents/Oncles)", "Oui (Parents/Frères/Sœurs)"] },
      { id: 'q_urine', type: 'checkbox', label: "Signes Urinaires & Rénaux :", options: ["Urines foncées/odorantes", "Douleurs lombaires", "Urines nocturnes (>2x)", "Brûlures", "Aucun"] }
    ]
  },
  {
    id: 's3',
    title: "3. Douleur & Inflammation",
    icon: "🔥",
    description: "Signes d'inflammation systémique",
    questions: [
      { id: 'q5', type: 'conditional_pqrst', label: "Avez-vous des douleurs physiques récurrentes ?", trigger: "Oui", options: ["Non", "Oui"] },
      { id: 'q6', type: 'checkbox', label: "Autres signes inflammatoires :", options: ["Raideurs matinales", "Problèmes de peau", "Rétention d'eau", "Maux de tête", "Aucun"] }
    ]
  },
  {
    id: 's4',
    title: "4. Cerveau & Cognition",
    icon: "🧠",
    description: "Charge mentale & Neuro-transmission",
    questions: [
      { id: 'q7', type: 'radio', label: "Ressentez-vous du 'Brouillard Mental' ?", options: ["Jamais", "Parfois", "Souvent", "Constant"] },
      { id: 'q8', type: 'radio', label: "État d'esprit dominant :", options: ["Anxieux / Hypervigilant", "Déprimé / Éteint", "Irritable / Court", "Stable / Performant"] },
      { id: 'q9', type: 'slider', label: "Capacité à gérer la pression", min: 0, max: 10, minLabel: "Je craque", maxLabel: "Antifragile" }
    ]
  },
  {
    id: 's5',
    title: "5. Axe Intestin-Cerveau",
    icon: "🥗",
    description: "Métabolisme & Microbiote",
    questions: [
      { id: 'q13', type: 'radio', label: "Lien Repas-Mental : Baisse d'énergie après manger ?", options: ["Non, énergie stable", "Oui, coup de barre", "Oui, brouillard mental"] },
      { id: 'q14', type: 'checkbox', label: "Symptômes digestifs :", options: ["Ballonnements", "Gaz", "Constipation", "Transit irrégulier", "Reflux", "Aucun"] },
      { id: 'q15', type: 'radio', label: "Tour de taille & Poids :", options: ["Poids stable", "Prise abdominale récente", "Surpoids installé"] }
    ]
  },
  {
    id: 's6',
    title: "6. Hygiène de Vie",
    icon: "🌙",
    description: "Récupération & Habitudes",
    questions: [
      { id: 'q10', type: 'number', label: "Heures de sommeil réel par nuit" },
      { id: 'q11', type: 'radio', label: "Qualité de la récupération :", options: ["Non reposé", "Réveils nocturnes", "Réparateur"] },
      { id: 'q12', type: 'radio', label: "Substances & Stimulants :", options: ["Caféine excessive", "Alcool régulier", "Tabac / Cannabis", "Aucun excès"] }
    ]
  },
  {
    id: 's7',
    title: "7. Clinique & Sécurité",
    icon: "🛡️",
    description: "Équipe & Pharma",
    questions: [
      { id: 'q_allergies', type: 'text', label: "Allergies connues (Rx, Aliments, Latex) ?" },
      { id: 'q19', type: 'textarea', label: "Diagnostics médicaux connus :" },
      { id: 'q_meds', type: 'textarea', label: "Liste des médicaments (Rx) actuels :" },
      { id: 'q_compliance', type: 'radio', label: "Adhérence médication :", options: ["Oui, rigoureuse", "Oublis parfois", "Modif. doses moi-même", "Arrêt volontaire", "Sans objet"] },
      { id: 'q21', type: 'textarea', label: "Produits naturels / Vitamines :" },
      { id: 'q20', type: 'checkbox', label: "Suivi par d'autres pros :", options: ["Médecin spé.", "Psy/TS", "Ostéo/Physio", "Naturo/Acup.", "Aucun"] }
    ]
  },
  {
    id: 's8',
    title: "Projection",
    icon: "⭐",
    description: "La Question Magique",
    questions: [
      { id: 'q19_why', type: 'radio', label: "Motivation actuelle (Dopamine) :", options: ["Mission / Sens", "Discipline / Devoir", "Perte de sens"] },
      { id: 'q_final', type: 'textarea', label: "Si nous réglons ce problème, quel projet réaliseriez-vous ?" }
    ]
  }
];

// --- LOGIQUE METIER (Moteur) ---
const analyzeRecommendations = (answers, bmi) => {
  const recs = ["Signes Vitaux (Standard)"];
  const has = (id, txt) => (answers[id] || "").toLowerCase().includes(txt.toLowerCase());
  const hasAny = (id) => answers[id] && Array.isArray(answers[id]) && answers[id].length > 0 && !answers[id].includes('Aucun');

  if (bmi && bmi > 25) recs.push(`⚖️ Gestion de poids (IMC: ${bmi})`);
  
  // Dépistage Métabolique
  if ((answers['q_findrisc_1'] && !has('q_findrisc_1', 'Aucun')) || 
      (answers['q_findrisc_2'] && !has('q_findrisc_2', 'Non')) || 
      (bmi > 27) ||
      (answers['q15'] && !has('q15', 'stable'))) {
    recs.push("🩸 Dépistage Métabolique (Afinion 2 : HbA1c + Lipides)");
  }

  // Risque Rénal
  const urineIssues = hasAny('q_urine');
  const hydration = hasOption(answers, 'q_urine', 'foncées');
  if (urineIssues || hydration) recs.push("💧 Analyse Urinaire (11 paramètres)");

  // Inflammation
  const inflamSigns = hasAny('q6');
  const pain = answers['q5']?.choice === 'Oui';
  if (inflamSigns || pain) recs.push("🔥 Bilan Inflammatoire");

  return recs;
};

const hasOption = (answers, id, text) => {
  const val = answers[id];
  return Array.isArray(val) ? val.some(v => v.toLowerCase().includes(text.toLowerCase())) : false;
};

const callGemini = async (prompt) => {
  if (!apiKey) return "IA non activée.";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur IA.";
  } catch (e) { return "Service indisponible."; }
};

// --- COMPOSANTS UI ---
const PQRSTFields = ({ value, onChange }) => {
  const d = { p: value?.p || '', q: value?.q ?? 5, r: value?.r || '', s: value?.s || '', t: value?.t || '' };
  const up = (k, v) => onChange({ ...d, [k]: v });
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl space-y-3 animate-in fade-in">
      <div className="text-red-800 font-bold border-b border-red-200 pb-1 mb-2">⚡ Analyse PQRST de la douleur</div>
      <div className="grid gap-2">
        <div><label className="text-xs font-bold text-red-700">P - Provoque</label><input className="w-full p-2 rounded border border-red-200" value={d.p} onChange={e=>up('p',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700">Q - Intensité ({d.q}/10)</label><input type="range" min="0" max="10" className="w-full accent-red-600" value={d.q} onChange={e=>up('q',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700">R - Région</label><input className="w-full p-2 rounded border border-red-200" value={d.r} onChange={e=>up('r',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700">S - Symptômes</label><input className="w-full p-2 rounded border border-red-200" value={d.s} onChange={e=>up('s',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700">T - Temps</label><input className="w-full p-2 rounded border border-red-200" value={d.t} onChange={e=>up('t',e.target.value)} /></div>
      </div>
    </div>
  );
};

const InputField = ({ question, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const handleAI = async () => { setLoading(true); onChange(await callGemini(`${question.aiPrompt} "${value}"`)); setLoading(false); };

  if (question.type === 'text' || question.type === 'number') return <input type={question.type} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder={question.type === 'number' ? "0" : "Réponse..."} value={value || ''} onChange={e => onChange(e.target.value)} />;
  
  if (question.type === 'textarea' || question.type === 'ai_textarea') return (
    <div className="relative">
      <textarea className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Détails..." value={value || ''} onChange={e => onChange(e.target.value)} />
      {question.type === 'ai_textarea' && (
        <button onClick={handleAI} disabled={loading||!value} className="absolute top-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors">
          {loading ? "..." : "✨ Reformuler IA"}
        </button>
      )}
    </div>
  );

  if (question.type === 'slider') return (
    <div className="w-full px-2 py-2">
      <div className="flex justify-between text-xs font-bold mb-1 text-slate-500"><span>{question.minLabel}</span><span>{question.maxLabel}</span></div>
      <input type="range" min={question.min} max={question.max} value={value || 0} onChange={e => onChange(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-teal-600" />
      <div className="text-center font-bold text-lg text-teal-700">{value || 0}/10</div>
    </div>
  );

  if (question.type === 'radio') return (
    <div className="space-y-2">
      {question.options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} className={`w-full text-left p-3 rounded-lg border transition-all ${value === opt ? 'bg-teal-50 border-teal-500 font-bold text-teal-900' : 'bg-white hover:bg-slate-50'}`}>
          {opt} {value === opt && "✅"}
        </button>
      ))}
    </div>
  );

  if (question.type === 'checkbox') {
    const sel = Array.isArray(value) ? value : [];
    const toggle = (opt) => onChange(sel.includes(opt) ? sel.filter(s => s !== opt) : [...sel, opt]);
    return (
      <div className="space-y-2">
        {question.options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} className={`w-full text-left p-3 rounded-lg border transition-all ${sel.includes(opt) ? 'bg-blue-50 border-blue-500 font-bold text-blue-900' : 'bg-white hover:bg-slate-50'}`}>
            {opt} {sel.includes(opt) && "☑️"}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'conditional_pqrst') return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {question.options.map(opt => (
          <button key={opt} onClick={() => onChange({ ...value, choice: opt })} className={`flex-1 p-2 rounded-lg border font-bold ${value?.choice === opt ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'}`}>{opt}</button>
        ))}
      </div>
      {value?.choice === question.trigger && <PQRSTFields value={value?.pqrst} onChange={d => onChange({ ...value, pqrst: d })} />}
    </div>
  );

  return null;
};

// --- APP ---
export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [anamnese, setAnamnese] = useState({ name: '', dob: '', nam: '', email: '', weight: '', height: '', sex: '', date: new Date().toLocaleDateString() });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showClinician, setShowClinician] = useState(false);

  const calcBMI = () => {
    const w = parseFloat(anamnese.weight), h = parseFloat(anamnese.height);
    return (w > 0 && h > 0) ? (w / ((h / 100) ** 2)).toFixed(1) : null;
  };

  const genReport = (withAI) => {
    const bmi = calcBMI();
    let txt = `INSTITUT: ${BRAND_CONFIG.companyName}\nPATIENT: ${anamnese.name} (${anamnese.sex})\nNAM: ${anamnese.nam}\nDATE: ${anamnese.date}\n`;
    if (bmi) txt += `IMC: ${bmi}\n`;
    txt += `----------------\n`;
    FORM_STRUCTURE.forEach(s => {
      txt += `\n[${s.title}]\n`;
      s.questions.forEach(q => {
        const v = answers[q.id];
        if (v?.pqrst) txt += `${q.label}: ${v.choice} (P:${v.pqrst.p}, Q:${v.pqrst.q}, R:${v.pqrst.r}, S:${v.pqrst.s}, T:${v.pqrst.t})\n`;
        else if (Array.isArray(v)) txt += `${q.label}: ${v.join(', ')}\n`;
        else if (v) txt += `${q.label}: ${v}\n`;
      });
    });
    const recs = analyzeRecommendations(answers, bmi);
    txt += `\nSUGGESTIONS:\n${recs.join('\n')}\n`;
    if (withAI && aiAnalysis) txt += `\nIA ANALYSE:\n${aiAnalysis}`;
    return txt;
  };

  const triggerAI = async () => {
    setIsAiLoading(true);
    setAiAnalysis(await callGemini(`Analyse ce bilan entrepreneur:\n${genReport(false)}`));
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <div className="font-bold text-xl text-teal-600">{BRAND_CONFIG.appName}</div>
        {step > 0 && step <= FORM_STRUCTURE.length && <div className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">{step}/{FORM_STRUCTURE.length}</div>}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[60vh] flex flex-col border border-slate-100">
        {step === 0 && (
          <div className="p-8 flex flex-col items-center justify-center flex-1 text-center animate-in fade-in">
            {BRAND_CONFIG.logoUrl && <img src={BRAND_CONFIG.logoUrl} alt="Logo" className="h-24 mb-6 object-contain" />}
            <h2 className="text-2xl font-bold mb-2">{BRAND_CONFIG.formName}</h2>
            <p className="text-slate-500 mb-6 text-sm">Ciblage des causes physiques et métaboliques.</p>
            
            <div className="w-full space-y-4 text-left">
              <input className="w-full p-3 border rounded-lg" placeholder="Nom Complet" value={anamnese.name} onChange={e => setAnamnese({...anamnese, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-3 border rounded-lg" type="date" value={anamnese.dob} onChange={e => setAnamnese({...anamnese, dob: e.target.value})} />
                <select className="p-3 border rounded-lg bg-white" value={anamnese.sex} onChange={e => setAnamnese({...anamnese, sex: e.target.value})}><option value="">Sexe</option><option value="F">Femme</option><option value="H">Homme</option></select>
              </div>
              <input className="w-full p-3 border rounded-lg" placeholder="# RAMQ" value={anamnese.nam} onChange={e => setAnamnese({...anamnese, nam: e.target.value})} />
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div><label className="text-xs text-blue-600 font-bold block mb-1">Poids (kg)</label><input className="w-full p-2 border rounded" type="number" value={anamnese.weight} onChange={e => setAnamnese({...anamnese, weight: e.target.value})} /></div>
                <div><label className="text-xs text-blue-600 font-bold block mb-1">Taille (cm)</label><input className="w-full p-2 border rounded" type="number" value={anamnese.height} onChange={e => setAnamnese({...anamnese, height: e.target.value})} /></div>
              </div>
              <input className="w-full p-3 border rounded-lg" placeholder="Courriel" value={anamnese.email} onChange={e => setAnamnese({...anamnese, email: e.target.value})} />
            </div>
            
            <button disabled={!anamnese.name || !anamnese.nam} onClick={() => setStep(1)} className="mt-6 w-full py-4 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-black transition-colors">Commencer</button>
          </div>
        )}

        {step > 0 && step <= FORM_STRUCTURE.length && (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
              <span className="text-2xl">{FORM_STRUCTURE[step-1].icon}</span>
              <div>
                <h2 className="text-lg font-bold leading-tight">{FORM_STRUCTURE[step-1].title}</h2>
                <p className="text-xs text-slate-500">{FORM_STRUCTURE[step-1].description}</p>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full bg-slate-100 h-1"><div className="bg-teal-500 h-1 transition-all" style={{ width: `${(step / FORM_STRUCTURE.length) * 100}%` }}></div></div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[65vh]">
              {FORM_STRUCTURE[step-1].questions.map(q => (
                <div key={q.id} className="animate-in fade-in slide-in-from-right-4">
                  <label className="block font-bold mb-3 text-slate-800">{q.label}</label>
                  <InputField question={q} value={answers[q.id]} onChange={v => handleAnswer(q.id, v)} />
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t flex justify-between bg-white mt-auto">
              <button onClick={() => setStep(s => s-1)} className="px-6 py-2 font-bold text-slate-400 hover:text-slate-600">Retour</button>
              <button onClick={() => setStep(s => s+1)} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all">Suivant</button>
            </div>
          </div>
        )}

        {step > FORM_STRUCTURE.length && (
          <div className="p-8 flex flex-col items-center text-center animate-in fade-in overflow-y-auto max-h-[80vh]">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">✅</div>
            <h2 className="text-2xl font-bold mb-2">Bilan Terminé</h2>
            <p className="text-slate-500 mb-6 max-w-sm">Merci {anamnese.name}. Vos données sont prêtes à être analysées.</p>
            
            <div className="w-full space-y-3 max-w-md">
              <a href={`mailto:${BRAND_CONFIG.clinicEmail}?subject=G7 - ${anamnese.name}&body=${encodeURIComponent(genReport(true))}`} className="flex items-center justify-center gap-2 w-full p-4 bg-teal-50 border border-teal-200 rounded-xl font-bold text-teal-800 hover:bg-teal-100">📧 Envoyer par Courriel</a>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 w-full p-4 bg-white border border-blue-200 rounded-xl font-bold text-blue-800 hover:bg-blue-50">🖨️ Sauvegarder en PDF</button>
            </div>

            <div className="mt-10 w-full border-t pt-6">
              <button onClick={() => setShowClinician(!showClinician)} className="text-xs font-bold text-slate-300 uppercase flex items-center justify-center gap-1 hover:text-slate-500">🔒 Zone Clinique</button>
              
              {showClinician && (
                <div className="mt-4 bg-slate-800 p-6 rounded-2xl text-left shadow-2xl border border-slate-700">
                  <div className="text-white font-bold mb-4 flex items-center gap-2 text-sm border-b border-slate-600 pb-2">🔓 Accès Professionnel</div>
                  
                  {/* Suggestions de tests */}
                  <div className="bg-slate-900/50 p-3 rounded-lg text-xs text-green-300 mb-4 border border-slate-700">
                    <p className="font-bold text-slate-400 mb-2">RECOMMANDATIONS DÉTECTÉES :</p>
                    {analyzeRecommendations(answers, calcBMI()).map((r, i) => <div key={i} className="mb-1">⚡ {r}</div>)}
                  </div>
                  
                  {/* IA */}
                  {!aiAnalysis ? (
                    <button onClick={triggerAI} disabled={isAiLoading} className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold mb-3 flex justify-center items-center gap-2">
                      {isAiLoading ? "Analyse en cours..." : "✨ Générer Hypothèses IA"}
                    </button>
                  ) : (
                    <div className="bg-slate-700 p-3 rounded-lg text-xs text-indigo-100 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto mb-3 border border-slate-600">{aiAnalysis}</div>
                  )}

                  <button onClick={() => {navigator.clipboard.writeText(genReport(true)); alert("Copié dans le presse-papier !");}} className="w-full p-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold flex justify-center items-center gap-2">📋 Copier Texte (Myle)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* SECTION IMPRESSION CACHÉE */}
      <div className="hidden print:block fixed inset-0 bg-white z-50 p-12 text-black">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold">{BRAND_CONFIG.appName}</h1>
          <div className="text-right">
            <p className="font-bold text-xl">{anamnese.name}</p>
            <p>{anamnese.date}</p>
          </div>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{genReport(false)}</pre>
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">Généré par G7 Performance - Document Confidentiel</div>
      </div>
    </div>
  );
}