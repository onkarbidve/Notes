# Automate Business Process Flow (BPF) Stage Movement Using Power Automate 

Below is the complete step‑by‑step procedure to move a BPF stage automatically based on conditions (example: Opportunity BPF → Opportunity Sales Process). 

**🔵 STEP 1 — Identify the BPF Entity Behind the Process** 

Every BPF in Dynamics 365 has an **underlying table** . 

For the **Opportunity Sales Process** , the table is: 

**Item Value** 

BPF Entity **opportunitysalesprocess** 

Key Fields activestageid, statuscode, _bpf_opportunity_value, processid 

You will use this entity to **read & update** the BPF instance. 

- **🔵 STEP 2 — Create a New Power Automate Cloud Flow** 

   1. Open **Power Automate** 

   2. Click **Create** 

   3. Select **Automated Cloud Flow** 

   4. Give the flow a name → _e.g., Automate Opportunity BPF Stage_ 

   5. Set the trigger → continue 

- **🔵 STEP 3 — Select the Trigger** 

Choose: 

## **Trigger:** 

- ➡️� _When a row is added, modified or deleted (Dataverse)_ 

Configure it: 

- Table: **Opportunity (opportunity)** 

- Scope: Organization 

- Change Type: Modified (recommended) 

Optional: Add a trigger condition later to avoid unnecessary runs. 

## **🔵 STEP 4 — Add a Condition** 

Example condition: 

Move BPF stage only when **Estimated Revenue > 50,000** 

In the Condition: 

- Left value: **estimatedvalue** 

- Operator: **greater than** 

- Right value: **50000** 

If Yes → proceed to next steps. If No → do nothing. 

**🔵 STEP 5 — Get BPF Instance (List Rows)** 

Add **List Rows (Dataverse)** . 

Purpose: fetch the **BPF instance** linked to this Opportunity. 

Configure: 

- Table: **opportunitysalesprocess** 

Filter Query: 

_bpf_opportunity_value eq @{triggerOutputs()?['body/opportunityid']} 

This retrieves the active BPF instance for the Opportunity. 

From this List Rows, you will later use: 

- **opportunitysalesprocessid** → BPF Instance ID 

- **_processid_value** → BPF Definition ID 

## **🔵 STEP 6 — Get the Target Stage (ProcessStage Table)** 

You cannot directly set activestageid with text. You MUST provide the **processstageid** . 

So add: 

## **🔵 List Rows (Dataverse)** 

- Table: **Process Stages (processstage)** 

Use this filter: 

_processid_value eq @{first(outputs('List_BPF')?['body/value'])?['_processid_value']} and stagename eq 'Develop' 

Replace **'Develop'** with the stage you want (e.g., Propose, Close). 

From this output, capture: 

- **processstageid** → required to update activestageid 

**🔵 STEP 7 — Update the BPF Record (Move to New Stage)** 

Add: **Update a row (Dataverse)** 

Configure: 

- Table: **opportunitysalesprocess** 

- Row ID: 

@{first(outputs('List_BPF')?['body/value'])?['opportunitysalesprocessid']} Now set: 

**Field Value** 

**activestageid** processstageid from Step 6 

Power Automate will automatically map the stage reference. 

## **🔵 STEP 8 — Save and Test** 

1. Open an Opportunity record 

2. Change **Estimated Revenue** to 60,000 

3. Click Save 

4. Power Automate runs 

5. BPF Stage moves from: **Qualify → Develop** (or whichever you set) 

## **Short + strongest points:** 

- **🔵 1. Plugins cannot reliably update BPF stages** 

   - BPF runs in a **separate async pipeline** , plugins run in the main pipeline → conflicts. 

   - Updating activestageid via plugin can cause errors. 

      - **➡ Microsoft does NOT recommend plugins for BPF automation.** 

- **🔵 2. JavaScript cannot update backend BPF data** 

   - JS runs only on UI, not server. 

   - Cannot modify processstage, opportunitysalesprocess tables. 

      - **➡ JS is not capable of changing BPF stages safely.** 

- **🔵 3. Power Automate natively** 

   - **Can read processstage, BPF instance, and update activestageid.** 

   - **Dataverse connector is built for this.** 



<!-- Start of picture text -->
@ 3. JavaScript Cannot Update BPF<br>Stages Safely<br>Client-side code runs in the browser and:<br>Cannot write to processstage table<br>> Cannot update BPF instance record<br>Only changes UI, not backend<br>> Unreliable for automation<br>Breaks if user disables scripts or uses Mobile App<br>— JavaScript is only for UI changes, not BPF automation.<br><!-- End of picture text -->



<!-- Start of picture text -->
® Final Interview-Perfect Summary<br>Power Automate is the best approach to automate BPF because it is the only Microsoft-supported, low-<br>risk, low-code, server-side automation that can safely update the BPF instance and activestageid using<br>the Dataverse connectors. It avoids plugin pipeline conflicts, does not rely on client-side UI, provides<br>monitoring and error handling, and aligns with Microsoft's long-term platform direction.<br><!-- End of picture text -->

## **Only One Active BPF per Record** 

A record (like Opportunity, Case, Lead) can have **only one active BPF at a time** . You cannot run multiple BPFs simultaneously on the same record. 

## **2. Limited to Stage-Based, Linear Processes** 

BPFs cannot handle: 

- Complex branching logic 

- Dynamic looping 

- Non-linear workflows 

They follow a **fixed, sequential stage flow** , which is a limitation for complex business scenarios. 

## **3. Cannot Perform Server-Side Logic Directly** 

BPF cannot: 

- Update fields automatically 

- Create records 

- Call APIs 

- Run server-side logic 

For automation, you must use: 

- Power Automate 

- Workflows 

- Plugins 

BPF alone is only a **visual guidance tool** . 

## ⭐ **Extra (If needed)** 

Other limitations: 

- Maximum 30 stages 

- Maximum 5 BPFs can be switched per entity 

- Cannot handle heavy data processing 

- Limited custom controls / UI capabilities 

Connection and connection reference 



<!-- Start of picture text -->
W Short Interview Answer (Perfect 2-3<br>lines)<br>“Power Automate uses Connections for authentication and Connection References to bind those connections<br>to solution-aware flows. | manage them by creating flows inside solutions, using a single shared connection<br>reference for each service, and remapping connection references during Dev + Test + Prod deployment to<br>ensure proper authentication per environment.”<br><!-- End of picture text -->

Notepad notes => 

Data operations 

02 June 2025 

15:41 

Create csv table - 



<!-- Start of picture text -->
ca ila<br>ns _<br>* Site Address Testing Team = tips”, naereenencl, © *777tt.comsites...<br>|<br>* Folder Path (shares Documents/General/convertabletest o<br>* File Name ExtractedhtmitabiefT] ReceivedTi. X .csv<br>concat(uriComponentToString("%EF%BB%BF"),body("Create_CSV_table’))<br><!-- End of picture text -->

In body while taking it expects array so 

e.g:body('List_of_products')?['value'] 

Output - Array of objects 

## **. Compose** 

Used to store or calculate a value. 

- ✔ Hold temporary data 

- ✔ Use expressions 

- ✔ Pass data between steps 

## **🔵 2. Parse JSON** 

Used to **read structured data** from: 

   - API responses 

   - Webhooks 

   - HTTP calls 

   - Power Apps inputs 

- ✔ Creates dynamic tokens 

- ✔ Strongly recommended for APIs 

## **🔵 3. Create HTML Table** 

Converts **array → HTML table** . 

Used for: 

- Emails 

- Reports 

- Approvals 

## **🔵 4. Create CSV Table** 

Converts **array → CSV format** . 

Used in: 

- File exports 

- Integration with Blob/OneDrive 

- Data migration 

**🔵 5. Join** 

Combines an array into a single string with a separator. 

Example: 

Join email addresses with ; 

## **🔵 6. Select** 

Transforms each item in an array. 

- ✔ Useful for mapping fields 

- ✔ Reshape JSON for API calls 

Example: 

Convert complex object → simple array. 

## **🔵 7. Filter Array** 

Filters items based on conditions. 

- ✔ Used heavily in Dataverse list row filtering 

- ✔ Example: Get active cases only 

## **🔵 8. Append to Array Variable** 

Adds data into an existing array. 

Used in loops to build collections. 

## **🔵 9. Append to String Variable** 

Adds text to a string variable. 

Used for logs or combined messages. 

## **🔵 10. Initialize Variable / Set Variable** 

## **1. JOIN (Data Operation)** 

## **Purpose:** 

Used to **convert an array into a single string** using a separator. 

## **Where used:** 

- Combine multiple values into one line 

- Build comma‑separated or semicolon‑separated lists 

- Prepare text for emails, logs, or API calls 

## **Example:** 

Array: 

["Onkar", "Riddhi", "Gopal"] 

Join with comma: 

join(body('List_rows')?['value'],' , ') 

Output: 

## **Onkar , Riddhi , Gopal** 

## 2. 

## **Suppose you have JSON like this:** 

## JSON 

{ "name": "Onkar", "city": "Pune", "age": 25 } 

Show more lines 

This JSON comes from: 

- API response 

- HTTP call 

- Webhook 

- Custom connector 

Power Automate does **NOT** understand these values directly. 

So we use **Parse JSON** . 

**🔵 Step 1: Add Parse JSON Action** 

Inside Parse JSON: 

## **Content:** 

Paste the JSON body (dynamic content). 

## **Schema:** 

Click **Generate from sample** 

Paste the same JSON: 

## JSON 

{ "name": "Onkar", "city": "Pune", "age": 25 } 

Show more lines 

Power Automate creates schema automatically. 

## **Output After Parse JSON** 

Now Power Automate gives you **dynamic fields** : 

- **name** 

- **city** 

- **age** 

You can directly use them anywhere. 

Example: 

- In email → "Hello @{body('Parse_JSON')?['name']}" 

- In Dataverse → map **name** field 

- In Condition → age > 18 

Difference between item() and items () 

1. **item () = current row inside a loop Used inside a loop** 

This refers to the **current record/object inside actions like** : 

   - **Apply to each** 

   - **Select** 

   - **Filter array** 

   - **Compose inside a loop** 

2. **items() = item from a specific scope/loop name** Normally used when: 

- You need the **value of the entire trigger body** 

- You need the **object of an outer loop from inside an inner loop** 

- You need to reference **another loop's item** 

Difference between body and item 

## **1. body** 

body = **the entire output** of an action. 

When you run any action (List rows, Get row, HTTP request), Power Automate stores the full JSON response under: 

body('ActionName') 

This contains **all properties returned** by that action, including metadata, paging info, count, and the actual data. 

Example: 

body('List_rows') 

This returns the whole JSON object: 

JSON 

{ "@odata.context": "...", "value": [ ... ], "@odata.nextLink": "...", "total": 25 } 

Show more lines 

**🔵 2. value** 

value = **the actual list of records** inside the body. 

Most Dataverse **List rows** or **HTTP GET** responses include an array named **value** containing the rows. 

So: 

body('List_rows')?['value'] 

This returns only: 

JSON 

[ { record1 fields… }, { record2 fields… }, ... ] Show more lines 

This is what you use inside: 

   - **Apply to each** 

   - **Filter array** 

   - **Select** 

- **🔵 Example: Dataverse List Rows (Documented Behavior)** 

Microsoft Learn confirms that OData responses return table rows inside a **value array** , not directly in the body. 

<u>[powerplatf...mspace.com]</u> 

So: 

- body() → entire JSON, including metadata 

- value → only the records array 

## **🔵 Simple analogy** 

## **Term Meaning** 

**body** The whole box 

**value** The items _inside_ the box 

## Connection And Connection Reference 

02 June 2025 16:51 



<!-- Start of picture text -->
Feature Inside a Solution Outside a Solution<br>Connection You still use a connection (e.g., to Outlook, You use a direct connection<br>SharePoint, etc.), but it is wrapped in a tied to your user account.<br>connection reference so it can be reused<br>and managed across environments.<br>Connection Reference Required. It acts as a pointer to the actual Not used. The flow or app<br>connection and is used in flows, apps, and directly uses the connection.<br>other components within a solution.<br><!-- End of picture text -->

Inside a solution: You use Connection References (which point to actual Connections) 

Outside a solution: You use Connections directly (no reference layer). 

- A **Connection** is user/environment specific. 

- A **Connection Reference** is a **placeholder** inside the solution that points to a connection **at runtime** . 

## **What Is a Connection Reference? (Very Important)** 

A **Connection Reference** is a _pointer_ to a connection used inside a **Solution** . 

It is required for: ✔ Moving solutions from Dev → Test → Prod 

✔ ALM (Application Lifecycle Management) 

When importing a solution, you only map: 

- Same connection reference 

   - → to a new connection in that environment 

## **What a Connection Contains** 

A Connection contains: 

|**Item**|**Meaning**|
|---|---|
|**Connector**|Which system (Dataverse,<br>SharePoint, API)|
|**Credentials**|Username/password/API key|
|**Token**|Used for authentication|
|**Permission**<br>**s**|What the flow can do|
|**Owner**|Who created the connection|



- Cannot add the connection reference for this types of actions - 



<!-- Start of picture text -->
Action Type Examples<br>Control actions Condition, Switch, Scope, Apply to each<br>Data operations Compose, Select, Join, Filter array<br>Variable actions Initialize variable, Set variable<br>Built-in expressions utcNow(), addDays(), if (), etc.<br>Notifications Send me a mobile notification<br>Approvals Start and wait for an approval<br>Environment actions HTTP with Azure AD (if manually configured)<br><!-- End of picture text -->

## **Authentication Types in Power Automate** 

   - **OAuth Authentication** 

   - **Purpose** : Used for **single-user** scenarios. 

   - **Mechanism** : Authenticates using the **user's credentials** . 

   - **Behavior** : The flow runs under the identity of the user who created or is assigned to it. 

   - **Use Case** : Ideal for flows that perform actions on behalf of a specific user. 

   - ✅ _Example_ : A flow that sends emails from a user's Outlook account or updates records in Dataverse using the user's permissions. 

2.   Service Principal Authentication 

   - **Purpose** : Used for **unattended or background flows** . 

   - **Mechanism** : Authenticates using an **Azure AD app registration** (Client ID + Secret). 

   - **Behavior** : The flow runs using the **Service Principal** , not a user account. 

- **Use Case** : Ideal for server-to-server communication or automation without user interaction. 

✅ _Example_ : Your organization wants to automate the creation of invoice records in Dataverse whenever a new order is placed in an external ERP system. The flow runs securely in the background using a Service Principal. 

- **Client Certificate Authentication** 

- **Purpose** : Used for **high-security integrations** , especially with external systems. 

- **Mechanism** : Authenticates using a **digital certificate** instead of a password or secret. 

- **Behavior** : Ensures secure, passwordless authentication that meets MFA requirements. 

- **Use Case** : Ideal for secure API calls, especially in regulated environments. 

✅ _Example_ : A Power Automate flow sends data to a government tax portal via a secure API. The portal requires client certificate authentication to ensure compliance and security. You obtain a certificate from the government authority and use it in the flow. 

Retry Policy 

25 August 2025 

11:00 

Whenever we are creating a flow, we might have encountered that a connector keeps sporadically failing due to some request issues or server-side errors in which the server fails to fulfil an apparently valid request. We can fortunately tackle these issues by setting up the retry policy for the connector. A retry policy applies to intermittent failures, characterized as HTTP status codes 408, 429, and 5xx, in addition to any connectivity exceptions. The default is an exponential interval policy set to retry 4 times. It is a good practice to set a retry policy for sending http requests and for Create, Update, Delete actions for <u>Dataverse or any other service like SharePoint or SQL.</u> 

A retry policy automatically re-attempts a failed action based on a defined strategy. This helps improve the reliability of your flows without manual intervention. 

|**Error Code**|**Description**|
|---|---|
|408|Request Timeout|
|429|Too many requests|
|5xx|500 – Internal Server Error|
||503 – Service Unavailable|
||522 – Connection timed<br>out, etc.|
|**Retry Policy**|**Description**|
|Default|The default is an exponential interval policy set to retry 4<br>times.|
|None|Do not retry if failed.|
|Fixed Interval|Count - Number of times to retry<br>Interval - Time between retries.|
|Exponential Interval|Count - Number of times to retry<br>Interval - Time between retries|
||Minimum and Maximum Interval - the retry will happen<br>exponentially (Increase or decrease) between the specified<br>intervals.|
|What is exponential int|erval|
|Exponential Backoff Ex|f plained|
|The delay between retr|ies increases exponentially. For example:|



Retry 1: Wait 5 seconds Retry 2: Wait 10 seconds 

Retry 3: Wait 20 seconds 

Retry 4: Wait 40 seconds 

Retry 5: Wait 80 seconds 

This pattern helps reduce the load on the failing service and increases the chance of success. 

When to use the retry policy ----> 

Using Connectors Prone to Throttling 

Services like SharePoint, Outlook, or SQL may throttle requests if limits are exceeded. Retry can help wait and reattempt after a short delay. 

Network-Dependent Actions 

HTTP requests, cloud storage access, or any internet-based service may fail due to network issues. 

Retry ensures resilience against such transient failures. 

Long-Running or Delayed Responses 

If a service takes longer than expected to respond, retry can help avoid premature failure. 

E.g -- 

Fixed interval 

1. Count: 3 

Interval: 30 seconds → Retries at 30s, 60s, 90s 

2. Exponential interval 

Count: 4 

Interval: 5 seconds 

→ Retries at 5s, 10s, 20s, 40s 



<!-- Start of picture text -->
4 Comparison Table<br>Feature Fixed Retry Policy Exponential Retry Policy<br>Retry Interval Constant Increases exponentially<br>Best For Predictable recovery times _ Rate limits, transient errors<br>Risk of Overloading API Higher Lower<br>Configuration Simplicity Simple Slightly more complex<br><!-- End of picture text -->

Refer this - 

<u>https://imperiumdynamics.com/blog/Power-Automate-Retry-and-Timeout-Policy.html</u> 

Concurrency Control 25 August 2025 12:22 

Concurrency control in Power Automate refers to the mechanism that allows multiple runs or loops of a Flow to run at the same time. 

Refer this - 

<u>https://www.beringer.net/beringerblog/advantages-of-concurrency-control-in-powerautomate/</u> 

<u>https://manueltgomes.com/microsoft/what-is-concurrency-control/</u> 

## **What is Concurrency Control in Power Automate (for Dynamics 365 CRM)?** 

**Concurrency Control** in Power Automate is used to **control how many flow runs execute in parallel** for a trigger or loop. 

## **🔵 Why It Is Used in Dynamics 365 CRM?** 

In CRM, multiple users can update the same record at the same time. 

Without concurrency control: 

- Multiple flow runs may trigger **simultaneously** 

- They may try to update the **same CRM record** 

- This can cause: ✔ Duplicate updates 

   - ✔ Wrong BPF stage movement 

   - ✔ Race conditions 

   - ✔ Data inconsistency 

Concurrency control prevents this. 

## **🔵 What It Does?** 

## **✔ 1. Prevents parallel execution** 

You can set: 

- **Degree of Parallelism = 1** → Only **one run** at a time (FIFO queue) 

This is the most common setting for CRM. 

## **✔ 2. Ensures correct data updates** 

When updating: 

- Opportunities 

- Cases 

- Work Orders 

- BPF stages 

You avoid conflicts. 

## **✔ 3. Avoids race conditions** 

Two flows updating the same field → only one runs at a time. 

## **🔵 Where Is It Used?** 

## **1. Trigger Level Concurrency Control** 

Used when: 

- Flow triggers multiple times on the same record 

You set: 

- **Turn on concurrency** → OFF 

   - or 

- **Set parallelism = 1** 

## **2. Within Loops (Apply to Each)** 

Prevent loops from running in parallel when updating multiple CRM records. 

## ⭐ **Short Interview Answer** 

“Concurrency control in Power Automate ensures flows do not run in parallel. We use it in Dynamics 365 CRM to avoid race conditions, prevent multiple simultaneous updates on the same record, and maintain data consistency—especially for triggers and loops. Setting concurrency to 1 guarantees sequential, safe execution.” 

Empty vs Equals 

26 August 2025 

17:50 



<!-- Start of picture text -->
@ Summary Table<br>Function Checks For Returns True If... Common Use<br>equals() Value equality Both values are exactly Comparisons<br>the same<br>empty() Null or empty values Value is null, blank, or Validations<br>empty<br><!-- End of picture text -->

Use equals() function for direct handling of dynamic values and empty() for initialized string variables as PA converts the null string variables into "". 

Refer this - 

<u>https://community.dynamics.com/blogs/post/?postid=a17b738a-142b-435f-8b913d2ba682d841</u> 

Fetch Expression 

24 September 2025 

18:24 

length(body('Get_a_row_by_ID')) vs length(outputs('List_rows')?['body/value']) 

- Get_a_row_by_ID - Return the single object 

- List_rows - Return the array of object (rows) 

-length(body('Get_a_row_by_ID')) -  used for single row or object 

- length(outputs('List_rows')?['body/value'] - used for array of objects 

## Looping in power automate 

24 December 2025 

15:21 



<!-- Start of picture text -->
=_<br><!-- End of picture text -->

Many to many relationship fetch xml 

24 December 2025 

18:31 

<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true"> <entity name="nsq_compliance"> 

- <!-- Select base-entity attributes only to allow DISTINCT to work correctly --> 

<attribute name="nsq_complianceid"/> 

<attribute name="nsq_name"/> 

<order attribute="nsq_name" descending="false"/> 

- <!-- INCIDENT TYPE (N:N) --> 

<link-entity name="nsq_compliance_msdyn_incidenttype" 

from="nsq_complianceid" to="nsq_complianceid" 

intersect="true" link-type="outer" visible="false" alias="jit"> 

<filter> 

<condition attribute="msdyn_incidenttypeid" operator="eq" 

value="@{triggerOutputs()?['body/_msdyn_primaryincidenttype_value']}" /> </filter> 

</link-entity> 

<!-- CUSTOMER ASSET (N:N) --> 

<link-entity name="nsq_compliance_msdyn_customerasset" 

from="nsq_complianceid" to="nsq_complianceid" 

intersect="true" link-type="outer" visible="false" alias="jca"> 

<filter> 

<condition attribute="msdyn_customerassetid" operator="eq" 

value="@{triggerOutputs()?['body/_msdyn_customerasset_value']}" /> </filter> 

</link-entity> 

<!-- FUNCTIONAL LOCATION (N:N) --> 

<link-entity name="nsq_compliance_msdyn_functionallocation" 

from="nsq_complianceid" to="nsq_complianceid" 

intersect="true" link-type="outer" visible="false" alias="jfl"> 

<filter> 

<condition attribute="msdyn_functionallocationid" operator="eq" 

value="@{triggerOutputs()?['body/_msdyn_functionallocation_value']}" /> </filter> 

</link-entity> 

<!-- Require that at least one of the three links exists (exclude unlinked compliances) --> 

<filter type="or"> 

<condition entityname="jit" attribute="msdyn_incidenttypeid" operator="not-null"/> <condition entityname="jca" attribute="msdyn_customerassetid" operator="notnull"/> 

<condition entityname="jfl" attribute="msdyn_functionallocationid" operator="notnull"/> </filter> </entity> </fetch> 

Data operations 

11 February 2026 10:52 

1. Filter rows based on the lookup value => 

_msdyn_workorder_value eq  @{triggerBody()?['_msdyn_workordertype_value']} 

Creating the URL for record navigation 

11 February 2026 18:53 

To create the url required parameters are 

1. Environment url - 

Option 1 - 

1. Get the dynamic url of the environment 

Whenever, we use Get Record action for any entity, you might have noticed one of the fields is ODate Id which actually stores the oData record URL of respective entity. We then parse this URL, to retrieve our tenant name. 

- uriHost(outputs('Get_a_record')?['body/@odata']?['id']) 

- This will fetch us null or empty output. There is a minor tweak to above expression: 

- uriHost(outputs('Get_a_record')?['body/@odata.id']) 

## Option 2 - 

   1. Environment variable 

   2. Appid - 

- Option1 - 

1. Use the environment variable 

## Option 2 - 

1. Retrieve appid using List Records action to query on Model Driven App entity 

2. 



In the filter, enter the unique name of your app and the attribute app moduleid fetches you the GUID of app. Remember to enter top count to 1 thereby fetching only one record 

3. Page Type - 

'&pagetype=entityrecord&etn=entityname 

4. Retrieve the account entity GUID Dynamically 

- &id=entity id 

Result - 



<!-- Start of picture text -->
Compose @ te<br>“hans nttosv/ RA uriHost(..) x /main.aspx2eppid= ll AppModuleld x<br>enanelype=crayrecoraexie acorn Account x<br>Add dynamic content Kill<br><!-- End of picture text -->

Refer -MS POWER AUTOMATE/FLOW: HOW TO CONSTRUCT DYNAMIC <u>RECORD URL AND SEND AN EMAIL FROM DYNAMICS 365/CDS</u> 

## Example concat 



<!-- Start of picture text -->
concat(<br>  '<a href="',<br>  'https://',<br>  uriHost(outputs('Get_a_row_by_ID')?['body/@odata.id'])<br>,<br>  '/main.aspx?appid=',<br>  first(outputs('List_rows')?['body/value'])?<br>['appmoduleid'],<br>  '&pagetype=entityrecord&etn=account&id=',<br><!-- End of picture text -->

outputs('Get_a_row_by_ID')?['body/accountid'], '">Click here</a>' 

) 



<!-- Start of picture text -->
a<br>[——— o<br>ve<br>‘Select - CRM Products 2 Qi<br>Paes —<br>oe<br>[we | ee @<br>ese<br>[oems<br>[oma=<br>ee .<br>co = i|<br><!-- End of picture text -->

Power Automate Scenarios I have Worked On 

**1.Business events and workflow approvals** 

Reference Link - 

<u><mark>https://learn.microsoft.com/en-us/dynamics365/f</mark></u> i <u><mark>n-ops-core/dev-itpro/businessevents/how-to/how-to-workf</mark></u> l <u><mark>ow</mark></u> 

