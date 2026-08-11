/* =========================================================
   ZYPHOR'26 — statements-data.js
   Official Hackathon Problem Statements
   20 AI + 20 IoT
   ========================================================= */
export const HACKATHON_NOTE =
    "Problem statements for AI and IoT domains are released one day before the hackathon on 27-08-2026 at 9:00 AM.";
export const DOMAIN_STATEMENTS = {

    /* =====================================================
       AI PROBLEM STATEMENTS — 20
       ===================================================== */

    AI: [
    
            {
                "id": "AI01",
                "title": "The Contradicting Witnesses",
                "description": "In a factory accident, five IoT sensors and two human incident reports provide partially conflicting accounts of what failed first. The evidence varies in reliability, and some observations may be incomplete or misleading, making it difficult to determine the actual sequence of events and root cause.",
                "category": "Multimodal AI & Explainable Reasoning",
                "level": "Advanced"
            },
            {
                "id": "AI02",
                "title": "The Ghost Transaction",
                "description": "A bank flags a transaction as fraudulent even though it closely matches the customer's normal spending behavior. The only noticeable difference is a subtle timing anomaly that is easily overlooked by conventional fraud detection methods.",
                "category": "FinTech & Anomaly Detection",
                "level": "Advanced"
            },
            {
                "id": "AI03",
                "title": "The Conflicting Medical Readings",
                "description": "A patient's wearable vitals indicate stress, self-reported symptoms suggest calmness, and prescription history indicates a possible drug interaction. These sources provide conflicting signals with different levels of reliability, making the patient's actual risk difficult to assess.",
                "category": "Healthcare AI & Multimodal Reasoning",
                "level": "Advanced"
            },
            {
                "id": "AI04",
                "title": "The Misleading Traffic Camera",
                "description": "A traffic camera reports unusually low congestion in an area where citizen reports and ride-hailing data indicate severe gridlock. The available sources are independent but imperfect, creating uncertainty about which information accurately represents the real traffic situation.",
                "category": "Computer Vision & Sensor Fusion",
                "level": "Advanced"
            },
            {
                "id": "AI05",
                "title": "The Misinformation Spiral",
                "description": "A local news story about a factory chemical leak evolves into three contradictory narratives across social media within hours. As the story spreads, claims are altered, combined, removed, and amplified by different sources, making it difficult to determine which version remains closest to the truth.",
                "category": "NLP & Misinformation Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI06",
                "title": "The Invisible Detector",
                "description": "People and vehicles become increasingly difficult to identify when cameras operate in dense fog or dust. As visibility deteriorates, visual features become unclear, objects become partially obscured, and conventional detection systems become increasingly unreliable.",
                "category": "Computer Vision & Robust AI",
                "level": "Advanced"
            },
            {
                "id": "AI07",
                "title": "The Firebreak Dilemma",
                "description": "A wildfire threatens two towns from different directions while wind conditions are expected to shift within hours. Ground crews can clear only one firebreak at a time, aircraft water drops require clear flight paths, and decisions made at one location can affect the safety and response options at the other.",
                "category": "AI Agents & Decision Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI08",
                "title": "The Route That Keeps Failing",
                "description": "A delivery agent's supposedly optimal route repeatedly fails because of blocked roads, wrong turns, and unexpected delays. Each failure provides new information about the environment, but blindly following the original route continues to produce similar failures.",
                "category": "Adaptive AI & Intelligent Planning",
                "level": "Advanced"
            },
            {
                "id": "AI09",
                "title": "The Rejection Nobody Can Explain",
                "description": "A welfare scheme has an unusually high rejection rate in certain villages, but no single factor clearly explains the disparity. Applicant age, literacy, document type, officer, season, and village are all associated with rejection in different ways, making it difficult to distinguish genuine causes from misleading correlations.",
                "category": "Causal AI & Responsible Machine Learning",
                "level": "Advanced"
            },
            {
                "id": "AI10",
                "title": "The Defect No One Has a Name For",
                "description": "A garment inspector discovers a previously unseen fabric defect that does not belong to any known category and has only 3–5 examples. The limited samples make it difficult to determine whether the new pattern represents a genuine defect or a variation of an existing defect type.",
                "category": "Few-Shot Learning & Computer Vision",
                "level": "Advanced"
            },
            {
                "id": "AI11",
                "title": "The Missing Person Investigation Agent",
                "description": "A person goes missing and investigators receive fragmented information from CCTV footage, witness statements, social media activity, location history, and other available records. The information is incomplete, noisy, and spread across different sources, making it difficult to identify meaningful connections and determine the person's most probable movements.",
                "category": "AI Agents & Intelligent Investigation",
                "level": "Advanced"
            },
            {
                "id": "AI12",
                "title": "The Overwhelmed SOC Analyst",
                "description": "A security operations center receives thousands of alerts from endpoints, networks, applications, and authentication systems. Many alerts are harmless or duplicated, while a small number may indicate a coordinated cyberattack. The challenge is to automatically correlate related alerts, determine their severity, identify attack patterns, and prioritize the incidents that require immediate attention.",
                "category": "Cybersecurity AI & Autonomous Agents",
                "level": "Advanced"
            },
            {
                "id": "AI13",
                "title": "The Meeting That Forgot Everything",
                "description": "Important decisions, tasks, deadlines, and responsibilities are discussed across long and unstructured meetings. Participants may interrupt each other, change decisions, or leave actions implied rather than explicitly stated. The challenge is to understand the conversation, identify decisions and commitments, assign responsibilities, and generate an accurate actionable summary.",
                "category": "NLP & Meeting Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI14",
                "title": "The Last-Mile Delivery Puzzle",
                "description": "A logistics company must deliver hundreds of packages while dealing with traffic, delivery time windows, vehicle capacity, changing road conditions, failed deliveries, and dynamically changing customer locations. A route that appears optimal initially may become inefficient as conditions change, requiring the AI to continuously adapt delivery routes and priorities.",
                "category": "AI Optimization & Intelligent Logistics",
                "level": "Advanced"
            },
            {
                "id": "AI15",
                "title": "The Disaster Response Coordinator",
                "description": "During a disaster, emergency information arrives from weather systems, sensors, emergency calls, social media, satellite imagery, and field teams at different times and with varying reliability. The AI must combine these signals to identify critical areas, estimate changing risks, prioritize emergency resources, and recommend response actions while conditions continue to evolve.",
                "category": "AI Agents & Emergency Decision Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI16",
                "title": "The Face That Never Existed",
                "description": "A suspicious image or video appears authentic but may have been digitally manipulated using generative AI. Facial expressions, lighting, lip movements, audio, and visual artifacts may contain subtle inconsistencies that are difficult for humans to notice. The challenge is to detect whether the media has been manipulated and provide explainable evidence supporting the decision.",
                "category": "Generative AI Security & Computer Vision",
                "level": "Advanced"
            },
            {
                "id": "AI17",
                "title": "The Hidden Skill Gap",
                "description": "A student's or employee's current skills do not clearly match the skills required for a target role. Resumes, project experience, assessments, certifications, and job descriptions provide different and sometimes incomplete information. The AI must identify missing skills, distinguish critical gaps from minor ones, and generate a personalized learning path to bridge those gaps.",
                "category": "AI Recommendation & Skill Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI18",
                "title": "The Product That Looks Real",
                "description": "Counterfeit products are increasingly difficult to distinguish from genuine products because packaging, labels, logos, QR codes, and product appearance can be closely imitated. The AI must analyze visual and textual product characteristics along with available product information to estimate authenticity and identify suspicious inconsistencies.",
                "category": "Computer Vision & AI-Based Fraud Detection",
                "level": "Advanced"
            },
            {
                "id": "AI19",
                "title": "The Attack Before It Happens",
                "description": "A network appears normal even though subtle changes in login behavior, network traffic, system activity, and access patterns may indicate that an attacker is preparing for a larger cyberattack. Traditional systems often detect threats only after malicious activity occurs. The challenge is to learn early behavioral signals and predict the likelihood of an upcoming attack before significant damage occurs.",
                "category": "Predictive AI & Cybersecurity Intelligence",
                "level": "Advanced"
            },
            {
                "id": "AI20",
                "title": "The Memory Gap",
                "description": "An AI assistant interacts with a user across many conversations but gradually loses important context, causing it to forget previous decisions, commitments, preferences, and relationships between pieces of information. Some memories may also conflict, become outdated, or lack sufficient evidence. The challenge is to build an intelligent memory system that decides what information should be retained, updated, connected, or forgotten while maintaining accurate long-term context.",
                "category": "Generative AI & Long-Term Memory",
                "level": "Advanced"
            }
        ],




    /* =====================================================
       IOT PROBLEM STATEMENTS — 20
       ===================================================== */
    IOT: [
            {
                id: "IOT01",
                title: "Smart Flood Warning System",
                description:
                    "Monitor rainfall, water level, and environmental conditions to identify possible flooding and provide early warnings while continuing basic operation without internet connectivity.",
                category: "Environmental IoT",
                level: "Advanced"
            },

            {
                id: "IOT02",
                title: "Early Fire Detection System",
                description:
                    "Build an IoT system that detects early signs of fire using temperature, smoke, and gas sensors, reduces false alarms, and provides fast local emergency alerts.",
                category: "Safety & Security IoT",
                level: "Advanced"
            },

            {
                id: "IOT03",
                title: "AI-Based Smart Farmer Assistant",
                description:
                    "Collect soil and environmental data to help farmers decide when and how much to irrigate using intelligent recommendations that can operate in low-connectivity areas.",
                category: "Agricultural IoT",
                level: "Advanced"
            },

            {
                id: "IOT04",
                title: "Disaster-Resilient IoT Communication",
                description:
                    "Build an IoT communication network that continues sharing emergency information when the primary internet or communication link fails by using alternative communication paths.",
                category: "Communication IoT",
                level: "Advanced"
            },

            {
                id: "IOT05",
                title: "Smart Energy Theft Detection",
                description:
                    "Monitor electricity usage, identify unusual consumption patterns, distinguish normal demand changes from suspicious activity, and generate alerts for possible energy theft.",
                category: "Energy IoT",
                level: "Advanced"
            },

            {
                id: "IOT06",
                title: "Predictive Machine Failure Detection",
                description:
                    "Monitor machine vibration, temperature, and operating conditions to identify abnormal patterns and predict potential machine failures before unexpected breakdowns occur.",
                category: "Industrial IoT",
                level: "Advanced"
            },

            {
                id: "IOT07",
                title: "Intelligent Road Condition Monitoring",
                description:
                    "Develop an IoT system that detects potholes, rough surfaces, and other road abnormalities while recording their location and severity for maintenance planning.",
                category: "Smart City IoT",
                level: "Advanced"
            },

            {
                id: "IOT08",
                title: "Smart Livestock Health Monitoring",
                description:
                    "Use wearable or non-invasive IoT devices to monitor livestock activity and environmental conditions and identify unusual behavior or potential health and safety problems.",
                category: "Agricultural IoT",
                level: "Advanced"
            },

            {
                id: "IOT09",
                title: "Smart Water Pipeline Leakage Detection",
                description:
                    "Monitor water flow and pressure to identify leaks, detect abnormal flow patterns, generate alerts, and estimate the affected section of a pipeline.",
                category: "Water Management IoT",
                level: "Advanced"
            },

            {
                id: "IOT10",
                title: "Offline Smart Village IoT Network",
                description:
                    "Build a village-level IoT network that collects, processes, and displays essential water, environmental, agricultural, or energy data locally even when internet connectivity is unavailable.",
                category: "Rural IoT",
                level: "Advanced"
            },

            {
                id: "IOT11",
                title: "Smart Classroom Guardian",
                description:
                    "Build an IoT system that detects whether a classroom is being used efficiently and automatically manages unnecessary devices such as lights and fans when the room is empty.",
                category: "Smart Campus IoT",
                level: "Intermediate"
            },

            {
                id: "IOT12",
                title: "Smart Student Bag",
                description:
                    "Design an IoT-enabled student bag that detects unusual weight, forgotten items, or unexpected movement and provides useful alerts to the student.",
                category: "Wearable IoT",
                level: "Intermediate"
            },

            {
                id: "IOT13",
                title: "Smart Door Queue",
                description:
                    "Create an IoT system that automatically monitors people entering a restricted room, maintains an accurate real-time count, and prevents overcrowding without requiring manual counting.",
                category: "Access Control IoT",
                level: "Intermediate"
            },

            {
                id: "IOT14",
                title: "Emergency Vehicle Parking Priority",
                description:
                    "Build a smart parking system that identifies emergency vehicles and provides them with the fastest available parking or entry route while allowing normal vehicles to continue using the system.",
                category: "Smart Transportation IoT",
                level: "Advanced"
            },

            {
                id: "IOT15",
                title: "Smart Parcel Locker",
                description:
                    "Design a connected parcel locker that detects package delivery, verifies the authorized receiver, records opening and closing events, and remains secure during temporary internet failures.",
                category: "Security IoT",
                level: "Advanced"
            },

            {
                id: "IOT16",
                title: "Smart Canteen Food Counter",
                description:
                    "Create an IoT system that monitors food availability in a college canteen, estimates when items may run out, reduces food wastage, and provides students with current availability information.",
                category: "Smart Campus IoT",
                level: "Intermediate"
            },

            {
                id: "IOT17",
                title: "Smart Charging Station",
                description:
                    "Build an IoT charging station that manages multiple connected devices, intelligently distributes available power, prevents overload, and provides users with real-time charging status.",
                category: "Energy IoT",
                level: "Intermediate"
            },

            {
                id: "IOT18",
                title: "Smart Library Seat System",
                description:
                    "Develop an IoT system that detects available library seats and identifies seats occupied for long periods without actual usage while providing reliable real-time seat availability.",
                category: "Smart Campus IoT",
                level: "Intermediate"
            },

            {
                id: "IOT19",
                title: "Smart Tool Tracking System",
                description:
                    "Create an IoT system for a laboratory or workshop that tracks commonly used tools, identifies missing tools, and displays their last known location or associated user.",
                category: "Industrial IoT",
                level: "Intermediate"
            },

            {
                id: "IOT20",
                title: "Smart Home Power Scheduler",
                description:
                    "Build an IoT system that decides when selected household devices should operate based on usage patterns and available power to reduce unnecessary consumption while preserving manual control.",
                category: "Smart Home IoT",
                level: "Intermediate"
            },
    ]
};
                






/* =========================================================
   OPTIONAL HELPER FUNCTIONS
   ========================================================= */

/**
 * Get all statements from a domain.
 *
 * Example:
 * getStatementsByDomain("AI")
 * getStatementsByDomain("IOT")
 */
export function getStatementsByDomain(domain) {

    return DOMAIN_STATEMENTS[domain] || [];

}


/**
 * Find a statement using its ID.
 *
 * Example:
 * getStatementById("AI01")
 */
export function getStatementById(id) {

    for (const domain of Object.keys(DOMAIN_STATEMENTS)) {

        const statement =
            DOMAIN_STATEMENTS[domain].find(
                item => item.id === id
            );

        if (statement) {
            return statement;
        }

    }

    return null;

}


/**
 * Get total number of statements.
 */
export function getTotalStatements() {

    return Object.values(DOMAIN_STATEMENTS)
        .reduce(
            (total, statements) =>
                total + statements.length,
            0
        );

}


/**
 * Get statement count for a domain.
 */
export function getStatementCount(domain) {

    return (
        DOMAIN_STATEMENTS[domain]?.length || 0
    );

}