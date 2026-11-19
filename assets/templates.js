/* PawScribe SOAP templates — window.PAWSCRIBE_TEMPLATES.
   Sample notes are realistic examples. Anything not stated in the
   example is written as [not stated] — findings are never invented. */
window.PAWSCRIBE_TEMPLATES = [
  {
    id: "dog-wellness",
    title: "Dog Wellness Exam",
    species: "Dog",
    description: "Annual or semi-annual wellness exam: history, full physical exam, vaccines, parasite prevention and owner counselling.",
    fields: [
      { label: "Patient", placeholder: "e.g. Milo, 3-year-old male neutered Golden Retriever, 32 kg" },
      { label: "Owner concerns", placeholder: "e.g. none; owner reports normal appetite and energy" },
      { label: "Exam findings", placeholder: "e.g. temp 38.6 C, heart rate 92, weight 32 kg, teeth clean" },
      { label: "Vaccines given", placeholder: "e.g. Rabies, DHPP" },
      { label: "Plan / next steps", placeholder: "e.g. recheck in 12 months; continue monthly prevention" }
    ],
    soap: {
      S: "Owner reports Milo is eating and drinking normally, with normal energy and normal stools. No vomiting, coughing or lameness reported. Owner has no concerns today.",
      O: "Temp 38.6 C, heart rate 92 bpm, respiratory rate 20/min, weight 32 kg. Bright, alert and responsive. Mucous membranes pink, CRT < 2 sec. Heart: no murmur auscultated. Lungs clear. Abdomen soft, non-painful. Skin and coat normal. Teeth: mild tartar on carnassial teeth. Lymph nodes normal.",
      A: "Healthy adult dog, routine wellness exam. Mild dental tartar noted. Vaccines due today.",
      P: "Rabies and DHPP vaccines administered. Fecal test submitted. Continue monthly heartworm and flea prevention. Dental home care discussed; recheck in 12 months or sooner if concerns arise."
    }
  },
  {
    id: "cat-wellness",
    title: "Cat Wellness Exam",
    species: "Cat",
    description: "Annual wellness exam for cats: history, physical exam, vaccines, weight and dental check, indoor/outdoor lifestyle review.",
    fields: [
      { label: "Patient", placeholder: "e.g. Luna, 5-year-old female spayed domestic shorthair, 4.5 kg" },
      { label: "Owner concerns", placeholder: "e.g. owner reports occasional hairballs" },
      { label: "Exam findings", placeholder: "e.g. temp 38.9 C, heart rate 160, weight 4.5 kg" },
      { label: "Vaccines given", placeholder: "e.g. Rabies, FVRCP" },
      { label: "Plan / next steps", placeholder: "e.g. recheck in 12 months" }
    ],
    soap: {
      S: "Owner reports Luna is eating well and using the litter box normally. Occasional hairballs, about once a week. Indoor only. No vomiting or diarrhoea reported.",
      O: "Temp 38.9 C, heart rate 160 bpm, respiratory rate 24/min, weight 4.5 kg. Alert and responsive, slightly nervous. Mucous membranes pink. Heart: no murmur. Lungs clear. Abdomen soft. Oral exam: mild gingivitis. Body condition score 5/9.",
      A: "Healthy adult cat, routine wellness exam. Mild gingivitis. Hairballs as reported by owner.",
      P: "Rabies and FVRCP vaccines administered. Hairball diet and regular brushing discussed. Dental monitoring at each visit. Recheck in 12 months."
    }
  },
  {
    id: "vaccination-visit",
    title: "Vaccination Visit",
    species: "Dog and cat",
    description: "Focused vaccine appointment: brief history, quick exam, vaccines given, adverse-reaction advice and certificate details.",
    fields: [
      { label: "Patient", placeholder: "e.g. Rocky, 8-month-old male intact Labrador, 26 kg" },
      { label: "Vaccines due", placeholder: "e.g. DHPP booster, Rabies" },
      { label: "Brief exam", placeholder: "e.g. bright, alert, temp 38.5 C, no murmur" },
      { label: "Vaccines given", placeholder: "e.g. DHPP lot / expiry, Rabies lot / expiry, site" },
      { label: "Owner advice given", placeholder: "e.g. mild soreness for 24-48 h is normal; call if swelling or vomiting" }
    ],
    soap: {
      S: "Owner reports Rocky is doing well, eating and active. No illness since the last visit. No known vaccine reactions.",
      O: "Bright, alert and responsive. Temp 38.5 C, heart rate 100 bpm. Mucous membranes pink. Heart and lungs normal on auscultation. No injection-site reaction from previous vaccines.",
      A: "Healthy puppy presenting for scheduled vaccinations.",
      P: "DHPP booster and Rabies vaccine administered (lot and expiry recorded in the chart). Owner advised that mild soreness or sleepiness for 24-48 hours is normal, and to call the clinic if swelling, vomiting or facial swelling occurs. Next vaccines due in 12 months."
    }
  },
  {
    id: "dental-exam",
    title: "Dental Exam",
    species: "Dog and cat",
    description: "Oral health assessment: dental charting, tartar and gingivitis grading, pain assessment and cleaning or extraction plan.",
    fields: [
      { label: "Patient", placeholder: "e.g. Bella, 7-year-old female spayed Beagle, 14 kg" },
      { label: "Owner concerns", placeholder: "e.g. bad breath for 2 months; still eating well" },
      { label: "Oral findings", placeholder: "e.g. tartar grade 2/4, gingivitis, no loose teeth" },
      { label: "Pain / eating", placeholder: "e.g. no pain on palpation; eating normally" },
      { label: "Plan", placeholder: "e.g. dental cleaning under anaesthesia, pre-anaesthetic bloodwork" }
    ],
    soap: {
      S: "Owner reports bad breath for about 2 months. Bella is eating and drinking normally and is still keen on chew toys. No pawing at the mouth reported.",
      O: "Temp 38.4 C, weight 14 kg. Oral exam: generalised tartar grade 2/4, gingivitis along the gumline, no loose teeth, no oral masses seen. No pain on jaw palpation. Remaining exam unremarkable.",
      A: "Periodontal disease, moderate. Halitosis as reported by owner.",
      P: "Pre-anaesthetic bloodwork scheduled. Dental cleaning under general anaesthesia recommended, with possible extractions if diseased teeth are found once scaled. Home dental care discussed. Owner to call if eating drops off or bleeding is seen."
    }
  },
  {
    id: "surgery-followup",
    title: "Surgery Follow-up",
    species: "Dog and cat",
    description: "Post-operative recheck: incision check, pain score, appetite and activity, suture removal and activity restrictions.",
    fields: [
      { label: "Patient and surgery", placeholder: "e.g. Max, 4-year-old male neutered mixed breed; spay/neuter 10 days ago" },
      { label: "Owner report", placeholder: "e.g. eating well, incision looks clean, wearing the cone" },
      { label: "Incision", placeholder: "e.g. clean, dry, no discharge, no swelling" },
      { label: "Pain / activity", placeholder: "e.g. comfortable, walking normally" },
      { label: "Plan", placeholder: "e.g. sutures removed; normal activity in 4 days" }
    ],
    soap: {
      S: "Owner reports Max is eating and drinking normally and is comfortable at home. Incision looks clean. He has worn the cone as directed. No vomiting or lethargy reported.",
      O: "Bright and alert. Temp 38.7 C. Surgical incision clean, dry, well apposed, no discharge, no swelling, no redness. Pain score 0/4 on palpation. Ambulating normally.",
      A: "Healing well, 10 days post surgery. No signs of infection or dehiscence.",
      P: "Sutures removed. Cone may come off. Gradual return to normal activity over 4 days. Owner to call if redness, discharge or swelling appears at the incision site."
    }
  },
  {
    id: "emergency-visit",
    title: "Emergency Visit",
    species: "Dog and cat",
    description: "Urgent presentation: triage vitals, rapid history, stabilisation steps and monitoring plan for acute cases.",
    fields: [
      { label: "Patient and complaint", placeholder: "e.g. Charlie, 6-year-old male neutered cat; vomiting since this morning" },
      { label: "Triage vitals", placeholder: "e.g. temp 38.2 C, heart rate 180, pale gums, weak pulses" },
      { label: "History", placeholder: "e.g. vomited 4 times, no food since, indoor only" },
      { label: "Stabilisation done", placeholder: "e.g. IV catheter placed, fluids started" },
      { label: "Monitoring plan", placeholder: "e.g. recheck vitals hourly; bloodwork pending" }
    ],
    soap: {
      S: "Owner reports Charlie has vomited 4 times since this morning and has refused food. Last urination [not stated]. No known toxin exposure. Indoor only.",
      O: "Temp 38.2 C, heart rate 180 bpm, respiratory rate 28/min. Mucous membranes pale pink, CRT 2 sec. Mild abdominal discomfort on palpation. Hydration: tacky mucous membranes. Bloodwork pending.",
      A: "Acute vomiting, cause [not stated] pending bloodwork. Mild dehydration suspected.",
      P: "IV catheter placed, IV fluids started. Anti-nausea medication given. Bloodwork submitted. Nil by mouth for 4 hours, then small amounts of water. Recheck vitals hourly; owner updated by phone."
    }
  },
  {
    id: "senior-check",
    title: "Senior Check",
    species: "Dog and cat",
    description: "Geriatric wellness visit: mobility, weight, organ screening, pain assessment and quality-of-life review for older patients.",
    fields: [
      { label: "Patient", placeholder: "e.g. Daisy, 11-year-old female spayed Golden Retriever, 30 kg" },
      { label: "Owner concerns", placeholder: "e.g. slower on stairs, drinking more water" },
      { label: "Exam findings", placeholder: "e.g. stiff hips, weight 30 kg, heart murmur grade 2/6" },
      { label: "Bloodwork / screening", placeholder: "e.g. senior panel submitted; urinalysis submitted" },
      { label: "Plan", placeholder: "e.g. joint supplement, recheck bloodwork in 1 week" }
    ],
    soap: {
      S: "Owner reports Daisy is slower on stairs and is drinking more water than usual. Appetite normal. No vomiting or diarrhoea. Sleeping more during the day.",
      O: "Temp 38.5 C, heart rate 96 bpm, weight 30 kg. Mild stiffness in both hips, reduced range of motion. Heart murmur grade 2/6, loudest over the left side. Lungs clear. Mucous membranes pink. Body condition score 6/9.",
      A: "Senior dog with suspected osteoarthritis of the hips and increased thirst, cause [not stated] pending bloodwork. Heart murmur, grade 2/6.",
      P: "Senior blood panel and urinalysis submitted. Joint supplement started. Short, gentle walks and a ramp for stairs advised. Recheck in 1 week for bloodwork results and pain assessment."
    }
  }
];
