[ROLE] – [STEP] – [WHAT BROKE] – [EXPECTED]
**EXAMPLE**
Contractor – Step 3 – Crashes on yearsExperience null – Should allow empty
Handyman – Review – Skills missing – Should reflect selected skills
Customer – Completion – Redirects to wrong dashboard – Should go to customer home

## Issue 1: 
**Customer Path**
All fields accepted and registration works. This registration does need a face pic for Contractor/ Handyman recognition and safety. Upon completion, address does not move to customer dashboard. Warning banner at the top of the dashboard that says "Add your address" you'll need an address to request services. When attempting to place address in profile, and hitting "Save Changes", An "Error" confirmation box appears and does not indicate the actual error.

AXIOS ERROR  Failed to save address: [AxiosError: Request failed with status code 422] 

Call Stack
  settle (node_modules\axios\dist\esm\axios.js)
  onloadend (node_modules\axios\dist\esm\axios.js)
  invoke (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  dispatch (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  INTERNAL_DISPATCH_METHOD_KEY (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  dispatchTrustedEvent (node_modules\react-native\src\private\webapis\dom\events\internals\EventTargetInternals.js)
  setReadyState (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  __didCompleteResponse (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  apply (<native>)
  RCTNetworking.addListener$argument_1 (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  apply (<native>)
  emit (node_modules\react-native\Libraries\vendor\emitter\EventEmitter.js)
  apply (<native>)
  <anonymous> (node_modules\@babel\runtime\helpers\superPropGet.js)
  RCTDeviceEventEmitterImpl#emit (node_modules\react-native\Libraries\EventEmitter\RCTDeviceEventEmitter.js)
  Axios$1#request (node_modules\axios\dist\esm\axios.js)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)
 LOG  Saving address: {"city": "Washington", "is_default": true, "state": "DC", "street": "1518 9th St NW", "zip_code": "20001"}

 ## Issue 2:
 When Registering Handyman, and customer has already registered, Since there is two password fields and the email is present, the registration should log the customer in and redirect them to the dashboard after a confirmation box that says, "You already registered. Welcome back." Not throw up an error box and leave them in registration. At a minimum, it should autmatically take them out of registration and put them back at either the main screen or recognise that their email and password actually match and send them to their dashboard with a "Welcome back "{First_Name}" Confirmation box. Also, if emails do not provide a proper format like the Error below, the confirmation box should specify the error and tell the individual the issue. 
 
 ERROR [Step1] Error response: {"detail": [{"ctx": [Object], "input": "derek.howell.phl@example", "loc": [Array], "msg": "value is not a valid email address: The part after 
the @-sign is not valid. It should have a period.", "type": "value_error"}]}

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  onSubmit (app\auth\handyman\register-step1.tsx)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)

After fixing the email issue these faults were generated after and indicate there is some confusion with token acceptance:
 ERROR  [Step1] Error response: {"detail": [{"ctx": [Object], "input": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTBlNDc1OTctYTMwNC00M2Y0LTljYzQtYmViYjY5OGUxMWJkIiwiZW1haWwiOiJkZXJlay5ob3dlbGwucGhsQGV4YW1wbGUuY29tIiwicm9sZSI6ImhhbmR5bWFuIiwiZXhwIjoxNzY1OTAzMzU4LCJ0eXBlIjoiYWNjZXNzIn0.agrbgSOazbKado6l_EhWYGrd-kWkORKPtJKFaU7clnU", "loc": [Array], "msg": "value is not a valid email address: An email address must have an @-sign.", "type": "value_error"}]}

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  onSubmit (app\auth\handyman\register-step1.tsx)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)
 ERROR  [Step1] Error message: Request failed with status code 422

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  onSubmit (app\auth\handyman\register-step1.tsx)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)
 LOG  [Step1] Submitting registration...
 ERROR  [Step1] Registration error: [AxiosError: Request failed with status code 400] 

Call Stack
  settle (node_modules\axios\dist\esm\axios.js)
  onloadend (node_modules\axios\dist\esm\axios.js)
  invoke (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  dispatch (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  INTERNAL_DISPATCH_METHOD_KEY (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
  dispatchTrustedEvent (node_modules\react-native\src\private\webapis\dom\events\internals\EventTargetInternals.js)
  setReadyState (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  __didCompleteResponse (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  apply (<native>)
  RCTNetworking.addListener$argument_1 (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
  apply (<native>)
  emit (node_modules\react-native\Libraries\vendor\emitter\EventEmitter.js)
  apply (<native>)
  <anonymous> (node_modules\@babel\runtime\helpers\superPropGet.js)
  RCTDeviceEventEmitterImpl#emit (node_modules\react-native\Libraries\EventEmitter\RCTDeviceEventEmitter.js)
  Axios$1#request (node_modules\axios\dist\esm\axios.js)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)
 ERROR  [Step1] Error response: {"detail": "Email already registered. Please try logging in or use Forgot Password."} 

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  onSubmit (app\auth\handyman\register-step1.tsx)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)
 ERROR  [Step1] Error message: Request failed with status code 400

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  onSubmit (app\auth\handyman\register-step1.tsx)
  throw (<native>)
  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
  tryCallOne (address at (InternalBytecode.js:1:1180)
  anonymous (address at (InternalBytecode.js:1:1874)

  ## Issue 3
  
  When registering a Contractor, same issue with address. Address does not move to Dashboard, and upon acceptance of Review, it returns to step 3. I think we need to remove the address verification process at this time and make this address issue not a requirement that holds us up but is moved to a further update when it actually works. I think we are going too complex instead of building something that works and is stable.  

  iOS Bundled 121ms node_modules\expo-router\entry.js (1 module)
 LOG  Waiting for auth hydration...
 LOG  Checking auth state...
 LOG  Found stored token: false
 LOG  Auth hydration complete
 LOG  Auth hydrated - isAuthenticated: false role: undefined
 LOG  Not authenticated - navigating to welcome
 LOG  === CONTRACTOR REGISTRATION PAYLOAD ===
 LOG  {
  "email": "tony.vega.milford@example.com",
  "password": "Test1234!",
  "firstName": "Anthony",
  "lastName": "Vega",
  "phone": "(302) 555-9097",
  "role": "contractor",
  "marketingOptIn": false,
  "businessName": "Vega Home Services"
}
 LOG  =======================================
 LOG  Starting registration process...
 LOG  Registration API call successful
 LOG  Tokens stored securely
 LOG  Token set in API client
 LOG  Fetching user data...
 LOG  Raw user data from API: {"address_verification_deadline": "2025-12-26T16:15:42.575586", "address_verification_started_at": "2025-12-16T16:15:42.575586", "address_verification_status": "pending", "addresses": [], "available_hours": null, "business_name": "Vega Home Services", "created_at": "2025-12-16T16:15:42.575608", "customer_notes": null, "documents": null, "email": "tony.vega.milford@example.com", "first_name": "Anthony", "has_llc": false, "hourly_rate": null, "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "insurance_expiry": null, "insurance_info": null, "insurance_policy_number": null, "is_active": true, "is_insured": false, "is_licensed": false, "last_name": "Vega", "license_expiry": null, "license_info": null, "license_number": null, "license_state": null, "llc_formation_date": null, "marketing_opt_in": false, "phone": "(302) 555-9097", "portfolio_photos": [], "profile_photo": null, "provider_completeness": 0, "provider_intent": "not_hiring", "provider_status": "draft", "provider_type": "individual", "registration_completed_date": null, "registration_status": "ACTIVE", "role": "contractor", "service_areas": [], "skills": [], "specialties": [], "tags": [], "updated_at": "2025-12-16T16:15:42.575610", "upgrade_to_technician_date": null, "verification": null, "years_experience": null}
 LOG  Transformed user data (role-safe): {"addressVerificationDeadline": "2025-12-26T16:15:42.575586", "addressVerificationStartedAt": "2025-12-16T16:15:42.575586", "addressVerificationStatus": "pending", "addresses": [], "businessName": "Vega Home Services", "documents": undefined, "email": "tony.vega.milford@example.com", "firstName": "Anthony", "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "isActive": true, "lastName": "Vega", "phone": "(302) 555-9097", "portfolioPhotos": [], "profilePhoto": null, "providerCompleteness": 0, "providerIntent": "not_hiring", "providerStatus": "draft", "providerType": "individual", "role": "contractor", "serviceAreas": [], "skills": [], "tier": null, "yearsExperience": null}
 LOG  User set in context - isAuthenticated should now be true
 LOG  User data refreshed successfully
 WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
 WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
 WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
 WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
 LOG  Fetching user data...
 LOG  Raw user data from API: {"address_verification_deadline": "2025-12-26T16:15:42.575586", "address_verification_started_at": "2025-12-16T16:15:42.575586", "address_verification_status": "pending", "addresses": [], "available_hours": null, "business_name": "Vega Home Services", "created_at": "2025-12-16T16:15:42.575608", "customer_notes": null, "documents": {"business_license": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "first_name": "Anthony", "has_llc": false, "hourly_rate": null, "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "insurance_expiry": null, "insurance_info": null, "insurance_policy_number": null, "is_active": true, "is_insured": false, "is_licensed": false, "last_name": "Vega", "license_expiry": null, "license_info": null, "license_number": null, "license_state": null, "llc_formation_date": null, "marketing_opt_in": false, "phone": "(302) 555-9097", "portfolio_photos": [], "profile_photo": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "provider_completeness": 0, "provider_intent": "not_hiring", "provider_status": "draft", "provider_type": "individual", "registration_completed_date": null, "registration_status": "ACTIVE", "role": "contractor", "service_areas": [], "skills": [], "specialties": [], "tags": [], "updated_at": "2025-12-16T16:16:37.664113", "upgrade_to_technician_date": null, "verification": null, "years_experience": null}
 LOG  Transformed user data (role-safe): {"addressVerificationDeadline": "2025-12-26T16:15:42.575586", "addressVerificationStartedAt": "2025-12-16T16:15:42.575586", "addressVerificationStatus": "pending", "addresses": [], "businessName": "Vega Home Services", "documents": {"businessLicense": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "firstName": "Anthony", "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "isActive": true, "lastName": "Vega", "phone": "(302) 555-9097", "portfolioPhotos": [], "profilePhoto": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "providerCompleteness": 0, "providerIntent": "not_hiring", "providerStatus": "draft", "providerType": "individual", "role": "contractor", "serviceAreas": [], "skills": [], "tier": null, "yearsExperience": null}
 LOG  User set in context - isAuthenticated should now be true
 LOG  ✅ Profile saved successfully
 LOG  Fetching user data...
 LOG  Raw user data from API: {"address_verification_deadline": "2025-12-26T16:15:42.575586", "address_verification_started_at": "2025-12-16T16:15:42.575586", "address_verification_status": "pending", "addresses": [], "available_hours": null, "business_name": "Vega Home Services", "created_at": "2025-12-16T16:15:42.575608", "customer_notes": null, "documents": {"business_license": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "first_name": "Anthony", "has_llc": false, "hourly_rate": null, "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "insurance_expiry": null, "insurance_info": null, "insurance_policy_number": null, "is_active": true, "is_insured": false, "is_licensed": false, "last_name": "Vega", "license_expiry": null, "license_info": null, "license_number": null, "license_state": null, "llc_formation_date": null, "marketing_opt_in": false, "phone": "(302) 555-9097", "portfolio_photos": [], "profile_photo": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "provider_completeness": 0, "provider_intent": "hiring", "provider_status": "draft", "provider_type": "individual", "registration_completed_date": null, "registration_status": "ACTIVE", "role": "contractor", "service_areas": [], "skills": ["Plumbing", "Carpentry", "Windows & Doors", "Custom cabinetry"], "specialties": ["Residential", "Commercial", "New Construction", "Repair & Maintenance", "Remodeling"], "tags": [], "updated_at": "2025-12-16T16:17:53.779358", "upgrade_to_technician_date": null, "verification": null, "years_experience": 15}
 LOG  Transformed user data (role-safe): {"addressVerificationDeadline": "2025-12-26T16:15:42.575586", "addressVerificationStartedAt": "2025-12-16T16:15:42.575586", "addressVerificationStatus": "pending", "addresses": [], "businessName": "Vega Home Services", "documents": {"businessLicense": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "firstName": "Anthony", "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "isActive": true, "lastName": "Vega", "phone": "(302) 555-9097", "portfolioPhotos": [], "profilePhoto": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "providerCompleteness": 0, "providerIntent": "hiring", "providerStatus": "draft", "providerType": "individual", "role": "contractor", "serviceAreas": [], "skills": ["Plumbing", "Carpentry", "Windows & Doors", "Custom cabinetry"], "tier": null, "yearsExperience": 15}
 LOG  User set in context - isAuthenticated should now be true
 WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
 LOG  Fetching user data...
 LOG  Raw user data from API: {"address_verification_deadline": "2025-12-26T16:15:42.575586", "address_verification_started_at": "2025-12-16T16:15:42.575586", "address_verification_status": "pending", "addresses": [], "available_hours": null, "business_name": "Vega Home Services", "created_at": "2025-12-16T16:15:42.575608", "customer_notes": null, "documents": {"business_license": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "first_name": "Anthony", "has_llc": false, "hourly_rate": null, "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "insurance_expiry": null, "insurance_info": null, "insurance_policy_number": null, "is_active": true, "is_insured": false, "is_licensed": false, "last_name": "Vega", "license_expiry": null, "license_info": null, "license_number": null, "license_state": null, "llc_formation_date": null, "marketing_opt_in": false, "phone": "(302) 555-9097", "portfolio_photos": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/portfolio/portfolio_5e2d8a18.jpg"], "profile_photo": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "provider_completeness": 0, "provider_intent": "hiring", "provider_status": "draft", "provider_type": "individual", "registration_completed_date": null, "registration_status": "ACTIVE", "role": "contractor", "service_areas": [], "skills": ["Plumbing", "Carpentry", "Windows & Doors", "Custom cabinetry"], "specialties": ["Residential", 
"Commercial", "New Construction", "Repair & Maintenance", "Remodeling"], "tags": [], "updated_at": "2025-12-16T16:18:01.616876", "upgrade_to_technician_date": null, "verification": null, "years_experience": 15}
 LOG  Transformed user data (role-safe): {"addressVerificationDeadline": "2025-12-26T16:15:42.575586", "addressVerificationStartedAt": "2025-12-16T16:15:42.575586", "addressVerificationStatus": "pending", "addresses": [], "businessName": "Vega Home Services", "documents": {"businessLicense": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/business_license_7c352419.jpg"], "insurance": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/insurance_a87ea170.jpg", "license": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/license_2e249a95.jpg"}, "email": "tony.vega.milford@example.com", "firstName": "Anthony", "id": "16c4838f-4d14-4315-9b5d-02043849c19d", "isActive": true, "lastName": "Vega", "phone": "(302) 555-9097", "portfolioPhotos": ["https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/portfolio/portfolio_5e2d8a18.jpg"], "profilePhoto": "https://photos.us-iad-10.linodeobjects.com/contractors/16c4838f-4d14-4315-9b5d-02043849c19d/profile/profile_ec417c0c.jpg", "providerCompleteness": 0, "providerIntent": "hiring", "providerStatus": "draft", "providerType": "individual", "role": "contractor", "serviceAreas": [], "skills": ["Plumbing", "Carpentry", "Windows & Doors", "Custom cabinetry"], "tier": null, "yearsExperience": 15}
 LOG  User set in context - isAuthenticated should now be true
 LOG  Registration confirmed - redirecting to dashboard
 WARN  Address not verified — compliance countdown active

 User can not continue to test until these issues are resolved.