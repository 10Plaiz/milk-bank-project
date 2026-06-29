### **Introduction, Purpose, & Core Architecture**

**Luigi:** Good day, everyone. Today, we are proud to present **Mother's Reach**, a web-based management and inventory platform designed specifically for the Makati Human Milk Bank. Developed in compliance with local health regulations and national standards, this system replaces traditional, manual paper logbooks with a secure, centralized digital workspace. Our primary goal is to simplify inventory oversight, speed up reporting for management, and establish direct communication with parents through automated email updates.

**Luigi:** From an architectural standpoint, **Mother's Reach** is built as a split system. On the front end, users interact with a modern, responsive web application that runs smoothly on existing desktop computers at City Hall or on mobile devices carried by staff in the field.  
On the back end, we utilize a secure database framework. What sets our system apart is that we don’t rely solely on user-facing software to enforce safety. Instead, we built critical clinical safety rules directly into the database layer itself. This ensures that even if a user makes a mistake on their screen, the core database acts as an automated safety net, rejecting any inputs that could compromise medical standards.

To show you how this data is organized, I'll hand it over to Ranzel.

### **Data Lifecycle & Donor Management**

**Ranzel:** Thank you, Luigi. To guarantee absolute traceability, our system tracks the entire lifecycle of donated human milk. Every drop of milk can be traced from a final, dispensed bottle all the way back to the specific collection day and the original mother’s initial medical screening.  
Our data structure tracks unique tracking numbers for both mothers and their collections. Individual collections are grouped together into batches for testing and processing. This maintains complete historical traceability even when donations are combined.  
This data foundation directly supports our donor intake process. **Mother's Reach** natively handles the milk bank's three distinct community outreach programs:

* **Supsup Todo**, which handles mobile community collections;  
* **Mom's Act**, for household pickups; and  
* **Milky Way**, which coordinates collections directly inside partner hospitals.

**Ranzel:** When a nurse or clerk registers a mother, the interface dynamically adapts. For community-based donors, staff must log an extensive health history checklist, counseling logs, and signed consent forms. However, for hospital or household-based programs where mothers are pre-screened on-site, the system intelligently bypasses the redundant questionnaires and automatically updates their status.

Yuan will now explain how collections and testing are managed.

### 

### **Collection Rules & The Laboratory Pipeline**

**Yuan:** Thank you, Ranzel. Once a donor is cleared, they can begin donating milk.  
Through the collection interface, staff log critical metrics such as milk volume and collection dates. To safeguard donor health, the database enforces a strict daily restriction rule. If a user accidentally enters an input where a single donor contributes more than **800 mL** in a single calendar day, the database immediately triggers an automatic rollback, blocking the entry to prevent human error.  
Once these collections are safely pooled into a raw batch, the system passes them through a rigid, two-stage clinical testing pipeline:

1. **Pre-Pasteurization**: A small testing sample is sent to the City Hall laboratory, and the batch status shifts to 'testing'. To prevent anyone from accidentally bypassing safety steps, the database locks the entry. If a batch fails this microbiological test, it is automatically marked as discarded, and the system logs the exact failure reason.  
2. **Pasteurization**: If it passes, the technologist inputs the pasteurization data. The system enforces a strict clinical gate, validating that the milk was heated between 60.0°C and 65.0°C for exactly 25 to 40 minutes.  
3. **Post-Pasteurization**: A second, final round of lab testing is performed. Only when this final test comes back clear does the database unlock the batch and mark it as completely safe for distribution.

I’ll hand it over to Rafael to discuss inventory and waitlist management.

### **Inventory Integrity & The Priority Waiting List**

**Rafael:** Thank you, Yuan. Once a batch is officially cleared, it enters our inventory module where it is divided into physical storage bottles using strict cold chain methods.  
Even here, the database preserves math and inventory integrity. The system prevents a bottle's remaining volume from ever exceeding its original poured capacity, and it automatically stamps a strict shelf-life expiration date on the entry before making it available for selection.  
Simultaneously, we manage recipient requests from families and guardians.

**Rafael:** When a baby needs milk, staff log the inquiry into the system. To ensure absolute fairness and clinical prioritization, our waitlist dashboard organizes requests on a strict **First-In, First-Out (FIFO)** basis using the exact request timestamp. Furthermore, to protect limited community resources, the system requires confirmation of an infant's medical status, such as being in the NICU, before they can occupy an active slot in the queue.  
Leee will now close our presentation by detailing the dispensing gates, background systems and a live demo of the system.

### 

### **Dispensing Safety Gates & Background Support Systems**

**Leee:** Thank you, Rafael. We arrive at the final and most critical phase: safely dispensing the milk to a beneficiary.  
When a family comes to pick up an order, staff use a digital selector to identify the oldest available matching bottles in inventory. However, the system acts as an absolute clinical gatekeeper. The database will completely block and reject the transaction unless staff physically verify that three specific safety conditions are met:

1. The patient's **Clinical Abstract** is verified.  
2. A valid medical **Prescription** is present.  
3. The recipient has brought a **Cooler with Ice** to maintain the cold chain during transport.

The moment these flags are checked and confirmed, the database reduces the bottle inventory, updates the internal records, and logs the dispensing staff member. Instantly, an integrated notification system fires an automated email directly to the inquiring parent confirming their request is fulfilled.  
Behind all of these user-facing actions sit our background support networks, which run continuously to guarantee accountability:

* **Automated Reporting**: The system continuously aggregates real-time data to generate clean weekly, monthly, and annual operational summaries for administrators.  
* **Real-Time Audit Trails**: Every single addition, modification, or deletion across our database tables automatically takes a permanent snapshot. It logs exactly who made the change, when it occurred, and what the data looked like before and after the edit, making the system fully auditable.  
* **Role-Based Security**: Access is strictly compartmentalized. While frontline staff can manage collections and inputs, destructive actions are locked exclusively behind high-level administrative permissions.

To give you a better understanding of how these mechanisms translate into an active interface, we will now transition to a live demo of the Mother's Reach platform.

### **Live Application Demonstration (2–3 Minutes) (Leee)**

### **Conclusion**

**Leee (Resuming after the demo):** In conclusion, **Mother's Reach** bridges technical automation with clinical responsibility, ensuring that software design directly protects infant health. Thank you, and we are now open for any questions.  
