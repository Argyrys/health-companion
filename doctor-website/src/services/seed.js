import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const samplePatients = [
  {
    name: "Ramesh Kumar",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    bloodGroup: "B+",
    createdAt: "2026-08-22",
    consultations: [
      {
        id: "C001",
        chiefComplaint: "Headache for 3 days",
        symptoms: ["Headache", "Nausea", "Fatigue"],
        severity: 7,
        duration: "3 days",
        voiceRecording: null,
        medicalHistory: ["Diabetic since 2018", "Hypertension since 2020"],
        familyHistory: ["Father: Heart disease", "Mother: Diabetes"],
        medications: [
          { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
          { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" }
        ],
        allergies: [
          { name: "Penicillin", severity: "Severe" },
          { name: "Peanuts", severity: "Mild" }
        ],
        eyeScreening: {
          photoUrl: null,
          riskLevel: "Low",
          findings: ["Mild redness", "No cataract detected", "Normal pupil response"],
          recommendation: "Continue regular checkups. No immediate concern."
        },
        mentalHealth: {
          stressLevel: "Moderate",
          mood: 6,
          sleepHours: 6,
          questions: [
            { q: "How would you rate your mood today?", a: 6 },
            { q: "How well did you sleep last night?", a: 6 },
            { q: "How stressed do you feel?", a: 5 },
            { q: "Can you concentrate on daily tasks?", a: 7 },
            { q: "How is your appetite?", a: 6 }
          ]
        },
        diagnosis: "",
        prescription: "",
        createdAt: "2026-08-22"
      }
    ]
  },
  {
    name: "Priya Singh",
    age: 32,
    gender: "Female",
    phone: "+91 98765 43211",
    bloodGroup: "A+",
    createdAt: "2026-08-22",
    consultations: [
      {
        id: "C002",
        chiefComplaint: "Persistent cough and cold",
        symptoms: ["Cough", "Cold", "Sore throat"],
        severity: 5,
        duration: "1 week",
        voiceRecording: null,
        medicalHistory: ["Asthma (childhood)"],
        familyHistory: ["Mother: Asthma"],
        medications: [
          { name: "Cetirizine", dosage: "10mg", frequency: "Once daily" }
        ],
        allergies: [
          { name: "Dust", severity: "Moderate" }
        ],
        eyeScreening: {
          photoUrl: null,
          riskLevel: "Low",
          findings: ["Mild conjunctival irritation", "No signs of infection", "Normal tear film"],
          recommendation: "Mild irritation likely due to dust allergy. Use lubricating eye drops if needed."
        },
        mentalHealth: {
          stressLevel: "Low",
          mood: 7,
          sleepHours: 7,
          questions: [
            { q: "How would you rate your mood today?", a: 7 },
            { q: "How well did you sleep last night?", a: 7 },
            { q: "How stressed do you feel?", a: 3 },
            { q: "Can you concentrate on daily tasks?", a: 8 },
            { q: "How is your appetite?", a: 7 }
          ]
        },
        diagnosis: "",
        prescription: "",
        createdAt: "2026-08-22"
      }
    ]
  },
  {
    name: "Amit Patel",
    age: 58,
    gender: "Male",
    phone: "+91 98765 43212",
    bloodGroup: "O-",
    createdAt: "2026-08-21",
    consultations: [
      {
        id: "C003",
        chiefComplaint: "Blurred vision in right eye",
        symptoms: ["Blurred vision", "Eye strain", "Headache"],
        severity: 8,
        duration: "2 weeks",
        voiceRecording: null,
        medicalHistory: ["Type 2 Diabetes", "High cholesterol"],
        familyHistory: ["Father: Glaucoma", "Mother: Cataract"],
        medications: [
          { name: "Metformin", dosage: "1000mg", frequency: "Twice daily" },
          { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at night" }
        ],
        allergies: [
          { name: "Sulfa drugs", severity: "Severe" },
          { name: "Iodine", severity: "Moderate" }
        ],
        eyeScreening: {
          photoUrl: null,
          riskLevel: "High",
          findings: ["Possible diabetic retinopathy", "Mild clouding of lens", "Elevated intraocular pressure"],
          recommendation: "Urgent referral to ophthalmologist recommended. Follow up within 1 week."
        },
        mentalHealth: {
          stressLevel: "High",
          mood: 4,
          sleepHours: 5,
          questions: [
            { q: "How would you rate your mood today?", a: 4 },
            { q: "How well did you sleep last night?", a: 5 },
            { q: "How stressed do you feel?", a: 7 },
            { q: "Can you concentrate on daily tasks?", a: 5 },
            { q: "How is your appetite?", a: 5 }
          ]
        },
        diagnosis: "",
        prescription: "",
        createdAt: "2026-08-21"
      }
    ]
  },
  {
    name: "Sunita Devi",
    age: 40,
    gender: "Female",
    phone: "+91 98765 43213",
    bloodGroup: "AB+",
    createdAt: "2026-08-20",
    consultations: [
      {
        id: "C004",
        chiefComplaint: "Joint pain and stiffness",
        symptoms: ["Joint pain", "Stiffness", "Swelling"],
        severity: 6,
        duration: "1 month",
        voiceRecording: null,
        medicalHistory: ["Hypothyroidism"],
        familyHistory: ["Mother: Rheumatoid arthritis"],
        medications: [
          { name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily" }
        ],
        allergies: [],
        eyeScreening: {
          photoUrl: null,
          riskLevel: "Medium",
          findings: ["Mild lens opacity detected", "Slight redness in left eye", "Pupil response normal"],
          recommendation: "Early signs of lens changes. Recommend follow-up in 3 months. Monitor for progression."
        },
        mentalHealth: {
          stressLevel: "Moderate",
          mood: 5,
          sleepHours: 6,
          questions: [
            { q: "How would you rate your mood today?", a: 5 },
            { q: "How well did you sleep last night?", a: 6 },
            { q: "How stressed do you feel?", a: 5 },
            { q: "Can you concentrate on daily tasks?", a: 6 },
            { q: "How is your appetite?", a: 6 }
          ]
        },
        diagnosis: "",
        prescription: "",
        createdAt: "2026-08-20"
      }
    ]
  },
  {
    name: "Vikram Reddy",
    age: 28,
    gender: "Male",
    phone: "+91 98765 43214",
    bloodGroup: "B-",
    createdAt: "2026-08-20",
    consultations: [
      {
        id: "C005",
        chiefComplaint: "Stomach pain after eating",
        symptoms: ["Stomach pain", "Bloating", "Acidity"],
        severity: 5,
        duration: "2 weeks",
        voiceRecording: null,
        medicalHistory: [],
        familyHistory: ["Father: Gastric ulcer"],
        medications: [],
        allergies: [
          { name: "Lactose", severity: "Moderate" }
        ],
        eyeScreening: {
          photoUrl: null,
          riskLevel: "Low",
          findings: ["Clear cornea", "No cataract detected", "Healthy optic disc"],
          recommendation: "Normal eye examination. No concerns. Routine checkup in 1 year."
        },
        mentalHealth: {
          stressLevel: "Low",
          mood: 7,
          sleepHours: 7,
          questions: [
            { q: "How would you rate your mood today?", a: 7 },
            { q: "How well did you sleep last night?", a: 7 },
            { q: "How stressed do you feel?", a: 3 },
            { q: "Can you concentrate on daily tasks?", a: 8 },
            { q: "How is your appetite?", a: 6 }
          ]
        },
        diagnosis: "",
        prescription: "",
        createdAt: "2026-08-20"
      }
    ]
  }
];

export const seedDatabase = async (doctorId) => {
  const patientsRef = collection(db, 'patients');
  for (const patient of samplePatients) {
    await addDoc(patientsRef, {
      ...patient,
      doctorId,
      createdAt: new Date().toISOString().split('T')[0],
    });
  }
};
