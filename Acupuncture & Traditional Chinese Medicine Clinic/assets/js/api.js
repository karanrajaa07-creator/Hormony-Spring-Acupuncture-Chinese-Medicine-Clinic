/**
 * Harmony Spring TCM Clinic - API Client Module
 * Provides unified communication with the backend REST endpoints.
 */

const API = {
  TOKEN_KEY: 'tcm_session_token',
  USER_KEY: 'tcm_session_user',

  getBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const { protocol, host, port } = window.location;
      // If served via HTTP/HTTPS directly on backend server port 3000
      if ((protocol === 'http:' || protocol === 'https:') && (port === '3000' || host.endsWith(':3000'))) {
        return '';
      }
    }
    // If opened via file:/// or other ports, target the running Node server on port 3000
    return 'http://localhost:3000';
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setSession(token, user) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  getCurrentUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const baseUrl = this.getBaseUrl();
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${url}:`, err);
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
        throw new Error('Unable to connect to Harmony Spring clinic server. Please ensure the backend is running on http://localhost:3000.');
      }
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    async register(userData) {
      const data = await API.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token && data.user) {
        API.setSession(data.token, data.user);
      }
      return data;
    },

    async login(email, password) {
      const data = await API.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token && data.user) {
        API.setSession(data.token, data.user);
      }
      return data;
    },

    async getMe() {
      const data = await API.request('/api/auth/me');
      if (data.user) {
        API.setSession(null, data.user);
      }
      return data;
    },

    async logout() {
      try {
        await API.request('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // silent catch
      } finally {
        API.clearSession();
      }
    },

    async forgotPassword(email) {
      return API.request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    async resetPassword(resetToken, newPassword) {
      return API.request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword })
      });
    }
  },

  // Authoritative clinical fallback services dataset
  FALLBACK_SERVICES: [
    {
      "id": "acupuncture",
      "name": "Initial Acupuncture Consultation",
      "category": "Acupuncture",
      "image": "assets/images/hero_acupuncture.jpg",
      "supportingImages": [
        {
          "src": "assets/images/pulse_diagnosis.jpg",
          "title": "Tongue & Pulse Diagnostic Evaluation"
        },
        {
          "src": "assets/images/treatment_room.jpg",
          "title": "Serene Clinical Treatment Room"
        }
      ],
      "shortDesc": "Comprehensive initial intake combining ancient pulse and tongue diagnosis with gentle, sterile hair-thin needle insertion to relieve pain, balance Qi, and design your personalized care plan.",
      "duration": "60 minutes",
      "price": "$130",
      "priceNum": 130,
      "benefits": [
        "Identifies root constitutional patterns and organ meridian imbalances",
        "Relieves acute and chronic musculoskeletal pain and neck tension",
        "Regulates autonomic nervous system and lowers cortisol stress",
        "Accelerates cellular healing, blood flow, and tissue recovery"
      ],
      "tags": [
        "acupuncture",
        "consultation",
        "pain",
        "stress",
        "intake"
      ],
      "process": [
        "Initial Tongue & Pulse diagnostic intake (15 mins)",
        "Gentle insertion of ultra-fine sterile single-use needles (10 mins)",
        "Deep meditative needle retention resting period with soft ambient music (30 mins)",
        "Needle removal and personalized post-treatment grounding advice (5 mins)"
      ],
      "preparation": "Wear loose, comfortable clothing allowing access to knees and elbows. Eat a light meal 1-2 hours prior. Avoid caffeine immediately beforehand.",
      "risks": "Minor sensations like mild warmth, heaviness, or tingling (De Qi) are normal therapeutic signs. We strictly use pre-sterilized, single-use disposable needles.",
      "aftercare": "Stay well-hydrated with room-temperature water. Avoid strenuous workouts, heavy alcohol, or freezing air conditioning for 12 hours after your session.",
      "faq": [
        {
          "q": "Does acupuncture hurt?",
          "a": "Most patients report feeling virtually no pain upon insertion—only a mild, pleasant warmth, heaviness, or tingling sensation known as 'De Qi'."
        },
        {
          "q": "How many sessions will I need?",
          "a": "Acute conditions frequently respond in 3-5 sessions, while chronic conditions typically benefit from a structured course of 6-10 visits."
        }
      ]
    },
    {
      "id": "follow-up",
      "name": "Follow-up Treatment Sessions",
      "category": "Acupuncture",
      "image": "assets/images/acupuncture_session.jpg",
      "supportingImages": [
        {
          "src": "assets/images/treatment_room.jpg",
          "title": "Private Treatment Suite"
        },
        {
          "src": "assets/images/meridian_pathways.jpg",
          "title": "Meridian Pathway Activation"
        }
      ],
      "shortDesc": "Targeted maintenance and progression sessions tailored to your evolving clinical response, adjusting needle points and herbal doses as your body reaches balance.",
      "duration": "45 minutes",
      "price": "$105",
      "priceNum": 105,
      "benefits": [
        "Reinforces therapeutic gains from previous treatments",
        "Adapts point prescription to week-by-week healing progress",
        "Prevents recurrence of chronic musculoskeletal complaints",
        "Sustains optimal autonomic nervous system harmony"
      ],
      "tags": [
        "acupuncture",
        "follow-up",
        "maintenance",
        "healing"
      ],
      "process": [
        "Focused check-in on symptom shifts since prior visit (10 mins)",
        "Pulse and tongue re-assessment (5 mins)",
        "Targeted acupuncture or complementary bodywork adjustment (25 mins)",
        "Herbal formula titration and updated instructions (5 mins)"
      ],
      "preparation": "Note any significant changes in sleep, pain levels, digestion, or emotional stress since your last appointment.",
      "risks": "Standard gentle acupuncture safety protocols apply. Sterile, single-use needles.",
      "aftercare": "Continue recommended hydration, gentle movements, and herbal regimens.",
      "faq": [
        {
          "q": "How often should I schedule follow-up sessions?",
          "a": "Most patients find optimal results with once-weekly sessions during active healing, transitioning to monthly maintenance once balance is established."
        },
        {
          "q": "Can my herbal prescription be refilled at a follow-up?",
          "a": "Yes, your practitioner evaluates your pulse and tongue to adjust or refill your herbal formula directly."
        }
      ]
    },
    {
      "id": "cupping",
      "name": "Bodywork & Cupping Therapy",
      "category": "Bodywork",
      "image": "assets/images/cupping_therapy.jpg",
      "supportingImages": [
        {
          "src": "assets/images/guasha_therapy.jpg",
          "title": "Jade & Bian Stone Gua Sha"
        },
        {
          "src": "assets/images/moxibustion.jpg",
          "title": "Warming Moxibustion Bodywork"
        }
      ],
      "shortDesc": "Traditional stationary and gliding glass fire-cupping creating therapeutic negative suction to release myofascial restrictions and mobilize stagnant blood.",
      "duration": "45 minutes",
      "price": "$85",
      "priceNum": 85,
      "benefits": [
        "Relieves deep postural tightness in shoulders, upper back, and neck",
        "Enhances localized lymphatic drainage and cellular waste clearance",
        "Decompresses rigid myofascial tissue and improves mobility",
        "Promotes profound physical relaxation and fascia unwinding"
      ],
      "tags": [
        "bodywork",
        "cupping",
        "fascia",
        "guasha",
        "back pain"
      ],
      "process": [
        "Targeted physical palpation and warming herbal massage oil application (10 mins)",
        "Precision placement of fire-warmed glass suction cups along Bladder meridian (20 mins)",
        "Gentle moving/gliding cupping technique along tight muscle fibers (10 mins)",
        "Cup release and soothing arnica or herbal liniment application (5 mins)"
      ],
      "preparation": "Avoid sunburn or abrasions on the back area. Hydrate well prior to arrival and dress in easily removable tops.",
      "risks": "Cupping typically produces painless circular discoloration ('Sha') ranging from light pink to deep purple depending on stagnation level. Marks are non-toxic, non-bruising, and naturally fade within 3 to 7 days.",
      "aftercare": "Keep the cupped areas covered and protected from wind, drafts, and cold water for 24 hours. Enjoy warm showers rather than swimming.",
      "faq": [
        {
          "q": "Are the circular marks painful?",
          "a": "No, despite their vibrant appearance, the marks are not bruises from trauma; they represent mobilized cellular waste and stagnant fluids drawn to the skin surface."
        },
        {
          "q": "Can cupping be combined with acupuncture?",
          "a": "Yes! Combining acupuncture and cupping provides a comprehensive treatment for stubborn muscle spasms and fatigue."
        }
      ]
    },
    {
      "id": "herbal-medicine",
      "name": "Traditional Chinese Herbal Medicine",
      "category": "Herbal Medicine",
      "image": "assets/images/chinese_herbal_medicine.jpg",
      "supportingImages": [
        {
          "src": "assets/images/herbal_apothecary.jpg",
          "title": "Traditional Apothecary Brass Scale"
        },
        {
          "src": "assets/images/herbal_prep.jpg",
          "title": "Botanical Infusion & Granule Prep"
        }
      ],
      "shortDesc": "Personalized formulation of classical Chinese botanical formulas and pharmaceutical-grade concentrated herbal granules tailored to your unique internal balance.",
      "duration": "40 minutes",
      "price": "$95",
      "priceNum": 95,
      "benefits": [
        "Nourishes internal organ deficiencies and chronic depletion",
        "Regulates menstrual cycles, hormonal shifts, and fertility",
        "Balances digestion, reduces bloating, and optimizes metabolic Qi",
        "Supports immune defense (Wei Qi) during seasonal changes"
      ],
      "tags": [
        "herbal medicine",
        "herbs",
        "botanicals",
        "granules",
        "digestive"
      ],
      "process": [
        "Differential pattern analysis and medication-herb interaction review (15 mins)",
        "Formula selection from classical canons (e.g. Shanghan Lun) with custom additions (15 mins)",
        "Instruction on reconstitution, timing, and storage of granules/decoctions (10 mins)"
      ],
      "preparation": "Bring an accurate list of all current prescription pharmaceuticals, over-the-counter medications, and supplements to prevent potential interactions.",
      "risks": "All herbs used are third-party tested for heavy metals, pesticides, and microbial purity. Please notify your practitioner of any known plant allergies.",
      "aftercare": "Dissolve prescribed granule doses in warm water. Take 30-45 minutes apart from prescription medications unless directed otherwise.",
      "faq": [
        {
          "q": "Do Chinese herbs taste bitter?",
          "a": "Traditional decoctions can have earthy, pungent, or bitter herbal flavors. We primarily dispense high-purity water-soluble granules which are smooth and easy to drink with warm water."
        },
        {
          "q": "Are your herbs safe and free from endangered species?",
          "a": "Absolutely. We exclusively source GMP-certified, 100% vegetarian botanical ingredients that undergo rigorous testing for heavy metals and pesticides. We never use endangered wildlife ingredients."
        }
      ]
    },
    {
      "id": "pain-management",
      "name": "Pain Management Acupuncture",
      "category": "Acupuncture",
      "image": "assets/images/pain_management_acupuncture.jpg",
      "supportingImages": [
        {
          "src": "assets/images/meridian_pathways.jpg",
          "title": "Targeted Meridian Neuropathy Map"
        },
        {
          "src": "assets/images/moxibustion.jpg",
          "title": "Thermal Moxa Joint Therapy"
        }
      ],
      "shortDesc": "Specialized electro-acupuncture and meridian point activation targeting chronic musculoskeletal pain, spinal strain, sciatic nerve compression, and repetitive strain injuries.",
      "duration": "60 minutes",
      "price": "$135",
      "priceNum": 135,
      "benefits": [
        "Substantially reduces chronic cervical, lumbar, and sciatica pain",
        "Releases deep myofascial trigger points and muscle guarding",
        "Lowers localized inflammation and promotes tissue microcirculation",
        "Stimulates endogenous endorphin release for natural pain relief"
      ],
      "tags": [
        "acupuncture",
        "pain",
        "sciatica",
        "back pain",
        "arthritis"
      ],
      "process": [
        "Comprehensive orthopedic and meridian palpation assessment (15 mins)",
        "Precision needle insertion at neuro-functional trigger points (10 mins)",
        "Micro-current electro-stimulation or warm infrared therapy (30 mins)",
        "Gentle muscle stretch and therapeutic herbal liniment application (5 mins)"
      ],
      "preparation": "Wear loose clothing that can easily expose painful joints or muscle areas. Avoid strenuous exercise directly before your session.",
      "risks": "Gentle, non-invasive treatment. Mild transient soreness may occur for a few hours post-treatment as muscles release chronic holding patterns.",
      "aftercare": "Apply warm compresses if recommended. Keep muscles warm and hydrated with plenty of water.",
      "faq": [
        {
          "q": "How does acupuncture relieve severe pain?",
          "a": "Acupuncture stimulates sensory nerves beneath the skin and muscles, prompting the brain and spinal cord to release natural pain-relieving endorphins and downregulate pain signals."
        },
        {
          "q": "Can it help with chronic arthritis?",
          "a": "Yes, clinical research confirms acupuncture significantly reduces joint inflammation and stiffness in osteoarthritis and rheumatoid conditions."
        }
      ]
    },
    {
      "id": "stress-wellness",
      "name": "Stress Relief and Wellness",
      "category": "Bodywork",
      "image": "assets/images/stress_relief_wellness.jpg",
      "supportingImages": [
        {
          "src": "assets/images/sleep_shen_harmony.jpg",
          "title": "Shen Harmony Meditation Space"
        },
        {
          "src": "assets/images/wellness_lifestyle.jpg",
          "title": "Five Element Food Energetics"
        }
      ],
      "shortDesc": "A deeply restorative therapy integrating Shen-calming acupoints (Yin Tang & Ear Shen Men), gentle thermal moxibustion, and tension-melting bodywork to reset an overburdened nervous system.",
      "duration": "60 minutes",
      "price": "$115",
      "priceNum": 115,
      "benefits": [
        "Downregulates sympathetic nervous system (fight-or-flight overdrive)",
        "Promotes deep restorative REM sleep and eases chronic insomnia",
        "Relieves stress-induced digestive tension, palpitations, and headaches",
        "Restores emotional equilibrium, mental clarity, and centered vitality"
      ],
      "tags": [
        "stress",
        "wellness",
        "relaxation",
        "insomnia",
        "anxiety",
        "bodywork",
        "acupuncture"
      ],
      "process": [
        "Pulse & emotional landscape consultation in quiet treatment suite (15 mins)",
        "Application of gentle ear seeds and ultra-fine calming Shen acupoints (10 mins)",
        "Meditative rest with soft ambient music and warm herbal compress (30 mins)",
        "Gentle acupressure grounding and personalized breathwork coaching (5 mins)"
      ],
      "preparation": "Silence mobile devices and wear relaxed clothing. Give yourself 15 minutes of quiet time after treatment before driving or returning to work.",
      "risks": "Extremely gentle and relaxing. Most patients enter an alpha-brainwave meditative nap during the session.",
      "aftercare": "Drink warm calming tea (such as chamomile, chrysanthemum, or jujube). Enjoy a quiet evening with early bedtime.",
      "faq": [
        {
          "q": "Will this help with chronic insomnia?",
          "a": "Yes! By regulating heart-kidney axis energetics and calming the Shen (spirit), acupuncture consistently helps patients fall asleep faster and stay asleep longer."
        },
        {
          "q": "Are the ear seeds painful?",
          "a": "Not at all. Tiny Vaccaria seeds are placed on external ear points with hypoallergenic adhesive tape, providing gentle pressure you can activate at home."
        }
      ]
    },
    {
      "id": "tcm-consultation",
      "name": "Personalized Health Consultations",
      "category": "Consultation",
      "image": "assets/images/tcm_consultation.jpg",
      "supportingImages": [
        {
          "src": "assets/images/meridian_pathways.jpg",
          "title": "Meridian Pathway Diagnostics"
        },
        {
          "src": "assets/images/pulse_diagnosis.jpg",
          "title": "Radial Pulse Diagnostics"
        }
      ],
      "additionalImages": [
        {
          "src": "assets/images/pulse_diagnosis.jpg",
          "title": "Traditional Chinese Medicine Diagnosis",
          "caption": "TCM Pulse Diagnosis",
          "alt": "Traditional Chinese Medicine Diagnosis: A practitioner examining a patient's pulse and discussing traditional Chinese medicine diagnosis in a warm, professional consultation room."
        },
        {
          "src": "assets/images/wellness_consultation.jpg",
          "title": "Holistic Wellness Consultation",
          "caption": "Holistic Wellness Consultation",
          "alt": "Holistic Wellness Consultation: A practitioner explaining a personalized treatment plan to a patient, with traditional herbal ingredients and a calm clinic environment."
        }
      ],
      "shortDesc": "Comprehensive holistic diagnostic evaluation using ancient Four Examinations: Inspection, Auscultation, Inquiry, and Palpation (Pulse & Tongue diagnosis) to craft your lifelong wellness blueprint.",
      "duration": "60 minutes",
      "price": "$150",
      "priceNum": 150,
      "benefits": [
        "Identifies root constitutional imbalances (Yin/Yang, Excess/Deficiency)",
        "Clarifies organ-meridian patterns (Zang-Fu diagnosis)",
        "Provides individualized holistic treatment roadmap",
        "Integrates lifestyle, seasonal nutrition, and emotional wellness"
      ],
      "tags": [
        "consultation",
        "diagnosis",
        "pulse",
        "tongue",
        "lifestyle"
      ],
      "process": [
        "In-depth discussion of current symptoms, medical history, and lifestyle (25 mins)",
        "Detailed examination of tongue body shape, coat color, and moisture (10 mins)",
        "Multi-depth radial pulse diagnosis across both wrists (15 mins)",
        "Co-creation of your customized TCM wellness roadmap and care timeline (10 mins)"
      ],
      "preparation": "Please do not brush your tongue coating or consume staining foods/drinks (coffee, berries, tea, hard candies) for at least 2 hours before your appointment.",
      "risks": "Non-invasive diagnostic consultation. Open discussion of health and lifestyle goals.",
      "aftercare": "Review your written lifestyle, food therapy, and diagnostic notes provided inside your Patient Dashboard.",
      "faq": [
        {
          "q": "What does my tongue tell the practitioner?",
          "a": "In TCM, the tongue serves as an internal biological map. The coating reflects digestion and fluids, while the body color and shape reflect Qi, Blood, and organ vitality."
        },
        {
          "q": "Is pulse diagnosis different from regular heart rate checks?",
          "a": "Yes. TCM pulse diagnosis evaluates 28 distinct pulse qualities across 3 positions and 3 depths on both wrists, evaluating specific organ meridian systems."
        }
      ]
    }
  ],

  // Services Endpoints
  services: {
    async getAll() {
      try {
        const data = await API.request('/api/services');
        if (data && data.services && Array.isArray(data.services) && data.services.length > 0) {
          return data;
        }
        throw new Error('Services response returned empty or invalid structure');
      } catch (err) {
        console.warn('API services endpoint unreachable or returned error, attempting fallback:', err.message);

        // 1. Try local data/db.json (relative path in static web servers)
        try {
          const localRes = await fetch('data/db.json');
          if (localRes.ok) {
            const dbData = await localRes.json();
            if (dbData && Array.isArray(dbData.services) && dbData.services.length > 0) {
              return { success: true, services: dbData.services, source: 'local_db' };
            }
          }
        } catch (localErr) {
          // Continue to embedded fallback
        }

        // 2. Authoritative local fallback dataset
        if (API.FALLBACK_SERVICES && API.FALLBACK_SERVICES.length > 0) {
          return { success: true, services: API.FALLBACK_SERVICES, source: 'embedded_fallback' };
        }

        // 3. Rethrow only if both API and fallback fail
        throw err;
      }
    },

    async getById(id) {
      try {
        const data = await API.request(`/api/services/${id}`);
        if (data && data.service) {
          return data;
        }
        throw new Error('Service response returned invalid structure');
      } catch (err) {
        console.warn(`API service detail ${id} unreachable, resolving from fallback dataset:`, err.message);
        const listData = await this.getAll();
        // Support aliases for backward compatibility with existing links
        const aliasMap = {
          'moxibustion': 'pain-management',
          'pain-management': 'pain-management',
          'wellness-consultation': 'stress-wellness',
          'stress-wellness': 'stress-wellness',
          'initial-acupuncture': 'acupuncture',
          'acupuncture': 'acupuncture',
          'personalized-consultation': 'tcm-consultation',
          'tcm-consultation': 'tcm-consultation'
        };
        const targetId = aliasMap[id] || id;
        const found = listData.services.find(s => s.id === targetId || s.id === id);
        if (found) {
          return { success: true, service: found, source: listData.source || 'fallback' };
        }
        throw err;
      }
    }
  },

  // Practitioners Endpoints
  practitioners: {
    async getAll() {
      return API.request('/api/practitioners');
    },
    async getById(id) {
      return API.request(`/api/practitioners/${id}`);
    }
  },

  // Appointments Endpoints
  appointments: {
    async getAvailableSlots(practitionerId, date) {
      return API.request(`/api/appointments/available-slots?practitionerId=${encodeURIComponent(practitionerId)}&date=${encodeURIComponent(date)}`);
    },
    async book(bookingData) {
      return API.request('/api/appointments/book', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
    },
    async getMy() {
      return API.request('/api/appointments/my');
    },
    async cancel(id) {
      return API.request(`/api/appointments/${id}/cancel`, {
        method: 'POST'
      });
    },
    async reschedule(id, date, time) {
      return API.request(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ date, time })
      });
    }
  },

  // Clinical Records Endpoints
  clinical: {
    async getTreatmentPlans() {
      return API.request('/api/treatment-plans/my');
    },
    async getPrescriptions() {
      return API.request('/api/prescriptions/my');
    },
    async getNotifications() {
      return API.request('/api/notifications/my');
    },
    async updateProfile(profileData) {
      return API.request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  },

  // Public General Endpoints
  general: {
    async contact(formData) {
      return API.request('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    },
    async subscribeNewsletter(email) {
      return API.request('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    async getBlogPosts() {
      return API.request('/api/blog');
    },
    async getBlogPostById(id) {
      return API.request(`/api/blog/${id}`);
    },
    async getFaqs() {
      return API.request('/api/faqs');
    }
  }
};
