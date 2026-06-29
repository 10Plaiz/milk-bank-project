**Software Requirements Specification**  
---

**Document Control**

| Item | Details |
| ----- | ----- |
| Project Title | *Mother’s Reach* |
| Client | *Makati Human Milk Bank* |
| Prepared By | *Justine Jimenez, Luigi Ariola, Rafael Del Agua, Ranzel Virtucio, Yuan Alcantara* |
| Course | *CSS152P/Software Engineering 2* |
| Date | *April 28, 2026* |
| Version | 1.1 |

---

### **1\. Introduction**

#### **1.1 Purpose**

This project focuses on creating a web-accessible inventory application featuring SMS alerts to streamline the core operations of the Makati Human Milk Bank. The platform offers a digital module to seamlessly log, modify, and monitor data on raw, processed, and distributed breast milk, alongside a system to maintain and update the records of both the donating mothers and the receiving beneficiaries. Furthermore, it features automated reporting that compiles transaction data into weekly, monthly, and annual summaries, as well as an automated messaging function that instantly notifies mothers as soon as milk is ready to be dispensed. Ultimately, the application is intended to support the milk bank's staff by simplifying inventory and program oversight, speeding up the reporting process, and ensuring timely communication with parents regarding milk availability. 

#### **1.2 Document conventions**

This document applies specific formatting rules to maintain clarity and consistency. Bold typography highlights important terms, essential system states, and the titles of the milk bank's collection initiatives, specifically Supsup Todo, Mom’s Act, and Milky Way. Numbered lists outline the primary system features and major sections to build a logical structure, while bullet points break down functional requirements, user categories, and detailed process descriptions. Furthermore, specialized medical terms and domain-specific acronyms like DOH, NICU, and DTN are capitalized throughout the text. These terms are explicitly defined in the Glossary to ensure that all project stakeholders share a common understanding. 

#### **1.3 Project scope**

The scope of this project encompasses the development of a web-based application alongside an integrated SMS notification module. The system is specifically targeted for implementation at the Makati Human Milk Bank, located in Brgy. Bangkal, Makati City. It covers the entire operational process from the collecting, storing, and dispensing of human milk. Specifically, it integrates the distinct workflows of the milk bank's three major collection programs:

* **Supsup Todo:** A community-based mobile milk collection program.  
* **Mom’s Act:** A household-based pickup program for mothers who wish to donate milk from their homes.  
* **Milky Way:** A hospital-based collection program catering to premature babies confined in hospitals.

The target users operating and benefiting from the system include the staff stationed within the milk bank premises, medical staff deployed in partner hospitals, and the beneficiaries.

#### **1.4 Definitions, Acronyms, and Abbreviations**

| Term | Definition |
| ----- | ----- |
| **Beneficiary** | The infant receives the dispensed milk. Represented in the system by their guardian/parent who tracks requests and receives SMS notifications. |
| **Dispensed Milk** | The final state of donated milk that has successfully passed all laboratory testing, has been pasteurized, and is officially released to a beneficiary. |
| **DOH** | The national health governing body in the Philippines. The system’s operations and data retention policies must strictly adhere to their regulatory standards. |
| **DTN** | A unique identifier assigned to each donor in the system, ensuring an accurate audit trail linking specific donors to their respective raw milk batches and lab results. |
| **HMBMS** | The standalone, web-based software platform detailed in this specification, designed to replace manual logbooks for the Makati Human Milk Bank. |
| **LGU** | The local municipal government (in this case, Makati City Hall). The system is designed to be hardware-agnostic to run on existing LGU desktops and mobile devices. |
| **MHMB** | The primary organization and operational environment where the system will be deployed. |
| **Milky Way / Supsup Todo / Mom’s Act** | Specific local community outreach and milk donation programs. The system categorizes incoming donation records based on these source programs. |
| **NICU** | A specialized hospital department caring for premature or ill newborn infants, representing a primary destination for dispensed milk. |
| **Pasteurization** | The clinical process of heating raw milk to eliminate harmful pathogens. In the system, this is a distinct data state managed by the Medical Technologist. |
| **Philippine Milk Code** | National legislation (Executive Order No. 51\) regulating the marketing of breastmilk substitutes and protecting breastfeeding practices. |
| **Raw Milk** | The initial state of collected human milk before it undergoes microbiological screening and processing at the City Hall laboratory. |
| **SMS Gateway** | The telecommunications interface integrated into the software that allows the system to send automated text messages to beneficiaries regarding milk availability. |

#### **1.5 References**

The development, legal constraints, and operational design of the Human Milk Bank Management System are guided by the following literature, existing systems, and legal frameworks:

*Legal and Regulatory Frameworks:*

* **Republic Act No. 7600:** The "Expanded Breastfeeding Promotion Act of 2009", amending an act providing incentives to health institutions with rooming-in and breastfeeding practices.  
* **Makati City Ordinance No. 2014-089:** The local ordinance that officially established and named the Makati Human Milk Bank in 2014\.  
* **Philippine Milk Code:** Executive Order No. 51 regulating the marketing of breastmilk substitutes and protecting breastfeeding practices (as referenced in the functional requirements).  
* **MOP (2014):** *The Philippine Human Milk Banking (Manual of Operation)*. Department of Health.

*Literature and Articles:*

* Christensson, P. (2013). *Web Development Definition*.  
* Nielsen, Jakob. *Usability 101: Introduction to Usability*.  
* Rodriguez, Fritzie (2014). Got milk? Makati says yes. Rappler report.

---

### **2\. Overall Description**

#### **2.1 Product Perspective**

The HMBMS is a standalone, web-based platform designed to serve as the primary operational tool for the Makati Human Milk Bank. It integrates community outreach programs with clinical laboratory processes and hospital distribution, replacing existing logbooks with a centralized database accessible via web browsers.

#### **2.2 Product Functions**

The Human Milk Bank Management System will provide the following core product functions:

* **Inventory Management:** A web-based module that allows milk bank staff to record, view, and update pertinent information regarding the status of the breast milk. This includes tracking the milk through its lifecycle from unpasteurized (donated) milk, to lab testing, pasteurization, and finally, dispensed milk.  
* **User Record Management:** A module designed to create, record, and update detailed profiles and health information for both mother-donors and mother-beneficiaries. This includes managing donor lists, personal information, and screening details.  
* **Donation and Collection Logging:** Functionality to log new milk donations, which includes recording batch numbers, assigning donor tracking numbers (DTN), and categorizing the collection type based on the facility's specific programs (Supsup Todo, Milky Way, and Mom’s Act).  
* **Dispensing and Inquiry Processing:** A function to log inquiries from beneficiaries, verify milk availability against current inventory, and process the dispensing of the milk while updating the database records accordingly.  
* **Automated Report Generation:** An auto-generation module that produces daily, weekly, monthly, and yearly summary reports regarding the facility's collection, pasteurization, and dispensing activities.  
* **SMS Notification System:** An integrated messaging module that automatically sends SMS text messages to inquiring mothers/beneficiaries to alert them the moment milk becomes available for dispensing.

#### **2.3 User classes and characteristics**

| User Class | Characteristics |
| ----- | ----- |
| Donor (Mother) | Community members providing milk require simple, mobile-friendly interfaces. |
| Recipient (Parent) | Guardians of infants in need; tracks requests and receives SMS notifications. |
| Administrator/Head | Can be any designated staff in the milk bank to manage inventory and system administration. |
| Physician (Doctor) | Clinical director; requires oversight, approval authority, and system access. |
| Nurse / Midwife | Clinical and field staff require triage, collection, and outreach management tools. |
| Medical Technologist | Lab staff; requires precise logging of pasteurization and microbiological results. |

#### **2.4 Operating Environment**

The system is developed as a fully responsive web application, ensuring compatibility across desktop and mobile browsers. Subsequently, the project will use the following technologies:

* Desktop Browsers (Internet Explorer, Chrome, Firefox, Safari)  
* Mobile Browsers (Opera Mini, Chrome Mobile)  
* Server Side: React, Typescript, (Or Python)  
* Database: Supabase, MySQL

#### **2.5 Design and implementation constraints**

1) *Regulatory Compliance:* Must adhere strictly to the Philippine Milk Code and DOH standards.  
2) *Hardware Agnostic:* Must function on existing LGU hardware (standard PCs/phones).  
3) *Telecommunications:* Requires a 2G mobile phone or SMS gateway integration for the SMS notification function.  
4) *Connectivity:* Must be optimized for varying internet speeds in community settings.

#### **2.6 Assumptions and dependencies**

1. *Assumption:* MHMB staff will have basic digital literacy to operate the web platform.  
2. *Assumption:* Donors and recipients will have active mobile numbers to receive SMS.  
3. *Dependency:* Reliable access to internet services for real-time synchronization

---

### **3\. Functional Requirements**

**3.1 Supsup Todo (Community-Based Collection)**

**3.1.1** The system shall allow staff to record the results of a donor's preliminary screening lab tests, determining whether they pass and can proceed to the counseling and interview stages.

**3.1.2** The system shall provide a feature to log the completion of donor counseling, interviews, and consent signing.

**3.1.3** The system shall allow staff to record the volume of extracted milk (up to a maximum limit of 800mL per day or 30mL-240mL per session) and generate data for bottling and labeling under the cold chain method.

**3.1.4** The system shall track milk samples (less than 5 mL) sent to the City Hall for a 2-week laboratory testing period, updating the batch status to either approved for pasteurization or disposed based on the lab results.

**3.2 Mom’s Act (Household-Based Collection)**

**3.2.1** The system shall allow pre-screened mothers to submit a request or log a call to the milk bank to schedule a household milk pickup.

**3.2.2** The system shall enable staff to log the details of the milk collected from the household, including the volume and date of collection.

**3.2.3** The system shall track the lab testing lifecycle of the collected milk, logging the initial sampling sent to City Hall, the pasteurization of passed milk, and the post-pasteurization sampling, until the milk is marked ready for storage and dispensing.

**3.3 Milky Way (Hospital-Based Collection)**

**3.3.1** The system shall allow milk bank staff to log hospital visit schedules and record breast milk collections sourced directly from partner hospitals.

**3.3.2** The system shall require staff to record the bottling and labeling details of the hospital-collected milk using the cold chain method.

**3.3.3** The system shall maintain an audit trail for the milk's testing phases, automatically updating the inventory when the City Hall laboratory results pass the pre-pasteurization and post-pasteurization tests, ultimately clearing the milk for dispensing to beneficiaries such as premature babies in the NICU.

---

### **4\. Non-Functional Requirements**

*4.1 Performance Requirements*

1. The system shall be fully responsive as a web application, optimized to load all of the functions smoothly and without any errors.   
2. The system’s architecture shall be able to handle heavy traffic during busy business hours and not lose any of its functionality in the process  
3. The system shall be strictly web-based and universally compatible, allowing the business to avoid the capital expenditure and maintenance risks associated with specialized handheld devices.

*4.2 Security Concerns*

1. The system shall securely encrypt user passwords and utilize secure, token-based authentication to prevent unauthorized access and data breaches.

*4.3 User Experience*

1. The system interface shall be intuitive, user-friendly, and easy to navigate.  
2. The system shall maintain 24/7 availability with minimal downtime, ensuring continuous and uninterrupted service.

### **5\. Context Diagrams**

This section presents the high-level boundaries and data exchange tracks for the three primary workflows driving the Human Milk Bank Management System (HMBMS). Each context diagram highlights the system's external entities, incoming inputs, and outgoing organizational responses.

#### *5.1 Supsup Todo Context Diagram (Community-Based)*
The community operational boundary defines data parameters managed between field mothers, city hall processing nodes, and internal station staff.

* *Inputs:* Mothers provide raw donated milk samples, preliminary interview transcripts, personal profiles, and signed consents. Internal staff submit explicit bottling details and field counseling logs. City Hall supplies primary laboratory clearance metrics.
* *Outputs:* The system delivers diagnostic screening and counseling summaries back to the donor mothers, establishes digital audit trails via batch tracking numbers sent to City Hall, and returns structured donor profiles along with batch tracking logs to administrative personnel.

#### *5.2 Milky Way Context Diagram (Hospital-Based)*
The clinical operational layout balances real-time hospital collection networks with institutional neonatal intensive care distribution workflows.

* *Inputs:* Partner hospital staff input clinical collection volumes, while milk bank staff supply targeted hospital visit schedules and baseline donation records. Beneficiaries submit formal access requests directly to the system boundary.
* *Outputs:* The system transmits programmatic collection confirmations to partner hospitals, distributes secure dispensing notifications to recipient guardians, synchronizes clinical validation metadata directly with the City Hall Laboratory, and feeds structural inventory updates back to primary milk bank staff.

#### *5.3 Mom’s Act Context Diagram (Household-Based)*
The domestic logistics pipeline maps out residential collection requests, decentralized processing logic, and localized SMS alert protocols.

* *Inputs:* Registered donor mothers submit domestic pickup coordinates, updated health screeners, and milk volume specs. Field personnel furnish clinical approvals, system configurations, and verified screening metrics. Inquiring recipients enter milk availability inquiries.
* *Outputs:* Structural inventory summaries and programmatic activity metrics are routed to system managers. Dispensed batch records are cross-referenced with partner clinical hubs. The boundary maps notification triggers down to an integrated telecommunications SMS Gateway to stream real-time availability alerts directly to waiting recipients.