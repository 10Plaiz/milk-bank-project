Implemented

DASHBOARD
- Add Milk Lifecycle Pipeline
- Add Monthly Collection Volume (note: mL collected per month on all programs, should have a graph), Program Breakdown (note: volume by collection program), Recent Activity (note: general updates on the lifecycle, recipients, and operations), NICU Waiting List(note: should be connected to inquiries and waiting list)

DONOR MANAGEMENT
- Change card popup of add donor to a right side sidebar popup w/ personal info and health screening
- add edit info to donors for admin account only
- add a column to actions edit then a delete button
COLLECTION
- add labels for the popup when adding new collection
- add "age of baby"
- add "collected by" 
- in the table, add status 

LAB TESTING
-right sidebar (batch number, test type, result, and result date)
-change the test type dropdown into radio buttons instead
-change result into a button whether it is a pass or fail, when clicking pass, the button lights up green, and when fail, it lights up red
-add "tested by"

PASTEURIZATION
-change the card popup when clicking log pasteurization into a right sidebar
-add labels for right sidebar
-add batch number
-add operator, this should be connected to staff, so make it a dropdown of the currently registered staff and admin 
-add temeperature
-add duration

INVENTORY
-add donor, collection date, mode of collection, status (ready, post and pre testing, dispensed, discarded, raw)

RECIPIENTS
-change card popup to right sidebar

INQUIRIES AND WAITING
-add sections "active inquiries" and "waiting list" on top of the table where the user can click which tables they want to see
-change card popup when logging inquiry to a right sidebar
-add labels
-add recipient
-change the inquiry type dropdown into radio buttons instead
-add a confirmation checkbox which is required
-display notes instead of action
-change the status table in active inquiries and remove waiting but keep the other status, then for the other filter "waiting list", remove the statuses since they're all waiting


DISPENSING
-add timeline (1. Find Recipient 2. Verify Requirements 3. Select Batch 4. Fee Summary 5. Confirm & Disperse)
-continue the rest of the timeline
-fix the logic for new dispensing

SMS NOTIFICATIONS
-add a message template where the admin can freely edit the message for the SMS notification being sent out to recipients
*FOR STAFF*
-set the message template to read-only for staff logins
*FOR ADMIN*
-allow admin accounts to edit the message template 

REPORTS
-add cards for collections, volume collected, volume pasteurized, volume dispensed, volume discarded, 
donors registered, recipients served, and discard rate
-add piechart for inventory by status(volume distribution (mL))label the chart with ready, in testing, pasteurized, raw, dispensed, discarded, this should be connected to the supabase, but incase there is no data, show the chart as blank
- implement the logic for the collection unit ledger as the one shown in the photo is hardcoded

AUDIT LOG
-add Timestamp	User	Role	Action	Module	Record ID	Change Summary

