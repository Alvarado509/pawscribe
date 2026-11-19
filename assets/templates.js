/* PawScribe SOAP templates — window.PAWSCRIBE_TEMPLATES.
   Shape: {id, name, species, blurb, fields:[{key,label,placeholder}], sample:{fieldKey: value}}.
   `title` / `description` are aliases kept for older pages that read them.
   `sample` is an EXAMPLE note for the template preview only — it is never
   copied into a real note unless the vet chooses it. Real drafts are built
   only from what the vet types; nothing is ever invented. */
window.PAWSCRIBE_TEMPLATES = [
  {
    id: "dog-wellness",
    name: "Dog Wellness Exam",
    title: "Dog Wellness Exam",
    species: "Dog",
    blurb: "Annual or semi-annual wellness exam: history, full physical exam, vaccines, parasite prevention and owner counselling.",
    description: "Annual or semi-annual wellness exam: history, full physical exam, vaccines, parasite prevention and owner counselling.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Milo, 3-year-old male neutered Golden Retriever, 32 kg" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. none; owner reports normal appetite and energy" },
      { key: "findings", label: "Exam findings", placeholder: "e.g. temp 38.6 C, heart rate 92, weight 32 kg, teeth clean" },
      { key: "vaccines", label: "Vaccines given", placeholder: "e.g. Rabies, DHPP" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. recheck in 12 months; continue monthly prevention" }
    ],
    sample: {
      patient: "Milo, 3-year-old male neutered Golden Retriever, 32 kg",
      concerns: "No concerns. Eating and drinking normally, normal energy and stools.",
      findings: "Temp 38.6 C, heart rate 92 bpm, weight 32 kg. Bright and alert. Teeth: mild tartar on carnassial teeth.",
      vaccines: "Rabies and DHPP given today.",
      plan: "Continue monthly heartworm and flea prevention. Recheck in 12 months."
    }
  },
  {
    id: "cat-wellness",
    name: "Cat Wellness Exam",
    title: "Cat Wellness Exam",
    species: "Cat",
    blurb: "Annual wellness exam for cats: history, physical exam, vaccines, weight and dental check, indoor/outdoor lifestyle review.",
    description: "Annual wellness exam for cats: history, physical exam, vaccines, weight and dental check, indoor/outdoor lifestyle review.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Luna, 5-year-old female spayed domestic shorthair, 4.5 kg" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. owner reports occasional hairballs" },
      { key: "findings", label: "Exam findings", placeholder: "e.g. temp 38.9 C, heart rate 160, weight 4.5 kg" },
      { key: "vaccines", label: "Vaccines given", placeholder: "e.g. Rabies, FVRCP" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. recheck in 12 months" }
    ],
    sample: {
      patient: "Luna, 5-year-old female spayed domestic shorthair, 4.5 kg",
      concerns: "Occasional hairballs, about once a week. Indoor only.",
      findings: "Temp 38.9 C, heart rate 160 bpm, weight 4.5 kg. Alert, slightly nervous. Mild gingivitis.",
      vaccines: "Rabies and FVRCP given today.",
      plan: "Hairball diet and regular brushing discussed. Recheck in 12 months."
    }
  },
  {
    id: "vaccination",
    name: "Vaccination Visit",
    title: "Vaccination Visit",
    species: "Dog and cat",
    blurb: "Focused vaccine appointment: brief history, quick exam, vaccines given, adverse-reaction advice and certificate details.",
    description: "Focused vaccine appointment: brief history, quick exam, vaccines given, adverse-reaction advice and certificate details.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Rocky, 8-month-old male intact Labrador, 26 kg" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. none; no known vaccine reactions" },
      { key: "findings", label: "Exam findings", placeholder: "e.g. bright, alert, temp 38.5 C" },
      { key: "vaccines", label: "Vaccines given", placeholder: "e.g. DHPP booster, Rabies — lot and expiry" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. mild soreness for 24-48 h is normal; next vaccines in 12 months" }
    ],
    sample: {
      patient: "Rocky, 8-month-old male intact Labrador, 26 kg",
      concerns: "Doing well, eating and active. No illness since the last visit. No known vaccine reactions.",
      findings: "Bright, alert and responsive. Temp 38.5 C, heart rate 100 bpm.",
      vaccines: "DHPP booster and Rabies vaccine given today. Lot and expiry recorded in the chart.",
      plan: "Mild soreness or sleepiness for 24-48 hours is normal. Call the clinic if swelling, vomiting or facial swelling occurs. Next vaccines due in 12 months."
    }
  },
  {
    id: "dental",
    name: "Dental Exam",
    title: "Dental Exam",
    species: "Dog and cat",
    blurb: "Oral health assessment: dental charting, tartar and gingivitis grading, pain assessment and cleaning or extraction plan.",
    description: "Oral health assessment: dental charting, tartar and gingivitis grading, pain assessment and cleaning or extraction plan.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Bella, 7-year-old female spayed Beagle, 14 kg" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. bad breath for 2 months; still eating well" },
      { key: "findings", label: "Oral findings", placeholder: "e.g. tartar grade 2/4, gingivitis, no loose teeth" },
      { key: "pain", label: "Pain / eating", placeholder: "e.g. no pain on palpation; eating normally" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. dental cleaning under anaesthesia, pre-anaesthetic bloodwork" }
    ],
    sample: {
      patient: "Bella, 7-year-old female spayed Beagle, 14 kg",
      concerns: "Bad breath for about 2 months. Eating and drinking normally, still keen on chew toys.",
      findings: "Generalised tartar grade 2/4, gingivitis along the gumline, no loose teeth, no oral masses seen.",
      pain: "No pain on jaw palpation. Eating normally.",
      plan: "Pre-anaesthetic bloodwork scheduled. Dental cleaning under general anaesthesia recommended. Home dental care discussed."
    }
  },
  {
    id: "surgery",
    name: "Surgery Follow-up",
    title: "Surgery Follow-up",
    species: "Dog and cat",
    blurb: "Post-operative recheck: incision check, pain score, appetite and activity, suture removal and activity restrictions.",
    description: "Post-operative recheck: incision check, pain score, appetite and activity, suture removal and activity restrictions.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Max, 4-year-old male neutered mixed breed" },
      { key: "procedure", label: "Procedure", placeholder: "e.g. neuter, 10 days ago" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. eating well, incision looks clean, wearing the cone" },
      { key: "findings", label: "Incision", placeholder: "e.g. clean, dry, no discharge, no swelling" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. sutures removed; normal activity in 4 days" }
    ],
    sample: {
      patient: "Max, 4-year-old male neutered mixed breed",
      procedure: "Neuter, 10 days ago.",
      concerns: "Eating and drinking normally, comfortable at home. Incision looks clean. Wearing the cone as directed.",
      findings: "Incision clean, dry, well apposed, no discharge, no swelling, no redness. Pain score 0/4 on palpation.",
      plan: "Sutures removed. Cone may come off. Gradual return to normal activity over 4 days. Call if redness, discharge or swelling appears."
    }
  },
  {
    id: "emergency",
    name: "Emergency Visit",
    title: "Emergency Visit",
    species: "Dog and cat",
    blurb: "Urgent presentation: triage vitals, rapid history, stabilisation steps and monitoring plan for acute cases.",
    description: "Urgent presentation: triage vitals, rapid history, stabilisation steps and monitoring plan for acute cases.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Charlie, 6-year-old male neutered cat; vomiting since this morning" },
      { key: "vitals", label: "Triage vitals", placeholder: "e.g. temp 38.2 C, heart rate 180, pale gums" },
      { key: "concerns", label: "History", placeholder: "e.g. vomited 4 times, no food since, indoor only" },
      { key: "procedure", label: "Stabilisation done", placeholder: "e.g. IV catheter placed, fluids started" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. recheck vitals hourly; bloodwork pending" }
    ],
    sample: {
      patient: "Charlie, 6-year-old male neutered cat; vomiting since this morning",
      vitals: "Temp 38.2 C, heart rate 180 bpm, respiratory rate 28/min. Mucous membranes pale pink.",
      concerns: "Vomited 4 times since this morning, refused food. No known toxin exposure. Indoor only.",
      procedure: "IV catheter placed, IV fluids started. Anti-nausea medication given.",
      plan: "Bloodwork submitted. Nil by mouth for 4 hours, then small amounts of water. Recheck vitals hourly; owner updated by phone."
    }
  },
  {
    id: "senior",
    name: "Senior Wellness Check",
    title: "Senior Wellness Check",
    species: "Dog and cat",
    blurb: "Geriatric wellness visit: mobility, weight, organ screening, pain assessment and quality-of-life review for older patients.",
    description: "Geriatric wellness visit: mobility, weight, organ screening, pain assessment and quality-of-life review for older patients.",
    fields: [
      { key: "patient", label: "Patient", placeholder: "e.g. Daisy, 11-year-old female spayed Golden Retriever, 30 kg" },
      { key: "concerns", label: "Owner concerns", placeholder: "e.g. slower on stairs, drinking more water" },
      { key: "findings", label: "Exam findings", placeholder: "e.g. stiff hips, weight 30 kg" },
      { key: "screening", label: "Bloodwork / screening", placeholder: "e.g. senior panel submitted; urinalysis submitted" },
      { key: "plan", label: "Plan / next steps", placeholder: "e.g. joint supplement, recheck bloodwork in 1 week" }
    ],
    sample: {
      patient: "Daisy, 11-year-old female spayed Golden Retriever, 30 kg",
      concerns: "Slower on stairs, drinking more water than usual. Appetite normal. Sleeping more during the day.",
      findings: "Mild stiffness in both hips, reduced range of motion. Weight 30 kg. Body condition score 6/9.",
      screening: "Senior blood panel and urinalysis submitted.",
      plan: "Joint supplement started. Short, gentle walks and a ramp for stairs advised. Recheck in 1 week for bloodwork results and pain assessment."
    }
  }
];
