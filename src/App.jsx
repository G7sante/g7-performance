import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Printer, Activity, ShieldCheck, Check, 
  Send, Lock, RefreshCw, CalendarPlus, ChevronDown, LogOut, Volume2,
  AlertTriangle, FileText, Stethoscope, Heart, Brain, Zap, 
  Utensils, Eye, Move, Thermometer, Droplets, Dna,
  Battery, Users, Moon, Lightbulb, UserCheck, Flame, Clipboard, Trash2, Mail,
  Star, Coffee, Home, Briefcase, Smile, Frown, Meh, AlertCircle, PlusCircle, User, Calendar, CreditCard, Smartphone, AtSign, Sparkles, Unlock, FlaskConical, Scale, Ruler, Pill
} from 'lucide-react';

// --- CONFIGURATION API GEMINI ---
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
    icon: "🛑",
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
  
  if ((answers['q_findrisc_1'] && !has('q_findrisc_1', 'Aucun')) || 
      (answers['q_findrisc_2'] && !has('q_findrisc_2', 'Non')) || 
      (bmi > 27) ||
      (answers['q15'] && !has('q15', 'stable'))) {
    recs.push("🩸 Dépistage Métabolique (Afinion 2 : HbA1c + Lipides)");
  }

  if (hasAny('q_urine') || hasOption(answers, 'q_urine', 'foncées')) recs.push("💧 Analyse Urinaire (11 paramètres)");

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
    <div className="mt-4 p-5 bg-red-50 border border-red-100 rounded-2xl space-y-4 animate-in fade-in shadow-sm">
      <div className="text-red-800 font-bold border-b border-red-200 pb-2 mb-2 flex items-center gap-2">
        ⚡ Analyse PQRST de la douleur
      </div>
      <div className="grid gap-3">
        <div><label className="text-xs font-bold text-red-700 uppercase mb-1 block">P - Provoque</label><input className="w-full p-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 outline-none" value={d.p} onChange={e=>up('p',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700 uppercase mb-1 block">Q - Intensité ({d.q}/10)</label><input type="range" min="0" max="10" className="w-full accent-red-600 cursor-pointer" value={d.q} onChange={e=>up('q',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700 uppercase mb-1 block">R - Région</label><input className="w-full p-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 outline-none" value={d.r} onChange={e=>up('r',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700 uppercase mb-1 block">S - Symptômes</label><input className="w-full p-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 outline-none" value={d.s} onChange={e=>up('s',e.target.value)} /></div>
        <div><label className="text-xs font-bold text-red-700 uppercase mb-1 block">T - Temps</label><input className="w-full p-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 outline-none" value={d.t} onChange={e=>up('t',e.target.value)} /></div>
      </div>
    </div>
  );
};

const InputField = ({ question, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const handleAI = async () => { setLoading(true); onChange(await callGemini(`${question.aiPrompt} "${value}"`)); setLoading(false); };

  const inputClasses = "w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all hover:border-teal-300 bg-white shadow-sm";

  if (question.type === 'text' || question.type === 'number') return <input type={question.type} className={`${inputClasses} ${question.type === 'number' ? 'text-center font-bold text-2xl text-teal-700' : ''}`} placeholder={question.type === 'number' ? "0" : "Votre réponse..."} value={value || ''} onChange={e => onChange(e.target.value)} />;
  
  if (question.type === 'textarea' || question.type === 'ai_textarea') return (
    <div className="relative">
      <textarea className={`${inputClasses} h-32 resize-none`} placeholder="Détaillez ici..." value={value || ''} onChange={e => onChange(e.target.value)} />
      {question.type === 'ai_textarea' && (
        <button onClick={handleAI} disabled={loading||!value} className="absolute top-3 right-3 text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:shadow-lg transition-all flex items-center gap-1 disabled:opacity-50">
          {loading ? "..." : "✨ Reformuler IA"}
        </button>
      )}
    </div>
  );

  if (question.type === 'slider') return (
    <div className="w-full px-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex justify-between text-xs font-bold mb-3 text-slate-500 uppercase tracking-wide"><span>{question.minLabel}</span><span>{question.maxLabel}</span></div>
      <input type="range" min={question.min} max={question.max} value={value || 0} onChange={e => onChange(e.target.value)} className="w-full h-3 bg-slate-200 rounded-lg cursor-pointer accent-teal-600" />
      <div className="text-center font-bold text-2xl text-teal-700 mt-2">{value || 0}/10</div>
    </div>
  );

  if (question.type === 'radio') return (
    <div className="space-y-3">
      {question.options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${value === opt ? 'bg-teal-600 border-teal-600 text-white shadow-md transform scale-[1.01]' : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'}`}>
          <span className="font-medium">{opt}</span>
          {value === opt && "✅"}
        </button>
      ))}
    </div>
  );

  if (question.type === 'checkbox') {
    const sel = Array.isArray(value) ? value : [];
    const toggle = (opt) => onChange(sel.includes(opt) ? sel.filter(s => s !== opt) : [...sel, opt]);
    return (
      <div className="space-y-3">
        {question.options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${sel.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'}`}>
            <span className="font-medium">{opt}</span>
            {sel.includes(opt) && "☑️"}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'conditional_pqrst') return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {question.options.map(opt => (
          <button key={opt} onClick={() => onChange({ ...value, choice: opt })} className={`flex-1 p-4 rounded-xl border font-bold transition-all ${value?.choice === opt ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>{opt}</button>
        ))}
      </div>
      {value?.choice === question.trigger && <PQRSTFields value={value?.pqrst} onChange={d => onChange({ ...value, pqrst: d })} />}
    </div>
  );

  return null;
};

// --- APP PRINCIPALE ---
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
    txt += `--------------------------------\n`;
    FORM_STRUCTURE.forEach(s => {
      txt += `\n[${s.title}]\n`;
      s.questions.forEach(q => {
        const v = answers[q.id];
        if (v?.pqrst) txt += `${q.label}: ${v.choice} \n  > P:${v.pqrst.p}, Q:${v.pqrst.q}/10, R:${v.pqrst.r}, S:${v.pqrst.s}, T:${v.pqrst.t}\n`;
        else if (Array.isArray(v)) txt += `${q.label}: ${v.join(', ')}\n`;
        else if (v) txt += `${q.label}: ${v}\n`;
      });
    });
    const recs = analyzeRecommendations(answers, bmi);
    txt += `\n--------------------------------\nRECOMMANDATIONS CLINIQUES:\n${recs.map(r => `[ ] ${r}`).join('\n')}\n`;
    if (withAI && aiAnalysis) txt += `\n--------------------------------\nANALYSE IA:\n${aiAnalysis}`;
    return txt;
  };

  const triggerAI = async () => {
    setIsAiLoading(true);
    setAiAnalysis(await callGemini(`Analyse ce bilan entrepreneur:\n${genReport(false)}`));
    setIsAiLoading(false);
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(genReport(true)); alert("Rapport copié !"); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-800 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* HEADER */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">G7</div>
          <div><h1 className="font-bold text-lg leading-none text-slate-900">{BRAND_CONFIG.appName}</h1><p className="text-xs text-slate-500 font-medium">Santé Mentale & Performance</p></div>
        </div>
        {step > 0 && step <= FORM_STRUCTURE.length && <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">Étape {step} / {FORM_STRUCTURE.length}</div>}
      </div>

      {/* CARTE PRINCIPALE - Centrée et Aérée */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col border border-slate-100 relative mx-auto my-auto">
        
        {step === 0 && (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center flex-1 text-center animate-in fade-in zoom-in duration-500">
            {BRAND_CONFIG.logoUrl ? (
               <img src={BRAND_CONFIG.logoUrl} alt="Logo" className="h-24 mb-6 object-contain drop-shadow-sm" />
            ) : (
               <div className="bg-gradient-to-tr from-teal-50 to-teal-100 p-6 rounded-full mb-6 text-teal-600 shadow-inner text-4xl">💼</div>
            )}
            <h2 className="text-3xl font-bold mb-3 text-slate-900">{BRAND_CONFIG.formName}</h2>
            <p className="text-slate-500 mb-8 max-w-md text-lg leading-relaxed">Investigation des causes physiques aux déséquilibres mentaux & émotionnels.</p>
            
            <div className="w-full max-w-lg space-y-5 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
              <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Nom Complet</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-lg" placeholder="Votre nom" value={anamnese.name} onChange={e => setAnamnese({...anamnese, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Date Naissance</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" type="date" value={anamnese.dob} onChange={e => setAnamnese({...anamnese, dob: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Sexe</label><select className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white" value={anamnese.sex} onChange={e => setAnamnese({...anamnese, sex: e.target.value})}><option value="">Sélectionner</option><option value="F">Femme</option><option value="H">Homme</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Poids (kg)</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-center font-bold" type="number" placeholder="0" value={anamnese.weight} onChange={e => setAnamnese({...anamnese, weight: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Taille (cm)</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-center font-bold" type="number" placeholder="0" value={anamnese.height} onChange={e => setAnamnese({...anamnese, height: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1"># RAMQ</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 uppercase" placeholder="ABCD 1234..." value={anamnese.nam} onChange={e => setAnamnese({...anamnese, nam: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Courriel</label><input className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" placeholder="@" value={anamnese.email} onChange={e => setAnamnese({...anamnese, email: e.target.value})} /></div>
              </div>
            </div>
            <button disabled={!anamnese.name || !anamnese.nam} onClick={() => setStep(1)} className="mt-8 w-full max-w-sm py-4 bg-slate-900 text-white font-bold text-lg rounded-2xl disabled:opacity-50 hover:bg-black hover:scale-[1.02] transition-all shadow-xl shadow-slate-200">Commencer</button>
          </div>
        )}

        {step > 0 && step <= FORM_STRUCTURE.length && (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shadow-sm text-2xl">{FORM_STRUCTURE[step-1].icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{FORM_STRUCTURE[step-1].title}</h2>
                  <p className="text-slate-500">{FORM_STRUCTURE[step-1].description}</p>
                </div>
              </div>
              <ProgressBar current={step-1} total={FORM_STRUCTURE.length} />
            </div>

            <div className="p-8 space-y-10 overflow-y-auto flex-1">
              {FORM_STRUCTURE[step-1].questions.map(q => (
                <div key={q.id} className="animate-in slide-in-from-bottom-4 fade-in duration-700">
                  <label className="block font-bold text-lg text-slate-800 mb-4">{q.label}</label>
                  <InputField question={q} value={answers[q.id]} onChange={v => handleAnswer(q.id, v)} />
                </div>
              ))}
              <div className="h-4"></div> {/* Spacer */}
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-between bg-white sticky bottom-0 z-10">
              <button onClick={() => setStep(s => s-1)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Retour</button>
              <button onClick={() => setStep(s => s+1)} className="px-10 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 hover:scale-105 transition-all">Suivant</button>
            </div>
          </div>
        )}

        {step > FORM_STRUCTURE.length && (
          <div className="p-8 md:p-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 h-full overflow-y-auto">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm">✅</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bilan Complété</h2>
            <p className="text-slate-500 mb-10 max-w-md text-lg">Vos données ont été consolidées avec succès. Veuillez transmettre le rapport pour analyse.</p>
            
            <div className="w-full max-w-md space-y-4 mb-12">
              <a href={`mailto:${BRAND_CONFIG.clinicEmail}?subject=G7 - ${anamnese.name}&body=${encodeURIComponent(genReport(true))}`} className="flex items-center justify-center gap-3 w-full p-5 bg-teal-50 border border-teal-200 rounded-2xl font-bold text-teal-800 hover:bg-teal-100 hover:scale-[1.02] transition-all cursor-pointer shadow-sm">📧 Envoyer par Courriel</a>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-3 w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">🖨️ Sauvegarder en PDF</button>
            </div>

            <div className="w-full border-t border-slate-100 pt-8">
              <button onClick={() => setShowClinician(!showClinician)} className="text-xs font-bold text-slate-300 uppercase flex items-center justify-center gap-2 hover:text-slate-500 transition-colors mx-auto">🔒 Zone Clinique Réservée</button>
              
              {showClinician && (
                <div className="mt-6 bg-slate-900 p-8 rounded-3xl text-left shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-4">
                  <div className="text-white font-bold mb-6 flex items-center gap-3 text-lg border-b border-slate-700 pb-4">🔓 Espace Professionnel</div>
                  
                  {/* Suggestions */}
                  <div className="bg-slate-800/50 p-4 rounded-xl text-sm text-green-300 mb-6 border border-slate-700/50">
                    <p className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-wider">Recommandations détectées :</p>
                    {analyzeRecommendations(answers, calcBMI()).map((r, i) => <div key={i} className="mb-2 flex items-start gap-2">⚡ {r}</div>)}
                  </div>
                  
                  {/* IA */}
                  {!aiAnalysis ? (
                    <button onClick={triggerAI} disabled={isAiLoading} className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold mb-4 flex justify-center items-center gap-3 transition-all shadow-lg shadow-indigo-900/50">
                      {isAiLoading ? "⏳" : "✨"} {isAiLoading ? "Analyse en cours..." : "Générer Hypothèses IA"}
                    </button>
                  ) : (
                    <div className="bg-slate-800 p-4 rounded-xl text-xs text-indigo-100 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto mb-4 border border-slate-700 leading-relaxed shadow-inner">{aiAnalysis}</div>
                  )}
                  <button onClick={copyToClipboard} className="w-full p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-3 transition-colors">📋 Copier Texte (Format Myle)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PRINT REPORT (Hidden) */}
      <div className="hidden print:block fixed inset-0 bg-white z-50 p-12 text-black">
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
             <h1 className="text-4xl font-bold mb-2">{BRAND_CONFIG.appName}</h1>
             <p className="text-gray-500">{BRAND_CONFIG.formName}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl">{anamnese.name}</p>
            <p className="text-gray-500">{anamnese.date}</p>
          </div>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{genReport(false)}</pre>
        <div className="mt-12 pt-4 border-t text-center text-xs text-gray-400">Généré par G7 Performance - Document Confidentiel</div>
      </div>
    </div>
  );
}