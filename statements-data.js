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
            id: "AI01",
            title: "AI-Powered Early Crop Disease Detection & Mitigation",
            description:
                "Develop a computer vision and deep learning solution to analyze leaf imagery from smartphones or drones to diagnose plant diseases early and recommend targeted organic or chemical treatments.",
            category: "Computer Vision & Agriculture",
            level: "Intermediate"
        },

        {
            id: "AI02",
            title: "Intelligent Multilingual Healthcare Triage Assistant",
            description:
                "Build an AI chatbot powered by Large Language Models that collects patient symptoms in regional languages, assesses urgency, generates preliminary summaries, and directs users to suitable healthcare services.",
            category: "NLP & Healthcare",
            level: "Advanced"
        },

        {
            id: "AI03",
            title: "Autonomous Traffic Congestion & Emergency Routing System",
            description:
                "Create an AI traffic management platform using real-time camera streams to identify congestion, optimize traffic signal timings, and provide priority routing for emergency vehicles.",
            category: "AI Vision & Smart Cities",
            level: "Advanced"
        },

        {
            id: "AI04",
            title: "Automated Student Code Evaluation & Plagiarism Detector",
            description:
                "Design an AI tool that evaluates programming submissions for code quality, structural similarity, logic errors, and potential plagiarism using AST analysis and semantic embeddings.",
            category: "EdTech & Code Analytics",
            level: "Intermediate"
        },

        {
            id: "AI05",
            title: "AI Financial Fraud & Anomalous Transaction Monitoring",
            description:
                "Build a machine learning system that monitors financial transactions, identifies unusual behavior, detects fraudulent patterns, and provides explainable risk indicators.",
            category: "FinTech & Predictive AI",
            level: "Advanced"
        },

        {
            id: "AI06",
            title: "Smart Waste Sorting & Recyclable Material Classifier",
            description:
                "Develop a lightweight computer vision model capable of classifying waste such as plastic, glass, paper, e-waste, and organic material for automated waste segregation.",
            category: "Computer Vision & Sustainability",
            level: "Intermediate"
        },

        {
            id: "AI07",
            title: "AI Mental Wellness Companion",
            description:
                "Create an empathetic conversational AI assistant that analyzes user text and sentiment to provide supportive wellness suggestions, journaling assistance, and appropriate escalation guidance.",
            category: "NLP & Wellness",
            level: "Intermediate"
        },

        {
            id: "AI08",
            title: "Predictive Industrial Equipment Failure & Maintenance",
            description:
                "Construct a time-series machine learning model using vibration, temperature, and acoustic data to predict equipment failures before they occur and support preventive maintenance.",
            category: "Predictive Analytics & Industry 4.0",
            level: "Advanced"
        },

        {
            id: "AI09",
            title: "Smart Accessibility Assistant for Visually Impaired",
            description:
                "Develop a mobile visual AI application that reads text, recognizes objects, identifies obstacles, and provides useful audio feedback to assist visually impaired users.",
            category: "Assistive AI & Computer Vision",
            level: "Intermediate"
        },

        {
            id: "AI10",
            title: "Automated Legal Document Summarization & Clause Analyzer",
            description:
                "Build an NLP application that processes lengthy legal documents, extracts important obligations, identifies potentially risky clauses, and generates simplified summaries.",
            category: "LegalTech & LLM",
            level: "Advanced"
        },

        {
            id: "AI11",
            title: "AI-Based Food Quality Inspection System",
            description:
                "Develop a computer vision system that analyzes food images to identify visible quality issues such as spoilage, contamination indicators, defects, or improper storage conditions.",
            category: "Computer Vision & FoodTech",
            level: "Intermediate"
        },

        {
            id: "AI12",
            title: "Intelligent Resume Screening & Skill Matching",
            description:
                "Create an AI recruitment assistant that extracts skills from resumes, compares them with job requirements, identifies skill gaps, and ranks candidates using explainable matching criteria.",
            category: "NLP & Recruitment",
            level: "Intermediate"
        },

        {
            id: "AI13",
            title: "AI-Powered Disaster Damage Assessment",
            description:
                "Develop a computer vision system that analyzes drone or satellite imagery after natural disasters to identify damaged buildings, blocked roads, and affected areas for faster response planning.",
            category: "Computer Vision & Disaster Management",
            level: "Advanced"
        },

        {
            id: "AI14",
            title: "Personalized AI Learning Path Generator",
            description:
                "Build an AI learning assistant that analyzes a student's knowledge level, interests, performance, and goals to generate a personalized learning path with resources and milestones.",
            category: "Generative AI & EdTech",
            level: "Intermediate"
        },

        {
            id: "AI15",
            title: "AI-Powered Fake News & Misinformation Detector",
            description:
                "Create an NLP-based system that analyzes news articles or social media content for misleading claims, suspicious patterns, and potentially unreliable information while presenting supporting evidence.",
            category: "NLP & Information Security",
            level: "Advanced"
        },

        {
            id: "AI16",
            title: "Intelligent Public Transport Demand Prediction",
            description:
                "Develop a machine learning model that predicts passenger demand across different routes and time periods to help optimize public transport scheduling and resource allocation.",
            category: "Machine Learning & Smart Cities",
            level: "Advanced"
        },

        {
            id: "AI17",
            title: "AI-Based Energy Consumption Forecasting",
            description:
                "Build a predictive AI system that analyzes historical electricity usage and environmental conditions to forecast future consumption and recommend energy-saving actions.",
            category: "Predictive AI & Sustainability",
            level: "Intermediate"
        },

        {
            id: "AI18",
            title: "AI-Powered Document Information Extractor",
            description:
                "Create an intelligent document processing system that extracts names, dates, amounts, addresses, tables, and other relevant information from scanned or digital documents.",
            category: "OCR & Intelligent Automation",
            level: "Intermediate"
        },

        {
            id: "AI19",
            title: "AI-Based Customer Complaint Classification System",
            description:
                "Develop an NLP system that automatically categorizes customer complaints, identifies urgency, detects recurring issues, and routes complaints to the appropriate department.",
            category: "NLP & Customer Service",
            level: "Intermediate"
        },

        {
            id: "AI20",
            title: "AI-Powered Emergency Response Assistant",
            description:
                "Build an AI assistant that analyzes emergency reports, identifies the type and severity of incidents, prioritizes cases, and recommends appropriate response resources.",
            category: "Generative AI & Emergency Management",
            level: "Advanced"
        }

    ],


    /* =====================================================
       IOT PROBLEM STATEMENTS — 20
       ===================================================== */

    IOT: [

        {
            id: "IOT01",
            title: "Smart Classroom Guardian",
            description:
                "Build an IoT system that detects whether a classroom is being used efficiently and automatically manages unnecessary devices such as lights and fans when the room is empty.",
            category: "Smart Campus",
            level: "Intermediate"
        },

        {
            id: "IOT02",
            title: "Smart Student Bag",
            description:
                "Design an IoT-enabled student bag that detects unusual weight, forgotten items, or unexpected movement and provides useful alerts to the student.",
            category: "Wearable IoT",
            level: "Intermediate"
        },

        {
            id: "IOT03",
            title: "Smart Door Queue",
            description:
                "Create an IoT system that monitors people entering a restricted room, maintains an accurate real-time occupancy count, and prevents overcrowding.",
            category: "Smart Campus",
            level: "Beginner"
        },

        {
            id: "IOT04",
            title: "Emergency Vehicle Parking Priority",
            description:
                "Build a smart parking system that identifies emergency vehicles and provides them with the fastest available parking or entry route while maintaining normal parking operations.",
            category: "Smart Transportation",
            level: "Advanced"
        },

        {
            id: "IOT05",
            title: "Smart Parcel Locker",
            description:
                "Design a connected parcel locker that detects package delivery, verifies authorized receivers, and records opening and closing events while maintaining security during internet failures.",
            category: "Security & IoT",
            level: "Intermediate"
        },

        {
            id: "IOT06",
            title: "Smart Canteen Food Counter",
            description:
                "Create an IoT system that monitors food availability in a college canteen and estimates when an item may run out to reduce food wastage and improve student convenience.",
            category: "Smart Campus",
            level: "Intermediate"
        },

        {
            id: "IOT07",
            title: "Smart Charging Station",
            description:
                "Build an IoT charging station that manages multiple devices, distributes available power intelligently, prevents overload, and provides real-time charging information.",
            category: "Energy Management",
            level: "Intermediate"
        },

        {
            id: "IOT08",
            title: "Smart Library Seat System",
            description:
                "Develop an IoT system that detects available library seats and identifies seats that remain occupied for long periods without actual usage.",
            category: "Smart Campus",
            level: "Beginner"
        },

        {
            id: "IOT09",
            title: "Smart Tool Tracking System",
            description:
                "Create an IoT system for laboratories or workshops that tracks commonly used tools and identifies missing tools along with their last known location or associated user.",
            category: "Asset Tracking",
            level: "Intermediate"
        },

        {
            id: "IOT10",
            title: "Smart Home Power Scheduler",
            description:
                "Build an IoT system that schedules household devices based on usage patterns and available power while reducing unnecessary consumption and maintaining manual user control.",
            category: "Smart Home & Energy",
            level: "Intermediate"
        },

        {
            id: "IOT11",
            title: "Smart Flood Warning System",
            description:
                "Monitor rainfall, water level, and environmental conditions to identify possible flooding and provide early warnings. The system should continue basic operation without internet connectivity.",
            category: "Disaster Management",
            level: "Advanced"
        },

        {
            id: "IOT12",
            title: "Early Fire Detection System",
            description:
                "Detect early signs of fire using temperature, smoke, and gas sensors while reducing false alarms and providing rapid local emergency alerts.",
            category: "Safety & Disaster Management",
            level: "Intermediate"
        },

        {
            id: "IOT13",
            title: "AI-Based Smart Farmer Assistant",
            description:
                "Collect soil moisture, temperature, humidity, and environmental data to help farmers decide when and how much to irrigate while providing intelligent recommendations in low-connectivity areas.",
            category: "Smart Agriculture",
            level: "Advanced"
        },

        {
            id: "IOT14",
            title: "Disaster-Resilient IoT Communication",
            description:
                "Build a communication network that continues sharing emergency information when the primary internet or communication link fails by using alternative communication paths.",
            category: "Communication & Disaster Management",
            level: "Advanced"
        },

        {
            id: "IOT15",
            title: "Smart Energy Theft Detection",
            description:
                "Monitor electricity usage, identify unusual consumption patterns, distinguish normal demand changes from suspicious activity, and generate alerts.",
            category: "Energy & Security",
            level: "Advanced"
        },

        {
            id: "IOT16",
            title: "Predictive Machine Failure Detection",
            description:
                "Monitor vibration, temperature, and operating conditions to identify abnormal patterns and predict machine failures before breakdowns occur.",
            category: "Industrial IoT",
            level: "Advanced"
        },

        {
            id: "IOT17",
            title: "Intelligent Road Condition Monitoring",
            description:
                "Detect potholes, rough surfaces, and other road abnormalities using sensors or connected devices and record their location and severity for maintenance planning.",
            category: "Smart Transportation",
            level: "Intermediate"
        },

        {
            id: "IOT18",
            title: "Smart Livestock Health Monitoring",
            description:
                "Use wearable or non-invasive IoT devices to monitor livestock activity and environmental conditions and identify unusual behavior or potential health and safety issues.",
            category: "Smart Agriculture",
            level: "Intermediate"
        },

        {
            id: "IOT19",
            title: "Smart Water Pipeline Leakage Detection",
            description:
                "Monitor water flow and pressure to identify leaks, detect abnormal flow patterns, alert users, and optionally estimate the affected section of the pipeline.",
            category: "Smart Water Management",
            level: "Advanced"
        },

        {
            id: "IOT20",
            title: "Offline Smart Village IoT Network",
            description:
                "Collect village-level water, environmental, agricultural, or energy data while continuing to process and display essential information locally even when internet connectivity is unavailable.",
            category: "Rural IoT & Smart Village",
            level: "Advanced"
        }

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