// recordFieldConfig.js
const recordFieldConfig = {
  Prescription: [
    { name: 'Medication Brand Name', type: 'autocomplete', options: ['Medication 1', 'Medication 2', 'Other'] },
    { name: 'Generic Name', type: 'autocomplete', options: ['Generic 1', 'Generic 2', 'Other'] },
    { name: 'Dosage', type: 'text' },
    { name: 'Frequency', type: 'autocomplete', options: ['Once Daily', 'Twice Daily', 'Every 8 hours', 'As needed', 'Other'] },
    { name: 'Route of Administration', type: 'autocomplete', options: ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Other'] },
    { name: 'Duration', type: 'text' },
    { name: 'Prescribing Doctor', type: 'text' }
  ],
  LabResult: [
    { name: 'Test Name', type: 'autocomplete', options: ['Blood Test', 'Urine Test', 'Cholesterol Test', 'Liver Function Test', 'Thyroid Function Test', 'Other'] },
    { name: 'Result Value', type: 'text' },
    { name: 'Normal Range', type: 'text' },
    { name: 'Test Date', type: 'date' },
    { name: 'Lab Technician', type: 'text' }
  ],
  XRay: [
    { name: 'Body Part Examined', type: 'text' },
    { name: 'Findings', type: 'text' },
    { name: 'Imaging Date', type: 'date' },
    { name: 'Radiologist', type: 'text' }
  ],
  MRI: [
    { name: 'Body Part Examined', type: 'text' },
    { name: 'Findings', type: 'text' },
    { name: 'Imaging Date', type: 'date' },
    { name: 'Radiologist', type: 'text' }
  ],
  CTScan: [
    { name: 'Body Part Examined', type: 'text' },
    { name: 'Findings', type: 'text' },
    { name: 'Imaging Date', type: 'date' },
    { name: 'Radiologist', type: 'text' }
  ],
  Ultrasound: [
    { name: 'Body Part Examined', type: 'text' },
    { name: 'Findings', type: 'text' },
    { name: 'Imaging Date', type: 'date' },
    { name: 'Radiologist', type: 'text' }
  ],
  VaccinationRecord: [
    { name: 'Vaccine Name', type: 'autocomplete', options: ['Influenza', 'HPV', 'Hepatitis', 'MMR', 'Tetanus', 'Other'] },
    { name: 'Date Given', type: 'date' },
    { name: 'Next Due Date', type: 'date' },
    { name: 'Administering Doctor/Nurse', type: 'text' }
  ],
  SurgicalReport: [
    { name: 'Surgery Type', type: 'autocomplete', options: ['Appendectomy', 'Gallbladder Removal', 'Heart Bypass', 'Hip Replacement', 'Other'] },
    { name: 'Surgery Date', type: 'date' },
    { name: 'Surgeon', type: 'text' },
    { name: 'Anaesthetist', type: 'text' },
    { name: 'Surgery Outcome', type: 'text' },
    { name: 'Recovery Notes', type: 'text' }
  ],
  PathologyReport: [
    { name: 'Test Type', type: 'autocomplete', options: ['Biopsy', 'Cytology', 'Hematology', 'Histology', 'Other'] },
    { name: 'Findings', type: 'text' },
    { name: 'Sample Date', type: 'date' },
    { name: 'Pathologist', type: 'text' }
  ],
  TreatmentPlan: [
    { name: 'Condition/Diagnosis', type: 'autocomplete', options: ['Diabetes', 'Hypertension', 'Cancer', 'Asthma', 'Other'] },
    { name: 'Treatment Methodology', type: 'text' },
    { name: 'Start Date', type: 'date' },
    { name: 'Estimated End Date', type: 'date' },
    { name: 'Treating Doctor', type: 'text' }
  ],
  ProgressNote: [
    { name: 'Visit Date', type: 'date' },
    { name: 'Symptom Description', type: 'text' },
    { name: 'Treatment Provided', type: 'text' },
    { name: 'Next Appointment Date', type: 'date' },
    { name: 'Attending Physician/Nurse', type: 'text' }
  ],
  AllergyInformation: [
    { name: 'Allergen', type: 'autocomplete', options: ['Pollen', 'Dust', 'Nuts', 'Shellfish', 'Latex', 'Other'] },
    { name: 'Reaction Type', type: 'autocomplete', options: ['Hives', 'Rash', 'Itching', 'Anaphylaxis', 'Other'] },
    { name: 'Reaction Severity', type: 'autocomplete', options: ['Mild', 'Moderate', 'Severe', 'Other'] },
    { name: 'Date Diagnosed', type: 'date' }
  ],
  DischargeSummary: [
    { name: 'Discharge Date', type: 'date' },
    { name: 'Reason for Admission', type: 'text' },
    { name: 'Treatment Given', type: 'text' },
    { name: 'Follow-up Instructions', type: 'text' },
    { name: 'Discharging Doctor', type: 'text' }
  ],
  DentalRecord: [
    { name: 'Procedure Type', type: 'autocomplete', options: ['Cleaning', 'Filling', 'Extraction', 'Root Canal', 'Crown', 'Braces', 'Other'] },
    { name: 'Procedure Date', type: 'date' },
    { name: 'Dentist', type: 'text' },
    { name: 'Next Appointment Date', type: 'date' }
  ],
  PsychiatricEvaluation: [
    { name: 'Evaluation Date', type: 'date' },
    { name: 'Diagnosis', type: 'autocomplete', options: ['Depression', 'Anxiety', 'Bipolar Disorder', 'Schizophrenia', 'Other'] },
    { name: 'Treatment Recommendations', type: 'text' },
    { name: 'Psychiatrist', type: 'text' }
  ],
  RehabilitationRecord: [
    { name: 'Therapy Type', type: 'autocomplete', options: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Other'] },
    { name: 'Progress Assessment', type: 'text' },
    { name: 'Next Session Date', type: 'date' },
    { name: 'Therapist', type: 'text' }
  ],
  BirthRecord: [
    { name: 'Birth Date', type: 'date' },
    { 
      name: 'Weight at Birth', 
      type: 'text', 
      unitOptions: ['kg', 'lbs'], 
      unitType: 'autocomplete' 
    },
    { 
      name: 'Length at Birth', 
      type: 'text', 
      unitOptions: ['cm', 'inches'], 
      unitType: 'autocomplete' 
    },
    { name: 'Birth Hospital', type: 'text' },
    { name: 'Attending Doctor/Midwife', type: 'text' }
  ],
  PrenatalRecord: [
    { name: 'Visit Date', type: 'date' },
    { name: 'Fetal Development Assessment', type: 'text' },
    { name: 'Expected Due Date', type: 'date' },
    { name: 'Obstetrician', type: 'text' }
  ],
  Other: [
    { name: 'Description', type: 'text' }
  ], 
  commonFields: [
    {
      name: 'Record Date',
      type: 'date'
    },
    {
      name: 'Hospital/Clinic',
      type: 'text'
    },
    {
      name: 'Notes',
      type: 'text'
    }
  ]
};

export default recordFieldConfig;

 
