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
// La clé est vide par sécurité. Collez votre clé entre les guillemets ci-dessous.
const apiKey = "AIzaSyCf2QHjWZKUdDxcOq6CzR5lD7JwzbBmBV8"; 

// --- CONFIGURATION MARQUE & CLINIQUE ---
const BRAND_CONFIG = {
  appName: "G7 Performance",
  formName: "Bilan Neuro-Fonctionnel & Dépistage",
  companyName: "Institut Santé Mentale & Performance",
  logoUrl: "G7-Sante-logo-ronde-2.png", 
  clinicEmail: "info@institut.com", 
  finalInstruction: "Veuillez transmettre ce bilan. Des tests rapides (Afinion 2, Urinaire) pourraient être recommandés selon vos réponses."
};

// --- STRUCTURE DES QUESTIONS ---
const FORM_STRUCTURE = [
  {
    id: 's1',
    title: "1. Le Frein Principal",
    icon: <AlertCircle size={24} className="text-red-500"/>,
    description: "Motif & Impact sur la performance",
    questions: [
      { 
        id: 'q1', 
        type: 'ai_textarea', 
        label: "Quel symptôme ou blocage limite le plus votre performance ou votre bien-être actuellement ?",
        aiPrompt: "Tu es un expert clinique. Reformule la plainte suivante en un terme médical ou fonctionnel précis. Sois concis." 
      },
      { id: 'q2', type: 'radio', label: "Depuis combien de temps ce frein est-il présent ?", options: ["Récent (< 3 mois)", "Persistant (3-12 mois)", "Chronique (> 1 an)"] },
      { id: 'q3', type: 'slider', label: "Impact sur votre capacité décisionnelle ou opérationnelle (0-10)", min: 0, max: 10, minLabel: "Aucun", maxLabel: "Paralysant" }
    ]
  },
  {
    id: 's2',
    title: "2. Métabolique & FINDRISC",
    icon: <Activity size={24} className="text-blue-500"/>,
    description: "Facteurs de risques (Diabète/Coeur)",
    questions: [
      { id: 'q4', type: 'slider', label: "Niveau d'énergie au réveil (Batterie)", min: 0, max: 10, minLabel: "À plat", maxLabel: "100%" },
      { 
        id: 'q_findrisc_1', 
        type: 'radio', 
        label: "Antécédents Glycémiques & Tension (FINDRISC) :", 
        options: ["Aucun historique", "On m'a déjà dit que j'avais du sucre élevé", "Je prends des médicaments pour la tension", "Les deux (Sucre + Tension)"] 
      },
      { 
        id: 'q_findrisc_2', 
        type: 'radio', 
        label: "Hérédité (Diabète de type 1 ou 2 dans la famille) :", 
        options: ["Non", "Oui (Grands-parents/Oncles/Tantes)", "Oui (Parents/Frères/Soeurs)"] 
      },
      { 
        id: 'q_urine', 
        type: 'checkbox', 
        label: "Signes Urinaires & Rénaux :", 
        options: ["Urines foncées/odorantes", "Douleurs au bas du dos (Reins)", "Besoin d'uriner la nuit (>2 fois)", "Brûlures / Inconfort", "Aucun"] 
      }
    ]
  },
  {
    id: 's3',
    title: "3. Douleur & Inflammation",
    icon: <Thermometer size={24} className="text-orange-500"/>,
    description: "Signes d'inflammation systémique",
    questions: [
      { 
        id: 'q5', 
        type: 'conditional_pqrst', 
        label: "Avez-vous des douleurs physiques récurrentes ?", 
        trigger: "Oui", 
        options: ["Non", "Oui"],
        pqrstLabel: "Détails de la douleur (Inflammation ?)" 
      },
      { id: 'q6', type: 'checkbox', label: "Autres signes inflammatoires :", options: ["Raideurs matinales", "Problèmes de peau", "Rétention d'eau", "Maux de tête fréquents", "Aucun"] }
    ]
  },
  {
    id: 's4',
    title: "4. Cerveau & Cognition",
    icon: <Brain size={24} className="text-purple-500"/>,
    description: "Charge mentale & Neuro-transmission",
    questions: [
      { id: 'q7', type: 'radio', label: "Ressentez-vous du 'Brouillard Mental' (Brain Fog) ?", options: ["Jamais", "Parfois (après repas/stress)", "Souvent (difficulté à focus)", "Constant"] },
      { id: 'q8', type: 'radio', label: "État d'esprit dominant (Neuro-chimie) :", options: ["Anxieux / Hypervigilant", "Déprimé / Éteint", "Irritable / Court", "Stable / Performant"] },
      { id: 'q9', type: 'slider', label: "Capacité à gérer la pression (Résilience)", min: 0, max: 10, minLabel: "Je craque", maxLabel: "Antifragile" }
    ]
  },
  {
    id: 's5',
    title: "5. Axe Intestin-Cerveau",
    icon: <Utensils size={24} className="text-green-500"/>,
    description: "Métabolisme & Microbiote",
    questions: [
      { id: 'q13', type: 'radio', label: "Lien Repas-Mental : Baisse d'énergie ou de focus après avoir mangé ?", options: ["Non, énergie stable", "Oui, coup de barre", "Oui, brouillard mental immédiat"] },
      { id: 'q14', type: 'checkbox', label: "Symptômes digestifs (Indice dysbiose) :", options: ["Ballonnements", "Gaz / Inconforts", "Constipation", "Transit irrégulier", "Reflux", "Aucun"] },
      { id: 'q15', type: 'radio', label: "Tour de taille & Poids (Perception) :", options: ["Poids stable / Santé", "Prise de poids abdominale récente", "Surpoids installé depuis longtemps"] }
    ]
  },
  {
    id: 's6',
    title: "6. Hygiène de Vie & Sommeil",
    icon: <Moon size={24} className="text-indigo-500"/>,
    description: "Récupération & Habitudes",
    questions: [
      { id: 'q10', type: 'number', label: "Heures de sommeil réel par nuit" },
      { id: 'q11', type: 'radio', label: "Qualité de la récupération :", options: ["Non reposé au réveil", "Réveils nocturnes", "Réparateur"] },
      { id: 'q12', type: 'radio', label: "Substances & Stimulants :", options: ["Caféine excessive (>3/jour)", "Alcool régulier", "Tabac / Cannabis", "Aucun excès notable"] }
    ]
  },
  {
    id: 's7',
    title: "7. Clinique & Sécurité",
    icon: <ShieldCheck size={24} className="text-teal-500"/>,
    description: "Équipe de soins & Pharmacologie",
    questions: [
      { id: 'q_allergies', type: 'text', label: "Avez-vous des ALLERGIES connues (Médicaments, aliments, latex) ?" },
      { id: 'q19', type: 'textarea', label: "Diagnostics médicaux connus :" },
      { id: 'q_meds', type: 'textarea', label: "LISTE DES MÉDICAMENTS (Rx) ACTUELS (Seulement si différence vs dossier) :" },
      { id: 'q_compliance', type: 'radio', label: "ADHÉRENCE : Prenez-vous toujours votre médication tel que prescrit ?", options: ["Oui, rigoureusement", "J'oublie parfois", "Non, je modifie les doses moi-même", "Non, j'ai arrêté certains médicaments", "Sans objet (Aucun Rx)"] },
      { id: 'q21', type: 'textarea', label: "Produits naturels, vitamines ou suppléments :" },
      { id: 'q20', type: 'checkbox', label: "Suivi par d'autres professionnels :", options: ["Médecin spécialiste", "Psy/TS", "Ostéo/Chiro/Physio", "Naturo/Acup.", "Aucun"] }
    ]
  },
  {
    id: 's8',
    title: "Projection",
    icon: <Star size={24} className="text-yellow-500"/>,
    description: "La Question Magique",
    questions: [
      { id: 'q19_why', type: 'radio', label: "Votre motivation actuelle (Dopamine) :", options: ["Je suis en mission", "Discipline/devoir", "Perte de sens"] },
      { id: 'q_final', type: 'textarea', label: "Si nous réglons ce problème, quel projet pourriez-vous enfin réaliser ?" }
    ]
  }
];

// --- LOGIQUE METIER ---
const analyzeRecommendations = (answers, bmi) => {
  const recs = ["Signes Vitaux (Standard)"];
  const has = (id, txt) => (answers[id] || "").toLowerCase().includes(txt.toLowerCase());
  const hasAny = (id) => answers[id] && answers[id].length > 0 && !answers[id].includes('Aucun');

  if (bmi && bmi > 25) recs.push(`⚖️ Gestion de poids (IMC: ${bmi})`);
  
  if ((answers['q_findrisc_1'] && !has('q_findrisc_1', 'Aucun')) || 
      (answers['q_findrisc_2'] && !has('q_findrisc_2', 'Non')) || 
      (bmi > 27)) recs.push("🩸 Dépistage Métabolique (Afinion 2)");

  if (hasAny('q_urine') || has('q_urine', 'foncées')) recs.push("💧 Analyse Urinaire (11 paramètres)");
  if (hasAny('q6') || answers['q5']?.choice === 'Oui') recs.push("🔥 Investigation Inflammatoire");

  return recs;
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

const PQRSTFields = ({ value, onChange }) => {
  const d = { p: value?.p || '', q: value?.q ?? 5, r: value?.r || '', s: value?.s || '', t: value?.t || '' };
  const up = (k, v) => onChange({ ...d, [k]: v });
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
      <div className="text-red-800 font-bold border-b border-red-200 pb-1 mb-2 flex gap-2"><Activity size={16}/> PQRST Douleur</div>
      <div><label className="text-xs font-bold text-red-700">P - Provoque</label><input className="w-full p-2 rounded border border-red-200" value={d.p} onChange={e=>up('p',e.target.value)} /></div>
      <div><label className="text-xs font-bold text-red-700">Q - Intensité ({d.q}/10)</label><input type="range" min="0" max="10" className="w-full" value={d.q} onChange={e=>up('q',e.target.value)} /></div>
      <div><label className="text-xs font-bold text-red-700">R - Région</label><input className="w-full p-2 rounded border border-red-200" value={d.r} onChange={e=>up('r',e.target.value)} /></div>
      <div><label className="text-xs font-bold text-red-700">S - Symptômes</label><input className="w-full p-2 rounded border border-red-200" value={d.s} onChange={e=>up('s',e.target.value)} /></div>
      <div><label className="text-xs font-bold text-red-700">T - Temps</label><input className="w-full p-2 rounded border border-red-200" value={d.t} onChange={e=>up('t',e.target.value)} /></div>
    </div>
  );
};

const InputField = ({ question, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const handleAI = async () => { setLoading(true); onChange(await callGemini(`${question.aiPrompt} "${value}"`)); setLoading(false); };

  if (question.type === 'text') return <input type="text" className="w-full p-4 border rounded-xl" placeholder="Réponse..." value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (question.type === 'textarea') return <textarea className="w-full p-4 border rounded-xl h-24" placeholder="Détails..." value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (question.type === 'ai_textarea') return <div className="relative"><textarea className="w-full p-4 border rounded-xl h-32 pr-12" placeholder="Décrivez..." value={value || ''} onChange={e => onChange(e.target.value)} /><button onClick={handleAI} disabled={loading||!value} className="absolute top-2 right-2 p-2 bg-purple-500 text-white rounded-lg">{loading?<RefreshCw className="animate-spin"/>:<Sparkles/>}</button></div>;
  if (question.type === 'number') return <input type="number" className="w-full p-4 border rounded-xl text-center text-2xl font-bold" placeholder="0" value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (question.type === 'slider') return <div className="w-full px-2 py-4"><div className="flex justify-between text-xs font-bold mb-2"><span>{question.minLabel}</span><span>{question.maxLabel}</span></div><input type="range" min={question.min} max={question.max} value={value || 0} onChange={e => onChange(e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer accent-teal-600" /><div className="text-center mt-2 font-bold text-xl">{value || 0}/10</div></div>;
  if (question.type === 'radio') return <div className="space-y-2">{question.options.map(opt => <button key={opt} onClick={() => onChange(opt)} className={`w-full text-left p-4 rounded-xl border flex justify-between ${value === opt ? 'bg-teal-50 border-teal-500 font-bold' : 'bg-white'}`}>{opt}{value === opt && <Check className="text-teal-600"/>}</button>)}</div>;
  if (question.type === 'checkbox') {
    const sel = Array.isArray(value) ? value : [];
    const toggle = (opt) => onChange(sel.includes(opt) ? sel.filter(s => s !== opt) : [...sel, opt]);
    return <div className="space-y-2">{question.options.map(opt => <button key={opt} onClick={() => toggle(opt)} className={`w-full text-left p-4 rounded-xl border flex justify-between ${sel.includes(opt) ? 'bg-blue-50 border-blue-500 font-bold' : 'bg-white'}`}>{opt}{sel.includes(opt) && <Check className="text-blue-600"/>}</button>)}</div>;
  }
  if (question.type === 'conditional_pqrst') return <div className="space-y-3"><div className="flex gap-3">{question.options.map(opt => <button key={opt} onClick={() => onChange({ ...value, choice: opt })} className={`flex-1 p-3 rounded-xl border font-bold ${value?.choice === opt ? 'bg-teal-600 text-white' : 'bg-white'}`}>{opt}</button>)}</div>{value?.choice === question.trigger && <PQRSTFields value={value?.pqrst} onChange={d => onChange({ ...value, pqrst: d })} />}</div>;
  return null;
};

export default function G7SanteApp() {
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
      <div className="w-full max-w-2xl flex justify-between mb-4">
        <div className="font-bold text-xl text-teal-600">{BRAND_CONFIG.appName}</div>
        {step > 0 && step <= FORM_STRUCTURE.length && <div className="text-sm font-bold text-slate-400">{step}/{FORM_STRUCTURE.length}</div>}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[60vh] flex flex-col">
        {step === 0 && (
          <div className="p-8 flex flex-col items-center justify-center flex-1 text-center animate-in fade-in">
            <h2 className="text-2xl font-bold mb-4">{BRAND_CONFIG.formName}</h2>
            <div className="w-full space-y-4 text-left">
              <input className="w-full p-3 border rounded" placeholder="Nom Complet" value={anamnese.name} onChange={e => setAnamnese({...anamnese, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-3 border rounded" type="date" value={anamnese.dob} onChange={e => setAnamnese({...anamnese, dob: e.target.value})} />
                <select className="p-3 border rounded" value={anamnese.sex} onChange={e => setAnamnese({...anamnese, sex: e.target.value})}><option value="">Sexe</option><option value="F">Femme</option><option value="H">Homme</option></select>
              </div>
              <input className="w-full p-3 border rounded" placeholder="# RAMQ" value={anamnese.nam} onChange={e => setAnamnese({...anamnese, nam: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-3 border rounded" type="number" placeholder="Poids (kg)" value={anamnese.weight} onChange={e => setAnamnese({...anamnese, weight: e.target.value})} />
                <input className="p-3 border rounded" type="number" placeholder="Taille (cm)" value={anamnese.height} onChange={e => setAnamnese({...anamnese, height: e.target.value})} />
              </div>
              <input className="w-full p-3 border rounded" placeholder="Courriel" value={anamnese.email} onChange={e => setAnamnese({...anamnese, email: e.target.value})} />
            </div>
            <button disabled={!anamnese.name || !anamnese.nam} onClick={() => setStep(1)} className="mt-6 w-full py-4 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50">Commencer</button>
          </div>
        )}

        {step > 0 && step <= FORM_STRUCTURE.length && (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b bg-slate-50">
              <h2 className="text-xl font-bold">{FORM_STRUCTURE[step-1].title}</h2>
              <p className="text-sm text-slate-500">{FORM_STRUCTURE[step-1].description}</p>
            </div>
            <ProgressBar current={step-1} total={FORM_STRUCTURE.length} />
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {FORM_STRUCTURE[step-1].questions.map(q => (
                <div key={q.id}>
                  <label className="block font-bold mb-2">{q.label}</label>
                  <InputField question={q} value={answers[q.id]} onChange={v => handleAnswer(q.id, v)} />
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-between">
              <button onClick={() => setStep(s => s-1)} className="px-6 py-3 font-bold text-slate-400">Retour</button>
              <button onClick={() => setStep(s => s+1)} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl">Suivant</button>
            </div>
          </div>
        )}

        {step > FORM_STRUCTURE.length && (
          <div className="p-8 flex flex-col items-center text-center animate-in fade-in">
            <Check size={48} className="text-green-500 mb-4"/>
            <h2 className="text-2xl font-bold mb-2">Bilan Terminé</h2>
            <p className="text-slate-500 mb-6">Veuillez transmettre vos résultats.</p>
            
            <div className="w-full space-y-3">
              <a href={`mailto:${BRAND_CONFIG.clinicEmail}?subject=G7 - ${anamnese.name}&body=${encodeURIComponent(genReport(true))}`} className="block w-full p-4 bg-teal-50 border border-teal-200 rounded-xl font-bold text-teal-800">Envoyer par Courriel</a>
              <button onClick={() => window.print()} className="block w-full p-4 bg-white border border-blue-200 rounded-xl font-bold text-blue-800">Sauvegarder en PDF</button>
            </div>

            <div className="mt-8 w-full border-t pt-4">
              <button onClick={() => setShowClinician(!showClinician)} className="text-xs font-bold text-slate-300 uppercase flex items-center justify-center gap-1"><Lock size={12}/> Zone Clinique</button>
              {showClinician && (
                <div className="mt-4 bg-slate-800 p-4 rounded-xl text-left shadow-2xl">
                  <div className="text-white font-bold mb-2 flex items-center gap-2"><Unlock size={14} className="text-green-400"/> Accès Pro</div>
                  <div className="bg-slate-900/50 p-2 rounded text-xs text-green-300 mb-2">
                    {analyzeRecommendations(answers, calcBMI()).map((r, i) => <div key={i}>• {r}</div>)}
                  </div>
                  {!aiAnalysis ? (
                    <button onClick={triggerAI} disabled={isAiLoading} className="w-full p-2 bg-indigo-600 text-white rounded text-sm mb-2">{isAiLoading ? "Analyse..." : "Générer Hypothèses IA"}</button>
                  ) : (
                    <div className="bg-slate-700 p-2 rounded text-xs text-indigo-200 whitespace-pre-wrap max-h-40 overflow-y-auto">{aiAnalysis}</div>
                  )}
                  <button onClick={() => {navigator.clipboard.writeText(genReport(true)); alert("Copié !")}} className="w-full p-2 bg-slate-600 text-white rounded text-sm">Copier Texte (Myle)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* SECTION IMPRESSION CACHÉE */}
      <div className="hidden print:block fixed inset-0 bg-white z-50 p-8 text-black">
        <h1 className="text-2xl font-bold mb-4">{BRAND_CONFIG.appName}</h1>
        <pre className="whitespace-pre-wrap font-sans text-sm">{genReport(false)}</pre>
      </div>
    </div>
  );
}