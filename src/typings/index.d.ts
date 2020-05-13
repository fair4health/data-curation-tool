declare namespace fhir {
  type id = string;
  type uri = string;
  type integer = number;
  type decimal = number;
  type base64Binary = string;
  type instant = string;
  type date = string;
  type dateTime = string;
  type xhtml = string;
  type time = string;
  type code = string;
  type oid = string;
  type unsignedInt = number;
  type positiveInt = number;
  type markdown = string;
  interface ResourceBase {
    id?: id;
    meta?: Meta;
    isRefOnly?: boolean;
    refDisplay?: string;
    implicitRules?: uri;
    language?: code;
    resourceType?: code;
  }
  interface Element {
    id?: id;
    extension?: Extension[];
  }
  interface Identifier extends Element {
    use?: code;
    type?: CodeableConcept;
    system?: uri;
    value?: string;
    period?: Period;
    assigner?: Reference;
  }
  interface Narrative extends Element {
    status: code;
    div: xhtml;
  }
  interface CodeableConcept extends Element {
    coding?: Coding[];
    text?: string;
  }
  interface Period extends Element {
    start?: dateTime;
    end?: dateTime;
  }
  interface UsageContext extends Element {
    code: Coding;
    valueCodeableConcept?: CodeableConcept;
    valueQuantity?: Quantity;
    valueRange?: Range;
  }
  interface Reference extends Element {
    reference?: string;
    identifier?: Identifier;
    display?: string;
  }
  interface Coding extends Element {
    system?: uri;
    version?: string;
    code?: code;
    display?: string;
    userSelected?: boolean;
  }
  interface Quantity extends Element {
    value?: decimal;
    comparator?: code;
    unit?: string;
    system?: uri;
    code?: code;
  }
  interface Meta extends Element {
    versionId?: id;
    lastUpdated?: instant;
    profile?: uri[];
    security?: Coding[];
    tag?: Coding[];
  }
  interface Extension extends Element {
    url: uri;
    valueBase64Binary?: base64Binary;
    valueBoolean?: boolean;
    valueCode?: code;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueDecimal?: decimal;
    valueId?: id;
    valueInstant?: instant;
    valueInteger?: integer;
    valueMarkdown?: markdown;
    valueOid?: oid;
    valuePositiveInt?: positiveInt;
    valueString?: string;
    valueTime?: time;
    valueUnsignedInt?: unsignedInt;
    valueUri?: uri;
    valueAddress?: Address;
    valueAge?: Age;
    valueAnnotation?: Annotation;
    valueAttachment?: Attachment;
    valueCodeableConcept?: CodeableConcept;
    valueCoding?: Coding;
    valueContactPoint?: ContactPoint;
    valueCount?: Count;
    valueDistance?: Distance;
    valueDuration?: Duration;
    valueHumanName?: HumanName;
    valueIdentifier?: Identifier;
    valueMoney?: Money;
    valuePeriod?: Period;
    valueQuantity?: Quantity;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueReference?: Reference;
    valueSampledData?: SampledData;
    valueSignature?: Signature;
    valueTiming?: Timing;
    valueMeta?: Meta;
  }
  interface DomainResource extends ResourceBase {
    text?: Narrative;
    contained?: Resource[];
    extension?: Extension[];
    modifierExtension?: Extension[];
  }
  interface Account extends DomainResource {
    identifier?: Identifier[];
    name?: string;
    type?: CodeableConcept;
    status?: code;
    active?: Period;
    currency?: Coding;
    balance?: Money;
    coverage?: Reference[];
    coveragePeriod?: Period;
    subject?: Reference;
    owner?: Reference;
    description?: string;
    guarantor?: AccountGuarantor[];
  }
  interface AccountGuarantor extends Element {
    party: Reference;
    onHold?: boolean;
    period?: Period;
  }
  interface ActivityDefinition extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    usage?: string;
    approvalDate?: date;
    lastReviewDate?: date;
    effectivePeriod?: Period;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    topic?: CodeableConcept[];
    contributor?: Contributor[];
    publisher?: string;
    contact?: ContactDetail[];
    copyright?: markdown;
    relatedArtifact?: RelatedArtifact[];
    library?: Reference[];
    category?: code;
    code?: CodeableConcept;
    timingCodeableConcept?: CodeableConcept;
    timingTiming?: Timing;
    location?: Reference;
    participantType?: code[];
    productReference?: Reference;
    productCodeableConcept?: CodeableConcept;
    quantity?: Quantity;
    dosageInstruction?: DosageInstruction[];
    bodySite?: CodeableConcept[];
    transform?: Reference;
    dynamicValue?: ActivityDefinitionDynamicValue[];
  }
  interface ActivityDefinitionDynamicValue extends Element {
    description?: string;
    path?: string;
    language?: string;
    expression?: string;
  }
  interface AllergyIntolerance extends DomainResource {
    identifier?: Identifier[];
    clinicalStatus?: code;
    verificationStatus: code;
    type?: code;
    category?: code[];
    criticality?: code;
    code?: CodeableConcept;
    patient: Reference;
    onsetDateTime?: dateTime;
    onsetAge?: Age;
    onsetPeriod?: Period;
    onsetRange?: Range;
    onsetString?: string;
    assertedDate?: dateTime;
    recorder?: Reference;
    asserter?: Reference;
    lastOccurrence?: dateTime;
    note?: Annotation[];
    reaction?: AllergyIntoleranceReaction[];
  }
  interface AllergyIntoleranceReaction extends Element {
    substance?: CodeableConcept;
    certainty?: code;
    manifestation: CodeableConcept[];
    description?: string;
    onset?: dateTime;
    severity?: code;
    exposureRoute?: CodeableConcept;
    note?: Annotation[];
  }
  interface Appointment extends DomainResource {
    identifier?: Identifier[];
    status: code;
    serviceCategory?: CodeableConcept;
    serviceType?: CodeableConcept[];
    specialty?: CodeableConcept[];
    appointmentType?: CodeableConcept;
    reason?: CodeableConcept[];
    priority?: unsignedInt;
    description?: string;
    start?: instant;
    end?: instant;
    minutesDuration?: positiveInt;
    slot?: Reference[];
    created?: dateTime;
    comment?: string;
    incomingReferral?: Reference[];
    participant: AppointmentParticipant[];
    requestedPeriod?: Period[];
  }
  interface AppointmentParticipant extends Element {
    type?: CodeableConcept[];
    actor?: Reference;
    required?: code;
    status: code;
  }
  interface AppointmentResponse extends DomainResource {
    identifier?: Identifier[];
    appointment: Reference;
    start?: instant;
    end?: instant;
    participantType?: CodeableConcept[];
    actor?: Reference;
    participantStatus: code;
    comment?: string;
  }
  interface AuditEvent extends DomainResource {
    type: Coding;
    subtype?: Coding[];
    action?: code;
    recorded: instant;
    outcome?: code;
    outcomeDesc?: string;
    purposeOfEvent?: CodeableConcept[];
    agent: AuditEventAgent[];
    source: AuditEventSource;
    entity?: AuditEventEntity[];
  }
  interface AuditEventAgent extends Element {
    role?: CodeableConcept[];
    reference?: Reference;
    userId?: Identifier;
    altId?: string;
    name?: string;
    requestor: boolean;
    location?: Reference;
    policy?: uri[];
    media?: Coding;
    network?: AuditEventAgentNetwork;
    purposeOfUse?: CodeableConcept[];
  }
  interface AuditEventAgentNetwork extends Element {
    address?: string;
    type?: code;
  }
  interface AuditEventSource extends Element {
    site?: string;
    identifier: Identifier;
    type?: Coding[];
  }
  interface AuditEventEntity extends Element {
    identifier?: Identifier;
    reference?: Reference;
    type?: Coding;
    role?: Coding;
    lifecycle?: Coding;
    securityLabel?: Coding[];
    name?: string;
    description?: string;
    query?: base64Binary;
    detail?: AuditEventEntityDetail[];
  }
  interface AuditEventEntityDetail extends Element {
    type: string;
    value: base64Binary;
  }
  interface Basic extends DomainResource {
    identifier?: Identifier[];
    code: CodeableConcept;
    subject?: Reference;
    created?: date;
    author?: Reference;
  }
  interface Binary extends ResourceBase {
    contentType: code;
    securityContext?: Reference;
    content: base64Binary;
  }
  interface BodySite extends DomainResource {
    patient: Reference;
    identifier?: Identifier[];
    code?: CodeableConcept;
    modifier?: CodeableConcept[];
    description?: string;
    image?: Attachment[];
  }
  interface Bundle extends ResourceBase {
    type: code;
    identifier?: Identifier;
    total?: unsignedInt;
    link?: BundleLink[];
    entry?: BundleEntry[];
    signature?: Signature;
  }
  interface BundleLink extends Element {
    relation: string;
    url: uri;
  }
  interface BundleEntry extends Element {
    link?: BundleLink[];
    fullUrl?: uri;
    resource?: Resource;
    search?: BundleEntrySearch;
    request?: BundleEntryRequest;
    response?: BundleEntryResponse;
  }
  interface BundleEntrySearch extends Element {
    mode?: code;
    score?: decimal;
  }
  interface BundleEntryRequest extends Element {
    method: code;
    url: uri;
    ifNoneMatch?: string;
    ifModifiedSince?: instant;
    ifMatch?: string;
    ifNoneExist?: string;
  }
  interface BundleEntryResponse extends Element {
    status: string;
    location?: uri;
    etag?: string;
    lastModified?: instant;
    outcome?: Resource;
  }
  interface CarePlan extends DomainResource {
    title?: string;
    identifier?: Identifier[];
    status: code;
    category?: CodeableConcept[];
    description?: string;
    subject: Reference;
    context?: Reference;
    period?: Period;
    modified?: dateTime;
    author?: Reference[];
    careTeam?: Reference[];
    addresses?: Reference[];
    supportingInfo?: Reference[];
    definition?: Reference;
    relatedPlan?: CarePlanRelatedPlan[];
    goal?: Reference[];
    activity?: CarePlanActivity[];
    note?: Annotation[];

    replaces?: Reference[];
    intent: code;
  }
  interface CarePlanRelatedPlan extends Element {
    code?: code;
    plan: Reference;
  }
  interface CarePlanActivity extends Element {
    actionResulting?: Reference[];
    outcomeCodeableConcept?: CodeableConcept[];
    outcomeReference?: Reference[];
    progress?: Annotation[];
    reference?: Reference;
    detail?: CarePlanActivityDetail;
  }
  interface CarePlanActivityDetail extends Element {
    category?: CodeableConcept;
    definition?: Reference;
    code?: CodeableConcept;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    goal?: Reference[];
    status: code;
    statusReason?: string;
    prohibited?: boolean;
    scheduledTiming?: Timing;
    scheduledPeriod?: Period;
    scheduledString?: string;
    location?: Reference;
    performer?: Reference[];
    productCodeableConcept?: CodeableConcept;
    productReference?: Reference;
    dailyAmount?: Quantity;
    quantity?: Quantity;
    description?: string;
  }
  interface CareTeam extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    category?: CodeableConcept[];
    name?: string;
    subject?: Reference;
    period?: Period;
    participant?: CareTeamParticipant[];
    managingOrganization?: Reference[];
  }
  interface CareTeamParticipant extends Element {
    role?: CodeableConcept;
    member?: Reference;
    onBehalfOf?: Reference;
    period?: Period;
  }
  interface Claim extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    type?: CodeableConcept;
    subType?: CodeableConcept[];
    use?: code;
    patient?: Reference;
    billablePeriod?: Period;
    created?: dateTime;
    enterer?: Reference;
    insurer?: Reference;
    provider?: Reference;
    organization?: Reference;
    priority?: CodeableConcept;
    fundsReserve?: CodeableConcept;
    related?: ClaimRelated[];
    prescription?: Reference;
    originalPrescription?: Reference;
    payee?: ClaimPayee;
    referral?: Reference;
    facility?: Reference;
    careTeam?: ClaimCareTeam[];
    information?: ClaimInformation[];
    diagnosis?: ClaimDiagnosis[];
    procedure?: ClaimProcedure[];
    insurance?: ClaimInsurance[];
    accident?: ClaimAccident;
    employmentImpacted?: Period;
    hospitalization?: Period;
    item?: ClaimItem[];
    total?: Money;
  }
  interface ClaimRelated extends Element {
    claim?: Reference;
    relationship?: CodeableConcept;
    reference?: Identifier;
  }
  interface ClaimPayee extends Element {
    type: CodeableConcept;
    resourceType?: Coding;
    party?: Reference;
  }
  interface ClaimCareTeam extends Element {
    sequence: positiveInt;
    provider: Reference;
    responsible?: boolean;
    role?: CodeableConcept;
    qualification?: CodeableConcept;
  }
  interface ClaimInformation extends Element {
    category: CodeableConcept;
    code?: CodeableConcept;
    timingDate?: date;
    timingPeriod?: Period;
    valueString?: string;
    valueQuantity?: Quantity;
    valueAttachment?: Attachment;
    valueReference?: Reference;
    reason?: CodeableConcept;
  }
  interface ClaimDiagnosis extends Element {
    sequence: positiveInt;
    diagnosisCodeableConcept?: CodeableConcept;
    diagnosisReference?: Reference;
    type?: CodeableConcept[];
    packageCode?: CodeableConcept;
  }
  interface ClaimProcedure extends Element {
    sequence: positiveInt;
    date?: dateTime;
    procedureCodeableConcept?: CodeableConcept;
    procedureReference?: Reference;
  }
  interface ClaimInsurance extends Element {
    sequence: positiveInt;
    focal: boolean;
    coverage: Reference;
    businessArrangement?: string;
    preAuthRef?: string[];
    claimResponse?: Reference;
  }
  interface ClaimAccident extends Element {
    date: date;
    type?: CodeableConcept;
    locationAddress?: Address;
    locationReference?: Reference;
  }
  interface ClaimItem extends Element {
    sequence: positiveInt;
    careTeamLinkId?: positiveInt[];
    diagnosisLinkId?: positiveInt[];
    procedureLinkId?: positiveInt[];
    informationLinkId?: positiveInt[];
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    servicedDate?: date;
    servicedPeriod?: Period;
    locationCodeableConcept?: CodeableConcept;
    locationAddress?: Address;
    locationReference?: Reference;
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
    bodySite?: CodeableConcept;
    subSite?: CodeableConcept[];
    detail?: ClaimItemDetail[];
    prosthesis?: ClaimItemProsthesis;
  }
  interface ClaimItemDetail extends Element {
    sequence: positiveInt;
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
    subDetail?: ClaimItemDetailSubDetail[];
  }
  interface ClaimItemDetailSubDetail extends Element {
    sequence: positiveInt;
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
  }
  interface ClaimItemProsthesis extends Element {
    initial?: boolean;
    priorDate?: date;
    priorMaterial?: CodeableConcept;
  }
  interface ClaimResponse extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    created?: dateTime;
    insurer?: Reference;
    requestProvider?: Reference;
    requestOrganization?: Reference;
    request?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    payeeType?: CodeableConcept;
    item?: ClaimResponseItem[];
    addItem?: ClaimResponseAddItem[];
    error?: ClaimResponseError[];
    totalCost?: Money;
    unallocDeductable?: Money;
    totalBenefit?: Money;
    payment?: ClaimResponsePayment;
    reserved?: Coding;
    form?: CodeableConcept;
    note?: ClaimResponseNote[];
    communicationRequest?: Reference[];
    insurance?: ClaimResponseInsurance[];
  }
  interface ClaimResponseItem extends Element {
    sequenceLinkId: positiveInt;
    noteNumber?: positiveInt[];
    adjudication?: ClaimResponseItemAdjudication[];
    detail?: ClaimResponseItemDetail[];
  }
  interface ClaimResponseItemAdjudication extends Element {
    category: CodeableConcept;
    reason?: CodeableConcept;
    amount?: Money;
    value?: decimal;
  }
  interface ClaimResponseItemDetail extends Element {
    sequenceLinkId: positiveInt;
    noteNumber?: positiveInt[];
    adjudication?: ClaimResponseItemAdjudication[];
    subDetail?: ClaimResponseItemDetailSubDetail[];
  }
  interface ClaimResponseItemDetailSubDetail extends Element {
    sequenceLinkId: positiveInt;
    noteNumber?: positiveInt[];
    adjudication?: ClaimResponseItemAdjudication[];
  }
  interface ClaimResponseAddItem extends Element {
    sequenceLinkId?: positiveInt[];
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    fee?: Money;
    noteNumber?: positiveInt[];
    adjudication?: ClaimResponseItemAdjudication[];
    detail?: ClaimResponseAddItemDetail[];
  }
  interface ClaimResponseAddItemDetail extends Element {
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    fee?: Money;
    noteNumber?: positiveInt[];
    adjudication?: ClaimResponseItemAdjudication[];
  }
  interface ClaimResponseError extends Element {
    sequenceLinkId?: positiveInt;
    detailSequenceLinkId?: positiveInt;
    subdetailSequenceLinkId?: positiveInt;
    code: CodeableConcept;
  }
  interface ClaimResponsePayment extends Element {
    type?: CodeableConcept;
    adjustment?: Money;
    adjustmentReason?: CodeableConcept;
    date?: date;
    amount?: Money;
    identifier?: Identifier;
  }
  interface ClaimResponseNote extends Element {
    number?: positiveInt;
    type?: CodeableConcept;
    text?: string;
    language?: CodeableConcept;
  }
  interface ClaimResponseInsurance extends Element {
    sequence: positiveInt;
    focal: boolean;
    coverage: Reference;
    businessArrangement?: string;
    preAuthRef?: string[];
    claimResponse?: Reference;
  }
  interface ClinicalImpression extends DomainResource {
    identifier?: Identifier[];
    status: code;
    code?: CodeableConcept;
    description?: string;
    subject: Reference;
    assessor?: Reference;
    date?: dateTime;
    effectiveDateTime?: dateTime;
    effectivePeriod?: Period;
    context?: Reference;
    previous?: Reference;
    problem?: Reference[];
    investigation?: ClinicalImpressionInvestigation[];
    protocol?: uri[];
    summary?: string;
    finding?: ClinicalImpressionFinding[];
    prognosisCodeableConcept?: CodeableConcept[];
    prognosisReference?: Reference[];
    action?: Reference[];
    note?: Annotation[];
  }
  interface ClinicalImpressionInvestigation extends Element {
    code: CodeableConcept;
    item?: Reference[];
  }
  interface ClinicalImpressionFinding extends Element {
    itemCodeableConcept?: CodeableConcept;
    itemReference?: Reference;
    basis?: string;
  }
  interface CodeSystem extends DomainResource {
    url?: uri;
    identifier?: Identifier;
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    caseSensitive?: boolean;
    valueSet?: uri;
    hierarchyMeaning?: code;
    compositional?: boolean;
    versionNeeded?: boolean;
    content: code;
    count?: unsignedInt;
    filter?: CodeSystemFilter[];
    property?: CodeSystemProperty[];
    concept?: CodeSystemConcept[];
  }
  interface CodeSystemFilter extends Element {
    code: code;
    description?: string;
    operator: code[];
    value: string;
  }
  interface CodeSystemProperty extends Element {
    code: code;
    uri?: uri;
    description?: string;
    type: code;
  }
  interface CodeSystemConcept extends Element {
    code: code;
    display?: string;
    definition?: string;
    designation?: CodeSystemConceptDesignation[];
    property?: CodeSystemConceptProperty[];
    concept?: CodeSystemConcept[];
  }
  interface CodeSystemConceptDesignation extends Element {
    language?: code;
    use?: Coding;
    value: string;
  }
  interface CodeSystemConceptProperty extends Element {
    code: code;
    valueCode?: code;
    valueCoding?: Coding;
    valueString?: string;
    valueInteger?: integer;
    valueBoolean?: boolean;
    valueDateTime?: dateTime;
  }
  interface Communication extends DomainResource {
    identifier?: Identifier[];
    basedOn?: Reference[];
    parent?: Reference[];
    status?: code;
    category?: CodeableConcept[];
    medium?: CodeableConcept[];
    subject?: Reference;
    topic?: Reference[];
    context?: Reference;
    sent?: dateTime;
    received?: dateTime;
    sender?: Reference;
    recipient?: Reference[];
    reason?: CodeableConcept[];
    payload?: CommunicationPayload[];
    note?: Annotation[];
  }
  interface CommunicationPayload extends Element {
    contentString?: string;
    contentAttachment?: Attachment;
    contentReference?: Reference;
  }
  interface CommunicationRequest extends DomainResource {
    identifier?: Identifier[];
    category?: CodeableConcept[];
    sender?: Reference;
    recipient?: Reference[];
    payload?: CommunicationRequestPayload[];
    medium?: CodeableConcept[];
    requester?: Reference;
    status?: code;
    topic?: Reference[];
    context?: Reference;
    occurrenceDateTime?: dateTime;
    occurrencePeriod?: Period;
    authoredOn?: dateTime;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    requestedOn?: dateTime;
    subject?: Reference;
    priority?: CodeableConcept;
    note?: Annotation[];
  }
  interface CommunicationRequestPayload extends Element {
    contentString?: string;
    contentAttachment?: Attachment;
    contentReference?: Reference;
  }
  interface CompartmentDefinition extends DomainResource {
    url: uri;
    name: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    code: code;
    search: boolean;
    resource?: CompartmentDefinitionResource[];
  }
  interface CompartmentDefinitionResource extends Element {
    code: code;
    param?: string[];
    documentation?: string;
  }
  interface Composition extends DomainResource {
    identifier?: Identifier;
    date: dateTime;
    type: CodeableConcept;
    class?: CodeableConcept;
    title: string;
    status: code;
    confidentiality?: code;
    subject: Reference;
    author: Reference[];
    attester?: CompositionAttester[];
    custodian?: Reference;
    event?: CompositionEvent[];
    encounter?: Reference;
    section?: CompositionSection[];
  }
  interface CompositionAttester extends Element {
    mode: code[];
    time?: dateTime;
    party?: Reference;
  }
  interface CompositionEvent extends Element {
    code?: CodeableConcept[];
    period?: Period;
    detail?: Reference[];
  }
  interface CompositionSection extends Element {
    title?: string;
    code?: CodeableConcept;
    text?: Narrative;
    mode?: code;
    orderedBy?: CodeableConcept;
    entry?: Reference[];
    emptyReason?: CodeableConcept;
    section?: CompositionSection[];
  }
  interface ConceptMap extends DomainResource {
    url?: uri;
    identifier?: Identifier;
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    sourceUri?: uri;
    sourceReference?: Reference;
    targetUri?: uri;
    targetReference?: Reference;
    group?: ConceptMapGroup[];
  }
  interface ConceptMapGroup extends Element {
    source: uri;
    sourceVersion?: string;
    target?: uri;
    targetVersion?: string;
    element: ConceptMapGroupElement[];
  }
  interface ConceptMapGroupElement extends Element {
    code?: code;
    target?: ConceptMapGroupElementTarget[];
  }
  interface ConceptMapGroupElementTarget extends Element {
    code?: code;
    display?: string
    equivalence?: code;
    comment?: string;
    dependsOn?: ConceptMapGroupElementTargetDependsOn[];
    product?: ConceptMapGroupElementTargetDependsOn[];
  }
  interface ConceptMapGroupElementTargetDependsOn extends Element {
    property: uri;
    system?: uri;
    value: string;
    display?: string;
  }
  interface Condition extends DomainResource {
    identifier?: Identifier[];
    clinicalStatus?: CodeableConcept;
    verificationStatus?: CodeableConcept;
    category?: CodeableConcept[];
    severity?: CodeableConcept;
    code: CodeableConcept;
    bodySite?: CodeableConcept[];
    subject: Reference;
    context?: Reference;
    onsetDateTime?: dateTime;
    onsetAge?: Age;
    onsetPeriod?: Period;
    onsetRange?: Range;
    onsetString?: string;
    abatementDateTime?: dateTime;
    abatementAge?: Age;
    abatementBoolean?: boolean;
    abatementPeriod?: Period;
    abatementRange?: Range;
    abatementString?: string;
    assertedDate?: date;
    asserter?: Reference;
    recorder?: Reference;
    recordedDate?: dateTime;
    stage?: ConditionStage;
    evidence?: ConditionEvidence[];
    note?: Annotation[];
    encounter?: Reference;
  }
  interface ConditionStage extends Element {
    summary?: CodeableConcept;
    assessment?: Reference[];
  }
  interface ConditionEvidence extends Element {
    code?: CodeableConcept;
    detail?: Reference[];
  }
  interface CapabilityStatement extends DomainResource {
    url?: uri;
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    date: dateTime;
    publisher?: string;
    contact?: ContactDetail[];
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    kind: code;
    instantiates?: uri[];
    software?: CapabilityStatementSoftware;
    implementation?: CapabilityStatementImplementation;
    fhirVersion: id;
    acceptUnknown: code;
    format: code[];
    patchFormat?: code[];
    implementationGuide?: uri[];
    profile?: Reference[];
    rest?: CapabilityStatementRest[];
    messaging?: CapabilityStatementMessaging[];
    document?: CapabilityStatementDocument[];
  }
  interface CapabilityStatementSoftware extends Element {
    name: string;
    version?: string;
    releaseDate?: dateTime;
  }
  interface CapabilityStatementImplementation extends Element {
    description: string;
    url?: uri;
  }
  interface CapabilityStatementRest extends Element {
    mode: code;
    documentation?: string;
    security?: CapabilityStatementRestSecurity;
    resource?: CapabilityStatementRestResource[];
    interaction?: CapabilityStatementRestInteraction[];
    searchParam?: CapabilityStatementRestResourceSearchParam[];
    operation?: CapabilityStatementRestOperation[];
    compartment?: uri[];
  }
  interface CapabilityStatementRestSecurity extends Element {
    cors?: boolean;
    service?: CodeableConcept[];
    description?: string;
    certificate?: CapabilityStatementRestSecurityCertificate[];
  }
  interface CapabilityStatementRestSecurityCertificate extends Element {
    type?: code;
    blob?: base64Binary;
  }
  interface CapabilityStatementRestResource extends Element {
    type: code;
    profile?: uri;
    supportedProfile?: uri[];
    documentation?: markdown;
    interaction: CapabilityStatementRestResourceInteraction[];
    versioning?: code;
    readHistory?: boolean;
    updateCreate?: boolean;
    conditionalCreate?: boolean;
    conditionalRead?: code;
    conditionalUpdate?: boolean;
    conditionalDelete?: code;
    referencePolicy?: code[];
    searchInclude?: string[];
    searchRevInclude?: string[];
    searchParam?: CapabilityStatementRestResourceSearchParam[];
  }
  interface CapabilityStatementRestResourceInteraction extends Element {
    code: code;
    documentation?: string;
  }
  interface CapabilityStatementRestResourceSearchParam extends Element {
    name: string;
    definition?: uri;
    type: code;
    documentation?: string;
  }
  interface CapabilityStatementRestInteraction extends Element {
    code: code;
    documentation?: string;
  }
  interface CapabilityStatementRestOperation extends Element {
    name: string;
    definition: Reference;
  }
  interface CapabilityStatementMessaging extends Element {
    endpoint?: CapabilityStatementMessagingEndpoint[];
    reliableCache?: unsignedInt;
    documentation?: string;
    event: CapabilityStatementMessagingEvent[];
  }
  interface CapabilityStatementMessagingEndpoint extends Element {
    protocol: Coding;
    address: uri;
  }
  interface CapabilityStatementMessagingEvent extends Element {
    code: Coding;
    category?: code;
    mode: code;
    focus: code;
    request: Reference;
    response: Reference;
    documentation?: string;
  }
  interface CapabilityStatementDocument extends Element {
    mode: code;
    documentation?: string;
    profile: Reference;
  }
  interface Consent extends DomainResource {
    identifier?: Identifier;
    status: code;
    category?: CodeableConcept[];
    dateTime?: dateTime;
    period?: Period;
    patient: Reference;
    consentor?: Reference[];
    organization?: Reference;
    sourceAttachment?: Attachment;
    sourceIdentifier?: Identifier;
    sourceReference?: Reference;
    policy: uri;
    recipient?: Reference[];
    purpose?: Coding[];
    except?: ConsentExcept[];
  }
  interface ConsentExcept extends Element {
    type: code;
    period?: Period;
    actor?: ConsentExceptActor[];
    action?: CodeableConcept[];
    securityLabel?: Coding[];
    purpose?: Coding[];
    class?: Coding[];
    code?: Coding[];
    data?: ConsentExceptData[];
  }
  interface ConsentExceptActor extends Element {
    role: CodeableConcept;
    reference: Reference;
  }
  interface ConsentExceptData extends Element {
    meaning: code;
    reference: Reference;
  }
  interface Contract extends DomainResource {
    identifier?: Identifier;
    status?: code;
    issued?: dateTime;
    applies?: Period;
    subject?: Reference[];
    topic?: Reference[];
    authority?: Reference[];
    domain?: Reference[];
    type?: CodeableConcept;
    subType?: CodeableConcept[];
    action?: CodeableConcept[];
    actionReason?: CodeableConcept[];
    agent?: ContractAgent[];
    signer?: ContractSigner[];
    valuedItem?: ContractValuedItem[];
    term?: ContractTerm[];
    bindingAttachment?: Attachment;
    bindingReference?: Reference;
    friendly?: ContractFriendly[];
    legal?: ContractLegal[];
    rule?: ContractRule[];
  }
  interface ContractAgent extends Element {
    actor: Reference;
    role?: CodeableConcept[];
  }
  interface ContractSigner extends Element {
    type: Coding;
    party: Reference;
    signature: Signature[];
  }
  interface ContractValuedItem extends Element {
    entityCodeableConcept?: CodeableConcept;
    entityReference?: Reference;
    identifier?: Identifier;
    effectiveTime?: dateTime;
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    points?: decimal;
    net?: Money;
  }
  interface ContractTerm extends Element {
    identifier?: Identifier;
    issued?: dateTime;
    applies?: Period;
    type?: CodeableConcept;
    subType?: CodeableConcept;
    topic?: Reference[];
    action?: CodeableConcept[];
    actionReason?: CodeableConcept[];
    agent?: ContractTermAgent[];
    text?: string;
    valuedItem?: ContractTermValuedItem[];
    group?: ContractTerm[];
  }
  interface ContractTermAgent extends Element {
    actor: Reference;
    role?: CodeableConcept[];
  }
  interface ContractTermValuedItem extends Element {
    entityCodeableConcept?: CodeableConcept;
    entityReference?: Reference;
    identifier?: Identifier;
    effectiveTime?: dateTime;
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    points?: decimal;
    net?: Money;
  }
  interface ContractFriendly extends Element {
    contentAttachment?: Attachment;
    contentReference?: Reference;
  }
  interface ContractLegal extends Element {
    contentAttachment?: Attachment;
    contentReference?: Reference;
  }
  interface ContractRule extends Element {
    contentAttachment?: Attachment;
    contentReference?: Reference;
  }
  interface Coverage extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    type?: CodeableConcept;
    policyHolder?: Reference;
    subscriber?: Reference;
    subscriberId?: string;
    beneficiary?: Reference;
    relationship?: CodeableConcept;
    period?: Period;
    payor?: Reference[];
    group?: CoverageGroup;
    dependent?: string;
    sequence?: string;
    order?: positiveInt;
    network?: string;
    contract?: Reference[];
  }
  interface CoverageGroup extends Element {
    group?: string;
    groupDisplay?: string;
    subGroup?: string;
    subGroupDisplay?: string;
    plan?: string;
    planDisplay?: string;
    subPlan?: string;
    subPlanDisplay?: string;
    class?: string;
    classDisplay?: string;
    subClass?: string;
    subClassDisplay?: string;
  }
  interface DataElement extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    date?: dateTime;
    name?: string;
    title?: string;
    contact?: ContactDetail[];
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    copyright?: markdown;
    stringency?: code;
    mapping?: DataElementMapping[];
    element: ElementDefinition[];
  }
  interface DataElementMapping extends Element {
    identity: id;
    uri?: uri;
    name?: string;
    comment?: string;
  }
  interface DetectedIssue extends DomainResource {
    patient?: Reference;
    category?: CodeableConcept;
    severity?: code;
    implicated?: Reference[];
    detail?: string;
    date?: dateTime;
    author?: Reference;
    identifier?: Identifier;
    reference?: uri;
    mitigation?: DetectedIssueMitigation[];
  }
  interface DetectedIssueMitigation extends Element {
    action: CodeableConcept;
    date?: dateTime;
    author?: Reference;
  }
  interface Device extends DomainResource {
    identifier?: Identifier[];
    udi?: DeviceUdi;
    status?: code;
    type?: CodeableConcept;
    lotNumber?: string;
    serialNumber?: string;
    manufacturer?: string;
    manufactureDate?: dateTime;
    expirationDate?: dateTime;
    modelNumber?: string;
    partNumber?: string;
    deviceName?: DeviceName[];
    version?: string;
    patient?: Reference;
    owner?: Reference;
    contact?: ContactPoint[];
    location?: Reference;
    url?: uri;
    note?: Annotation[];
    safety: CodeableConcept[];
  }
  interface DeviceName extends Element {
    name?: string;
    type?: code;
  }
  interface DeviceUdi extends Element {
    deviceIdentifier?: string;
    name?: string;
    jurisdiction?: uri;
    carrierHRF?:	string;
    carrierAIDC?: base64Binary;
    issuer?: uri;
    entryType?: code;
  }
  interface DeviceComponent extends DomainResource {
    type: CodeableConcept;
    identifier: Identifier;
    lastSystemChange: instant;
    source?: Reference;
    parent?: Reference;
    operationalStatus?: CodeableConcept[];
    parameterGroup?: CodeableConcept;
    measurementPrinciple?: code;
    productionSpecification?: DeviceComponentProductionSpecification[];
    languageCode?: CodeableConcept;
  }
  interface DeviceComponentProductionSpecification extends Element {
    specType?: CodeableConcept;
    componentId?: Identifier;
    productionSpec?: string;
  }
  interface DeviceMetric extends DomainResource {
    type: CodeableConcept;
    identifier: Identifier;
    unit?: CodeableConcept;
    source?: Reference;
    parent?: Reference;
    operationalStatus?: code;
    color?: code;
    category: code;
    measurementPeriod?: Timing;
    calibration?: DeviceMetricCalibration[];
  }
  interface DeviceMetricCalibration extends Element {
    type?: code;
    state?: code;
    time?: instant;
  }
  interface DeviceRequest extends DomainResource {
    identifier?: Identifier[];
    definition?: Reference[];
    basedOn?: Reference[];
    priorRequest?: Reference[];
    groupIdentifier?: Identifier;
    status?: code;
    intent: CodeableConcept;
    priority?: string;
    codeReference?: Reference;
    codeCodeableConcept?: CodeableConcept;
    subject: Reference;
    context?: Reference;
    occurrenceDateTime?: dateTime;
    occurrencePeriod?: Period;
    occurrenceTiming?: Timing;
    authoredOn?: dateTime;
    requester?: DeviceRequestRequester;
    performerType?: CodeableConcept;
    performer?: Reference;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    supportingInfo?: Reference[];
    note?: Annotation[];
    relevantHistory?: Reference[];
  }
  interface DeviceRequestRequester extends Element {
    agent?: Reference;
    onBehalfOf?: Reference;
  }
  interface DeviceUseStatement extends DomainResource {
    status: string;
    bodySite?: CodeableConcept;
    whenUsed?: Period;
    device: Reference;
    identifier?: Identifier[];
    indication?: CodeableConcept[];
    notes?: string[];
    recordedOn?: dateTime;
    subject: Reference;
    source?: Reference;
    timingTiming?: Timing;
    timingPeriod?: Period;
    timingDateTime?: dateTime;
  }
  interface DiagnosticRequest extends DomainResource {
    identifier?: Identifier[];
    definition?: Reference[];
    basedOn?: Reference[];
    replaces?: Reference[];
    requisition?: Identifier;
    status: code;
    intent: code;
    priority?: code;
    code: CodeableConcept;
    subject: Reference;
    context?: Reference;
    occurrenceDateTime?: dateTime;
    occurrencePeriod?: Period;
    occurrenceTiming?: Timing;
    authoredOn?: dateTime;
    requester?: Reference;
    performerType?: CodeableConcept;
    performer?: Reference;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    supportingInformation?: Reference[];
    note?: Annotation[];
    relevantHistory?: Reference[];
  }
  interface DiagnosticReport extends DomainResource {
    identifier?: Identifier[];
    status: code;
    category?: CodeableConcept;
    code: CodeableConcept;
    subject?: Reference;
    encounter?: Reference;
    effectiveDateTime?: dateTime;
    effectivePeriod?: Period;
    issued?: instant;
    performer?: Reference[];
    request?: Reference[];
    specimen?: Reference[];
    result?: Reference[];
    imagingStudy?: Reference[];
    image?: DiagnosticReportImage[];
    conclusion?: string;
    codedDiagnosis?: CodeableConcept[];
    presentedForm?: Attachment[];
  }
  interface DiagnosticReportImage extends Element {
    comment?: string;
    link: Reference;
  }
  interface DocumentManifest extends DomainResource {
    masterIdentifier?: Identifier;
    identifier?: Identifier[];
    subject?: Reference;
    recipient?: Reference[];
    type?: CodeableConcept;
    author?: Reference[];
    created?: dateTime;
    source?: uri;
    status: code;
    description?: string;
    content: DocumentManifestContent[];
    related?: DocumentManifestRelated[];
  }
  interface DocumentManifestContent extends Element {
    pAttachment?: Attachment;
    pReference?: Reference;
  }
  interface DocumentManifestRelated extends Element {
    identifier?: Identifier;
    ref?: Reference;
  }
  interface DocumentReference extends DomainResource {
    masterIdentifier?: Identifier;
    identifier?: Identifier[];
    subject?: Reference;
    type: CodeableConcept;
    class?: CodeableConcept;
    author?: Reference[];
    custodian?: Reference;
    authenticator?: Reference;
    created?: dateTime;
    indexed: instant;
    status: code;
    docStatus?: CodeableConcept;
    relatesTo?: DocumentReferenceRelatesTo[];
    description?: string;
    securityLabel?: CodeableConcept[];
    content: DocumentReferenceContent[];
    context?: DocumentReferenceContext;
  }
  interface DocumentReferenceRelatesTo extends Element {
    code: code;
    target: Reference;
  }
  interface DocumentReferenceContent extends Element {
    attachment: Attachment;
    format?: Coding[];
  }
  interface DocumentReferenceContext extends Element {
    encounter?: Reference;
    event?: CodeableConcept[];
    period?: Period;
    facilityType?: CodeableConcept;
    practiceSetting?: CodeableConcept;
    sourcePatientInfo?: Reference;
    related?: DocumentReferenceContextRelated[];
  }
  interface DocumentReferenceContextRelated extends Element {
    identifier?: Identifier;
    ref?: Reference;
  }
  interface EligibilityRequest extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    priority?: CodeableConcept;
    patient?: Reference;
    servicedDate?: date;
    servicedPeriod?: Period;
    created?: dateTime;
    enterer?: Reference;
    provider?: Reference;
    organization?: Reference;
    insurer?: Reference;
    facility?: Reference;
    coverage?: Reference;
    businessArrangement?: string;
    benefitCategory?: CodeableConcept;
    benefitSubCategory?: CodeableConcept;
  }
  interface EligibilityResponse extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    created?: dateTime;
    requestProvider?: Reference;
    requestOrganization?: Reference;
    request?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    insurer?: Reference;
    inforce?: boolean;
    insurance?: EligibilityResponseInsurance[];
    form?: CodeableConcept;
    error?: EligibilityResponseError[];
  }
  interface EligibilityResponseInsurance extends Element {
    coverage?: Reference;
    contract?: Reference;
    benefitBalance?: EligibilityResponseInsuranceBenefitBalance[];
  }
  interface EligibilityResponseInsuranceBenefitBalance extends Element {
    category: CodeableConcept;
    subCategory?: CodeableConcept;
    excluded?: boolean;
    name?: string;
    description?: string;
    network?: CodeableConcept;
    unit?: CodeableConcept;
    term?: CodeableConcept;
    financial?: EligibilityResponseInsuranceBenefitBalanceFinancial[];
  }
  interface EligibilityResponseInsuranceBenefitBalanceFinancial extends Element {
    type: CodeableConcept;
    benefitUnsignedInt?: unsignedInt;
    benefitString?: string;
    benefitMoney?: Money;
    benefitUsedUnsignedInt?: unsignedInt;
    benefitUsedMoney?: Money;
  }
  interface EligibilityResponseError extends Element {
    code: CodeableConcept;
  }
  interface Encounter extends DomainResource {
    identifier?: Identifier[];
    status: code;
    statusHistory?: EncounterStatusHistory[];
    class?: Coding;
    classHistory?: EncounterClassHistory[];
    type?: CodeableConcept[];
    serviceType?: CodeableConcept;
    priority?: CodeableConcept;
    subject?: Reference;
    episodeOfCare?: Reference[];
    basedOn?: Reference[];
    incomingReferral?: Reference[];
    participant?: EncounterParticipant[];
    appointment?: Reference[];
    period?: Period;
    length?: Duration;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    diagnosis?: EncounterDiagnosis[];
    account?: Reference[];
    hospitalization?: EncounterHospitalization;
    location?: EncounterLocation[];
    serviceProvider?: Reference;
    partOf?: Reference;
  }
  interface EncounterStatusHistory extends Element {
    status: code;
    period: Period;
  }
  interface EncounterClassHistory extends Element {
    class: Coding;
    period: Period;
  }
  interface EncounterParticipant extends Element {
    type?: CodeableConcept[];
    period?: Period;
    individual?: Reference;
  }
  interface EncounterDiagnosis extends Element {
    condition: Reference;
    use?: CodeableConcept;
    rank?: positiveInt;
  }
  interface EncounterHospitalization extends Element {
    preAdmissionIdentifier?: Identifier;
    origin?: Reference;
    admitSource?: CodeableConcept;
    reAdmission?: CodeableConcept;
    dietPreference?: CodeableConcept[];
    specialCourtesy?: CodeableConcept[];
    specialArrangement?: CodeableConcept[];
    destination?: Reference;
    dischargeDisposition?: CodeableConcept;
  }
  interface EncounterLocation extends Element {
    location: Reference;
    status?: code;
    physicalType?: CodeableConcept;
    period?: Period;
  }
  interface Endpoint extends DomainResource {
    identifier?: Identifier[];
    status: code;
    name?: string;
    managingOrganization?: Reference;
    contact?: ContactPoint[];
    period?: Period;
    connectionType: Coding;
    payloadType: CodeableConcept[];
    payloadMimeType?: code[];
    address: uri;
    header?: string[];
    publicKey?: string;
  }
  interface EnrollmentRequest extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    created?: dateTime;
    insurer?: Reference;
    provider?: Reference;
    organization?: Reference;
    subject?: Reference;
    coverage?: Reference;
  }
  interface EnrollmentResponse extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    request?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    created?: dateTime;
    organization?: Reference;
    requestProvider?: Reference;
    requestOrganization?: Reference;
  }
  interface EpisodeOfCare extends DomainResource {
    identifier?: Identifier[];
    status: code;
    statusHistory?: EpisodeOfCareStatusHistory[];
    type?: CodeableConcept[];
    condition?: Reference[];
    patient: Reference;
    managingOrganization?: Reference;
    period?: Period;
    referralRequest?: Reference[];
    careManager?: Reference;
    team?: Reference[];
    account?: Reference[];
  }
  interface EpisodeOfCareStatusHistory extends Element {
    status: code;
    period: Period;
  }
  interface ExpansionProfile extends DomainResource {
    url?: uri;
    identifier?: Identifier;
    version?: string;
    name?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    fixedVersion?: ExpansionProfileFixedVersion[];
    excludedSystem?: ExpansionProfileExcludedSystem;
    includeDesignations?: boolean;
    designation?: ExpansionProfileDesignation;
    includeDefinition?: boolean;
    activeOnly?: boolean;
    excludeNested?: boolean;
    excludeNotForUI?: boolean;
    excludePostCoordinated?: boolean;
    displayLanguage?: code;
    limitedExpansion?: boolean;
  }
  interface ExpansionProfileFixedVersion extends Element {
    system: uri;
    version: string;
    mode: code;
  }
  interface ExpansionProfileExcludedSystem extends Element {
    system: uri;
    version?: string;
  }
  interface ExpansionProfileDesignation extends Element {
    include?: ExpansionProfileDesignationInclude;
    exclude?: ExpansionProfileDesignationExclude;
  }
  interface ExpansionProfileDesignationInclude extends Element {
    designation?: ExpansionProfileDesignationIncludeDesignation[];
  }
  interface ExpansionProfileDesignationIncludeDesignation extends Element {
    language?: code;
    use?: Coding;
  }
  interface ExpansionProfileDesignationExclude extends Element {
    designation?: ExpansionProfileDesignationExcludeDesignation[];
  }
  interface ExpansionProfileDesignationExcludeDesignation extends Element {
    language?: code;
    use?: Coding;
  }
  interface ExplanationOfBenefit extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    type?: CodeableConcept;
    subType?: CodeableConcept[];
    patient?: Reference;
    billablePeriod?: Period;
    created?: dateTime;
    enterer?: Reference;
    insurer?: Reference;
    provider?: Reference;
    organization?: Reference;
    referral?: Reference;
    facility?: Reference;
    claim?: Reference;
    claimResponse?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    related?: ExplanationOfBenefitRelated[];
    prescription?: Reference;
    originalPrescription?: Reference;
    payee?: ExplanationOfBenefitPayee;
    information?: ExplanationOfBenefitInformation[];
    careTeam?: ExplanationOfBenefitCareTeam[];
    diagnosis?: ExplanationOfBenefitDiagnosis[];
    procedure?: ExplanationOfBenefitProcedure[];
    precedence?: positiveInt;
    insurance?: ExplanationOfBenefitInsurance;
    accident?: ExplanationOfBenefitAccident;
    employmentImpacted?: Period;
    hospitalization?: Period;
    item?: ExplanationOfBenefitItem[];
    addItem?: ExplanationOfBenefitAddItem[];
    totalCost?: Money;
    unallocDeductable?: Money;
    totalBenefit?: Money;
    payment?: ExplanationOfBenefitPayment;
    form?: CodeableConcept;
    note?: ExplanationOfBenefitNote[];
    benefitBalance?: ExplanationOfBenefitBenefitBalance[];
  }
  interface ExplanationOfBenefitRelated extends Element {
    claim?: Reference;
    relationship?: CodeableConcept;
    reference?: Identifier;
  }
  interface ExplanationOfBenefitPayee extends Element {
    type?: CodeableConcept;
    resourceType?: CodeableConcept;
    partyIdentifier?: Identifier;
    partyReference?: Reference;
  }
  interface ExplanationOfBenefitInformation extends Element {
    category: CodeableConcept;
    code?: CodeableConcept;
    timingDate?: date;
    timingPeriod?: Period;
    valueString?: string;
    valueQuantity?: Quantity;
    valueAttachment?: Attachment;
    valueReference?: Reference;
    reason?: Coding;
  }
  interface ExplanationOfBenefitCareTeam extends Element {
    sequence: positiveInt;
    provider: Reference;
    responsible?: boolean;
    role?: CodeableConcept;
    qualification?: CodeableConcept;
  }
  interface ExplanationOfBenefitDiagnosis extends Element {
    sequence: positiveInt;
    diagnosisCodeableConcept?: CodeableConcept;
    diagnosisReference?: Reference;
    type?: CodeableConcept[];
    packageCode?: CodeableConcept;
  }
  interface ExplanationOfBenefitProcedure extends Element {
    sequence: positiveInt;
    date?: dateTime;
    procedureCodeableConcept?: CodeableConcept;
    procedureReference?: Reference;
  }
  interface ExplanationOfBenefitInsurance extends Element {
    coverage?: Reference;
    preAuthRef?: string[];
  }
  interface ExplanationOfBenefitAccident extends Element {
    date?: date;
    type?: CodeableConcept;
    locationAddress?: Address;
    locationReference?: Reference;
  }
  interface ExplanationOfBenefitItem extends Element {
    sequence: positiveInt;
    careTeamLinkId?: positiveInt[];
    diagnosisLinkId?: positiveInt[];
    procedureLinkId?: positiveInt[];
    informationLinkId?: positiveInt[];
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    servicedDate?: date;
    servicedPeriod?: Period;
    locationCodeableConcept?: CodeableConcept;
    locationAddress?: Address;
    locationReference?: Reference;
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
    bodySite?: CodeableConcept;
    subSite?: CodeableConcept[];
    noteNumber?: positiveInt[];
    adjudication?: ExplanationOfBenefitItemAdjudication[];
    detail?: ExplanationOfBenefitItemDetail[];
    prosthesis?: ExplanationOfBenefitItemProsthesis;
  }
  interface ExplanationOfBenefitItemAdjudication extends Element {
    category: CodeableConcept;
    reason?: CodeableConcept;
    amount?: Money;
    value?: decimal;
  }
  interface ExplanationOfBenefitItemDetail extends Element {
    sequence: positiveInt;
    type: CodeableConcept;
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
    noteNumber?: positiveInt[];
    adjudication?: ExplanationOfBenefitItemAdjudication[];
    subDetail?: ExplanationOfBenefitItemDetailSubDetail[];
  }
  interface ExplanationOfBenefitItemDetailSubDetail extends Element {
    sequence: positiveInt;
    type: CodeableConcept;
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    programCode?: CodeableConcept[];
    quantity?: Quantity;
    unitPrice?: Money;
    factor?: decimal;
    net?: Money;
    udi?: Reference[];
    noteNumber?: positiveInt[];
    adjudication?: ExplanationOfBenefitItemAdjudication[];
  }
  interface ExplanationOfBenefitItemProsthesis extends Element {
    initial?: boolean;
    priorDate?: date;
    priorMaterial?: CodeableConcept;
  }
  interface ExplanationOfBenefitAddItem extends Element {
    sequenceLinkId?: positiveInt[];
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    fee?: Money;
    noteNumber?: positiveInt[];
    adjudication?: ExplanationOfBenefitItemAdjudication[];
    detail?: ExplanationOfBenefitAddItemDetail[];
  }
  interface ExplanationOfBenefitAddItemDetail extends Element {
    revenue?: CodeableConcept;
    category?: CodeableConcept;
    service?: CodeableConcept;
    modifier?: CodeableConcept[];
    fee?: Money;
    noteNumber?: positiveInt[];
    adjudication?: ExplanationOfBenefitItemAdjudication[];
  }
  interface ExplanationOfBenefitPayment extends Element {
    type?: CodeableConcept;
    adjustment?: Money;
    adjustmentReason?: CodeableConcept;
    date?: date;
    amount?: Money;
    identifier?: Identifier;
  }
  interface ExplanationOfBenefitNote extends Element {
    number?: positiveInt;
    type?: CodeableConcept;
    text?: string;
    language?: CodeableConcept;
  }
  interface ExplanationOfBenefitBenefitBalance extends Element {
    category: CodeableConcept;
    subCategory?: CodeableConcept;
    excluded?: boolean;
    name?: string;
    description?: string;
    network?: CodeableConcept;
    unit?: CodeableConcept;
    term?: CodeableConcept;
    financial?: ExplanationOfBenefitBenefitBalanceFinancial[];
  }
  interface ExplanationOfBenefitBenefitBalanceFinancial extends Element {
    type: CodeableConcept;
    benefitUnsignedInt?: unsignedInt;
    benefitString?: string;
    benefitMoney?: Money;
    benefitUsedUnsignedInt?: unsignedInt;
    benefitUsedMoney?: Money;
  }
  interface FamilyMemberHistory extends DomainResource {
    identifier?: Identifier[];
    patient: Reference;
    date?: dateTime;
    status: code;
    notDone?: boolean;
    notDoneReason?: CodeableConcept;
    name?: string;
    relationship: CodeableConcept;
    gender?: code;
    bornPeriod?: Period;
    bornDate?: date;
    bornString?: string;
    ageAge?: Age;
    ageRange?: Range;
    ageString?: string;
    estimatedAge?: boolean;
    deceasedBoolean?: boolean;
    deceasedAge?: Age;
    deceasedRange?: Range;
    deceasedDate?: date;
    deceasedString?: string;
    reasonCode: CodeableConcept[];
    reasonReference: Reference[];
    note?: Annotation[];
    condition?: FamilyMemberHistoryCondition[];
  }
  interface FamilyMemberHistoryCondition extends Element {
    code: CodeableConcept;
    outcome?: CodeableConcept;
    onsetAge?: Age;
    onsetRange?: Range;
    onsetPeriod?: Period;
    onsetString?: string;
    note?: Annotation[];
  }
  interface Flag extends DomainResource {
    identifier?: Identifier[];
    category?: CodeableConcept;
    status: code;
    period?: Period;
    subject: Reference;
    encounter?: Reference;
    author?: Reference;
    code: CodeableConcept;
  }
  interface Goal extends DomainResource {
    identifier?: Identifier[];
    status: code;
    category?: CodeableConcept[];
    priority?: CodeableConcept;
    description: CodeableConcept;
    subject?: Reference;
    startDate?: date;
    startCodeableConcept?: CodeableConcept;
    target: GoalTarget;
    statusDate?: date;
    statusReason?: string;
    expressedBy?: Reference;
    addresses?: Reference[];
    note?: Annotation[];
    outcomeReference?: Reference[];
    outcomeCode?: CodeableConcept[];
  }
  interface GoalTarget extends Element {
    measure?: CodeableConcept;
    detailQuantity?: Quantity;
    detailRange?: Range;
    detailCodeableConcept?: CodeableConcept;
    dueDate?: date;
    dueDuration?: Duration;
  }
  interface GoalOutcome extends Element {
    resultCodeableConcept?: CodeableConcept;
    resultReference?: Reference;
  }
  interface Group extends DomainResource {
    identifier?: Identifier[];
    type: code;
    actual: boolean;
    active?: boolean;
    code?: CodeableConcept;
    name?: string;
    quantity?: unsignedInt;
    characteristic?: GroupCharacteristic[];
    member?: GroupMember[];
  }
  interface GroupCharacteristic extends Element {
    code: CodeableConcept;
    valueCodeableConcept?: CodeableConcept;
    valueBoolean?: boolean;
    valueQuantity?: Quantity;
    valueRange?: Range;
    exclude: boolean;
    period?: Period;
  }
  interface GroupMember extends Element {
    entity: Reference;
    period?: Period;
    inactive?: boolean;
  }
  interface GuidanceResponse extends DomainResource {
    requestId?: id;
    identifier?: Identifier;
    module: Reference;
    status: code;
    subject?: Reference;
    context?: Reference;
    occurrenceDateTime?: dateTime;
    performer?: Reference;
    reasonCodeableConcept?: CodeableConcept;
    reasonReference?: Reference;
    note?: Annotation[];
    evaluationMessage?: Reference[];
    outputParameters?: Reference;
    result?: Reference;
    dataRequirement?: DataRequirement[];
  }
  interface HealthcareService extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    providedBy?: Reference;
    serviceCategory?: CodeableConcept;
    serviceType?: CodeableConcept[];
    specialty?: CodeableConcept[];
    location?: Reference[];
    serviceName?: string;
    comment?: string;
    extraDetails?: string;
    photo?: Attachment;
    telecom?: ContactPoint[];
    coverageArea?: Reference[];
    serviceProvisionCode?: CodeableConcept[];
    eligibility?: CodeableConcept;
    eligibilityNote?: string;
    programName?: string[];
    characteristic?: CodeableConcept[];
    referralMethod?: CodeableConcept[];
    publicKey?: string;
    appointmentRequired?: boolean;
    availableTime?: HealthcareServiceAvailableTime[];
    notAvailable?: HealthcareServiceNotAvailable[];
    availabilityExceptions?: string;
    endpoint?: Reference[];
  }
  interface HealthcareServiceAvailableTime extends Element {
    daysOfWeek?: code[];
    allDay?: boolean;
    availableStartTime?: time;
    availableEndTime?: time;
  }
  interface HealthcareServiceNotAvailable extends Element {
    description: string;
    during?: Period;
  }
  interface ImagingManifest extends DomainResource {
    uid?: oid;
    patient: Reference;
    authoringTime?: dateTime;
    author?: Reference;
    title: CodeableConcept;
    description?: string;
    study: ImagingManifestStudy[];
  }
  interface ImagingManifestStudy extends Element {
    uid: oid;
    imagingStudy?: Reference;
    baseLocation?: ImagingManifestStudyBaseLocation[];
    series: ImagingManifestStudySeries[];
  }
  interface ImagingManifestStudyBaseLocation extends Element {
    type: Coding;
    url: uri;
  }
  interface ImagingManifestStudySeries extends Element {
    uid: oid;
    baseLocation?: ImagingManifestStudySeriesBaseLocation[];
    instance: ImagingManifestStudySeriesInstance[];
  }
  interface ImagingManifestStudySeriesBaseLocation extends Element {
    type: Coding;
    url: uri;
  }
  interface ImagingManifestStudySeriesInstance extends Element {
    sopClass: oid;
    uid: oid;
  }
  interface Immunization extends DomainResource {
    identifier?: Identifier[];
    status: code;
    date?: dateTime;
    vaccineCode: CodeableConcept;
    patient: Reference;
    notGiven: boolean;
    primarySource: boolean;
    reportOrigin?: CodeableConcept;
    performer?: Reference;
    requester?: Reference;
    encounter?: Reference;
    manufacturer?: Reference;
    location?: Reference;
    lotNumber?: string;
    expirationDate?: date;
    site?: CodeableConcept;
    route?: CodeableConcept;
    doseQuantity?: Quantity;
    note?: Annotation[];
    explanation?: ImmunizationExplanation;
    reaction?: ImmunizationReaction[];
    vaccinationProtocol?: ImmunizationVaccinationProtocol[];
  }
  interface ImmunizationExplanation extends Element {
    reason?: CodeableConcept[];
    reasonNotGiven?: CodeableConcept[];
  }
  interface ImmunizationReaction extends Element {
    date?: dateTime;
    detail?: Reference;
    reported?: boolean;
  }
  interface ImmunizationVaccinationProtocol extends Element {
    doseSequence?: positiveInt;
    description?: string;
    authority?: Reference;
    series?: string;
    seriesDoses?: positiveInt;
    targetDisease: CodeableConcept[];
    doseStatus: CodeableConcept;
    doseStatusReason?: CodeableConcept;
  }
  interface ImmunizationRecommendation extends DomainResource {
    identifier?: Identifier[];
    patient: Reference;
    recommendation: ImmunizationRecommendationRecommendation[];
  }
  interface ImmunizationRecommendationRecommendation extends Element {
    date: dateTime;
    vaccineCode: CodeableConcept;
    doseNumber?: positiveInt;
    forecastStatus: CodeableConcept;
    dateCriterion?: ImmunizationRecommendationRecommendationDateCriterion[];
    protocol?: ImmunizationRecommendationRecommendationProtocol;
    supportingImmunization?: Reference[];
    supportingPatientInformation?: Reference[];
  }
  interface ImmunizationRecommendationRecommendationDateCriterion extends Element {
    code: CodeableConcept;
    value: dateTime;
  }
  interface ImmunizationRecommendationRecommendationProtocol extends Element {
    doseSequence?: positiveInt;
    description?: string;
    authority?: Reference;
    series?: string;
  }
  interface ImplementationGuide extends DomainResource {
    url: uri;
    version?: string;
    name: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    copyright?: markdown;
    fhirVersion?: id;
    dependency?: ImplementationGuideDependency[];
    package?: ImplementationGuidePackage[];
    global?: ImplementationGuideGlobal[];
    binary?: uri[];
    page?: ImplementationGuidePage;
  }
  interface ImplementationGuideDependency extends Element {
    type: code;
    uri: uri;
  }
  interface ImplementationGuidePackage extends Element {
    name: string;
    description?: string;
    resource: ImplementationGuidePackageResource[];
  }
  interface ImplementationGuidePackageResource extends Element {
    example: boolean;
    name?: string;
    description?: string;
    acronym?: string;
    sourceUri?: uri;
    sourceReference?: Reference;
    exampleFor?: Reference;
  }
  interface ImplementationGuideGlobal extends Element {
    type: code;
    profile: Reference;
  }
  interface ImplementationGuidePage extends Element {
    source: uri;
    title: string;
    kind: code;
    type?: code[];
    package?: string[];
    format?: code;
    page?: ImplementationGuidePage[];
  }
  interface Library extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    type: CodeableConcept;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    usage?: string;
    approvalDate?: date;
    lastReviewDate?: date;
    effectivePeriod?: Period;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    topic?: CodeableConcept[];
    contributor?: Contributor[];
    publisher?: string;
    contact?: ContactDetail[];
    copyright?: markdown;
    relatedArtifact?: RelatedArtifact[];
    parameter?: ParameterDefinition[];
    dataRequirement?: DataRequirement[];
    content?: Attachment[];
  }
  interface Linkage extends DomainResource {
    author?: Reference;
    item: LinkageItem[];
  }
  interface LinkageItem extends Element {
    type: code;
    resource: Reference;
  }
  interface List extends DomainResource {
    identifier?: Identifier[];
    status: code;
    mode: code;
    title?: string;
    code?: CodeableConcept;
    subject?: Reference;
    encounter?: Reference;
    date?: dateTime;
    source?: Reference;
    orderedBy?: CodeableConcept;
    note?: Annotation[];
    entry?: ListEntry[];
    emptyReason?: CodeableConcept;
  }
  interface ListEntry extends Element {
    flag?: CodeableConcept;
    deleted?: boolean;
    date?: dateTime;
    item: Reference;
  }
  interface Location extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    operationalStatus?: Coding;
    name?: string;
    alias?: string[];
    description?: string;
    mode?: code;
    type?: CodeableConcept;
    telecom?: ContactPoint[];
    address?: Address;
    physicalType?: CodeableConcept;
    position?: LocationPosition;
    managingOrganization?: Reference;
    partOf?: Reference;
    endpoint?: Reference[];
  }
  interface LocationPosition extends Element {
    longitude: decimal;
    latitude: decimal;
    altitude?: decimal;
  }
  interface Measure extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    usage?: string;
    approvalDate?: date;
    lastReviewDate?: date;
    effectivePeriod?: Period;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    topic?: CodeableConcept[];
    contributor?: Contributor[];
    publisher?: string;
    contact?: ContactDetail[];
    copyright?: markdown;
    relatedArtifact?: RelatedArtifact[];
    library?: Reference[];
    disclaimer?: markdown;
    scoring?: code;
    compositeScoring?: code;
    type?: code[];
    riskAdjustment?: string;
    rateAggregation?: string;
    rationale?: markdown;
    clinicalRecommendationStatement?: markdown;
    improvementNotation?: string;
    definition?: markdown;
    guidance?: markdown;
    set?: string;
    group?: MeasureGroup[];
    supplementalData?: MeasureSupplementalData[];
  }
  interface MeasureGroup extends Element {
    identifier: Identifier;
    name?: string;
    description?: string;
    population?: MeasureGroupPopulation[];
    stratifier?: MeasureGroupStratifier[];
  }
  interface MeasureGroupPopulation extends Element {
    type: code;
    identifier: Identifier;
    name?: string;
    description?: string;
    criteria: string;
  }
  interface MeasureGroupStratifier extends Element {
    identifier: Identifier;
    criteria?: string;
    path?: string;
  }
  interface MeasureSupplementalData extends Element {
    identifier: Identifier;
    usage?: code[];
    criteria?: string;
    path?: string;
  }
  interface MeasureReport extends DomainResource {
    measure: Reference;
    type: code;
    patient?: Reference;
    period: Period;
    status: code;
    date?: dateTime;
    reportingOrganization?: Reference;
    group?: MeasureReportGroup[];
    evaluatedResources?: Reference;
  }
  interface MeasureReportGroup extends Element {
    identifier: Identifier;
    population?: MeasureReportGroupPopulation[];
    measureScore?: decimal;
    stratifier?: MeasureReportGroupStratifier[];
    supplementalData?: MeasureReportGroupSupplementalData[];
  }
  interface MeasureReportGroupPopulation extends Element {
    type: code;
    count?: integer;
    patients?: Reference;
  }
  interface MeasureReportGroupStratifier extends Element {
    identifier: Identifier;
    group?: MeasureReportGroupStratifierGroup[];
  }
  interface MeasureReportGroupStratifierGroup extends Element {
    value: string;
    population?: MeasureReportGroupStratifierGroupPopulation[];
    measureScore?: decimal;
  }
  interface MeasureReportGroupStratifierGroupPopulation extends Element {
    type: code;
    count?: integer;
    patients?: Reference;
  }
  interface MeasureReportGroupSupplementalData extends Element {
    identifier: Identifier;
    group?: MeasureReportGroupSupplementalDataGroup[];
  }
  interface MeasureReportGroupSupplementalDataGroup extends Element {
    value: string;
    count?: integer;
    patients?: Reference;
  }
  interface Media extends DomainResource {
    identifier?: Identifier[];
    type: code;
    subtype?: CodeableConcept;
    view?: CodeableConcept;
    subject?: Reference;
    operator?: Reference;
    deviceName?: string;
    height?: positiveInt;
    width?: positiveInt;
    frames?: positiveInt;
    duration?: unsignedInt;
    content: Attachment;
  }
  interface Medication extends DomainResource {
    identifier?: Identifier;
    code?: CodeableConcept;
    status?: code;
    manufacturer?: Reference;
    ingredient?: MedicationProductIngredient[];
    batch?: MedicationProductBatch[];
    form?: CodeableConcept;
  }
  interface MedicationProduct extends Element {
    form?: CodeableConcept;
    ingredient?: MedicationProductIngredient[];
    batch?: MedicationProductBatch[];
  }
  interface MedicationProductIngredient extends Element {
    itemCodeableConcept?: CodeableConcept;
    itemReference?: Reference;
    strength?: Ratio;
    isActive?: boolean
  }
  interface MedicationProductBatch extends Element {
    lotNumber?: string;
    expirationDate?: dateTime;
  }
  interface MedicationPackage extends Element {
    container?: CodeableConcept;
    content?: MedicationPackageContent[];
  }
  interface MedicationPackageContent extends Element {
    itemCodeableConcept?: CodeableConcept;
    itemReference?: Reference;
    amount?: Quantity;
  }
  interface MedicationAdministration extends DomainResource {
    identifier?: Identifier[];
    status: code;
    medicationCodeableConcept?: CodeableConcept;
    medicationReference?: Reference;
    patient: Reference;
    encounter?: Reference;
    supportingInformation?: Reference[];
    effectiveDateTime?: dateTime;
    effectivePeriod?: Period;
    performer?: Reference;
    reasonReference?: Reference[];
    prescription?: Reference;
    notGiven?: boolean;
    reasonNotGiven?: CodeableConcept[];
    reasonGiven?: CodeableConcept[];
    device?: Reference[];
    note?: Annotation[];
    dosage?: MedicationAdministrationDosage;
    eventHistory?: Reference[];
  }
  interface MedicationAdministrationDosage extends Element {
    text?: string;
    site?: CodeableConcept;
    route?: CodeableConcept;
    method?: CodeableConcept;
    dose?: Quantity;
    rateRatio?: Ratio;
    rateQuantity?: Quantity;
  }
  interface MedicationDispense extends DomainResource {
    identifier?: Identifier;
    status?: code;
    medicationCodeableConcept?: CodeableConcept;
    medicationReference?: Reference;
    patient?: Reference;
    supportingInformation?: Reference[];
    dispenser?: Reference;
    dispensingOrganization?: Reference;
    authorizingPrescription?: Reference[];
    type?: CodeableConcept;
    quantity?: Quantity;
    daysSupply?: Quantity;
    whenPrepared?: dateTime;
    whenHandedOver?: dateTime;
    destination?: Reference;
    receiver?: Reference[];
    note?: Annotation[];
    dosageInstruction?: DosageInstruction[];
    substitution?: MedicationDispenseSubstitution;
    eventHistory?: Reference[];
  }
  interface MedicationDispenseSubstitution extends Element {
    type: CodeableConcept;
    reason?: CodeableConcept[];
    responsibleParty?: Reference[];
  }
  interface MedicationRequest extends DomainResource {
    identifier?: Identifier[];
    definition?: Reference[];
    basedOn?: Reference[];
    requisition?: Identifier;
    status?: code;
    statusReason?: CodeableConcept;
    intent: code;
    medicationCodeableConcept?: CodeableConcept;
    medicationReference?: Reference;
    subject: Reference;
    supportingInformation?: Reference[];
    authoredOn?: dateTime;
    requester?: Reference;
    performer?: Reference;
    recorder?: Reference;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    note?: Annotation[];
    category?: CodeableConcept[];
    priority?: code;
    dosageInstruction?: DosageInstruction[];
    dispenseRequest?: MedicationRequestDispenseRequest;
    substitution?: MedicationRequestSubstitution;
    priorPrescription?: Reference;
    eventHistory?: Reference[];
    encounter?: Reference;
  }
  interface MedicationRequestDispenseRequest extends Element {
    validityPeriod?: Period;
    numberOfRepeatsAllowed?: positiveInt;
    quantity?: Quantity;
    expectedSupplyDuration?: Duration;
    performer?: Reference;
  }
  interface MedicationRequestSubstitution extends Element {
    allowed: boolean;
    reason?: CodeableConcept;
  }
  interface MedicationStatement extends DomainResource {
    identifier?: Identifier[];
    basedOn?: Reference[];
    partOf?: Reference[];
    context?: Reference;
    status: code;
    statusReason?: CodeableConcept[];
    category?: CodeableConcept;
    medicationCodeableConcept?: CodeableConcept;
    medicationReference?: Reference;
    effectiveDateTime?: dateTime;
    effectivePeriod?: Period;
    dateAsserted?: dateTime;
    informationSource?: Reference;
    subject: Reference;
    derivedFrom?: Reference[];
    taken?: code;
    reasonNotTaken?: CodeableConcept[];
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    note?: Annotation[];
    dosage?: DosageInstruction[];
  }
  interface MessageDefinition extends DomainResource {
    url?: uri;
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    date: dateTime;
    publisher?: string;
    contact?: ContactDetail[];
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    base?: Reference;
    parent?: Reference[];
    replaces?: Reference[];
    event: Coding;
    category?: code;
    focus?: MessageDefinitionFocus[];
    responseRequired?: boolean;
    allowedResponse?: MessageDefinitionAllowedResponse[];
  }
  interface MessageDefinitionFocus extends Element {
    code: code;
    profile?: Reference;
    min?: unsignedInt;
    max?: string;
  }
  interface MessageDefinitionAllowedResponse extends Element {
    message: Reference;
    situation?: markdown;
  }
  interface MessageHeader extends DomainResource {
    timestamp: instant;
    event: Coding;
    response?: MessageHeaderResponse;
    source: MessageHeaderSource;
    destination?: MessageHeaderDestination[];
    enterer?: Reference;
    author?: Reference;
    receiver?: Reference;
    responsible?: Reference;
    reason?: CodeableConcept;
    data?: Reference[];
  }
  interface MessageHeaderResponse extends Element {
    identifier: id;
    code: code;
    details?: Reference;
  }
  interface MessageHeaderSource extends Element {
    name?: string;
    software?: string;
    version?: string;
    contact?: ContactPoint;
    endpoint: uri;
  }
  interface MessageHeaderDestination extends Element {
    name?: string;
    target?: Reference;
    endpoint: uri;
  }
  interface NamingSystem extends DomainResource {
    name: string;
    status: code;
    kind: code;
    date: dateTime;
    publisher?: string;
    contact?: ContactDetail[];
    responsible?: string;
    type?: CodeableConcept;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    usage?: string;
    uniqueId: NamingSystemUniqueId[];
    replacedBy?: Reference;
  }
  interface NamingSystemUniqueId extends Element {
    type: code;
    value: string;
    preferred?: boolean;
    comment?: string;
    period?: Period;
  }
  interface NutritionRequest extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    patient: Reference;
    encounter?: Reference;
    dateTime: dateTime;
    orderer?: Reference;
    allergyIntolerance?: Reference[];
    foodPreferenceModifier?: CodeableConcept[];
    excludeFoodModifier?: CodeableConcept[];
    oralDiet?: NutritionRequestOralDiet;
    supplement?: NutritionRequestSupplement[];
    enteralFormula?: NutritionRequestEnteralFormula;
  }
  interface NutritionRequestOralDiet extends Element {
    type?: CodeableConcept[];
    schedule?: Timing[];
    nutrient?: NutritionRequestOralDietNutrient[];
    texture?: NutritionRequestOralDietTexture[];
    fluidConsistencyType?: CodeableConcept[];
    instruction?: string;
  }
  interface NutritionRequestOralDietNutrient extends Element {
    modifier?: CodeableConcept;
    amount?: Quantity;
  }
  interface NutritionRequestOralDietTexture extends Element {
    modifier?: CodeableConcept;
    foodType?: CodeableConcept;
  }
  interface NutritionRequestSupplement extends Element {
    type?: CodeableConcept;
    productName?: string;
    schedule?: Timing[];
    quantity?: Quantity;
    instruction?: string;
  }
  interface NutritionRequestEnteralFormula extends Element {
    baseFormulaType?: CodeableConcept;
    baseFormulaProductName?: string;
    additiveType?: CodeableConcept;
    additiveProductName?: string;
    caloricDensity?: Quantity;
    routeofAdministration?: CodeableConcept;
    administration?: NutritionRequestEnteralFormulaAdministration[];
    maxVolumeToDeliver?: Quantity;
    administrationInstruction?: string;
  }
  interface NutritionRequestEnteralFormulaAdministration extends Element {
    schedule?: Timing;
    quantity?: Quantity;
    rateQuantity?: Quantity;
    rateRatio?: Ratio;
  }
  interface Observation extends DomainResource {
    identifier?: Identifier[];
    status: code;
    category?: CodeableConcept[];
    code: CodeableConcept;
    subject: Reference;
    context?: Reference;
    effectiveDateTime?: dateTime;
    effectivePeriod?: Period;
    effectiveInstant?: instant;
    effectiveTiming?: Timing;
    issued?: instant;
    performer?: Reference[];
    valueQuantity?: Quantity;
    valueCodeableConcept?: CodeableConcept;
    valueString?: string;
    valueBoolean?: boolean;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueSampledData?: SampledData;
    valueAttachment?: Attachment;
    valueTime?: time;
    valueDateTime?: dateTime;
    valuePeriod?: Period;
    dataAbsentReason?: CodeableConcept;
    interpretation?: CodeableConcept[];
    comment?: string;
    bodySite?: CodeableConcept;
    method?: CodeableConcept;
    specimen?: Reference;
    device?: Reference;
    referenceRange?: ObservationReferenceRange[];
    related?: ObservationRelated[];
    component?: ObservationComponent[];
    encounter?: Reference;
  }
  interface ObservationReferenceRange extends Element {
    low?: Quantity;
    high?: Quantity;
    meaning?: CodeableConcept[];
    age?: Range;
    text?: string;
  }
  interface ObservationRelated extends Element {
    type?: code;
    target: Reference;
  }
  interface ObservationComponent extends Element {
    code: CodeableConcept;
    valueQuantity?: Quantity;
    valueCodeableConcept?: CodeableConcept;
    valueString?: string;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueSampledData?: SampledData;
    valueAttachment?: Attachment;
    valueTime?: time;
    valueDateTime?: dateTime;
    valuePeriod?: Period;
    dataAbsentReason?: CodeableConcept;
    interpretation?: CodeableConcept[];
    referenceRange?: ObservationReferenceRange[];
  }
  interface OperationDefinition extends DomainResource {
    url?: uri;
    version?: string;
    name: string;
    status: code;
    kind: code;
    experimental?: boolean;
    date?: dateTime;
    publisher?: string;
    contact?: ContactDetail[];
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    idempotent?: boolean;
    code: code;
    comment?: string;
    base?: Reference;
    resource?: code[];
    system: boolean;
    type: boolean;
    instance: boolean;
    parameter?: OperationDefinitionParameter[];
    overload?: OperationDefinitionOverload[];
  }
  interface OperationDefinitionParameter extends Element {
    name: code;
    use: code;
    min: integer;
    max: string;
    documentation?: string;
    type?: code;
    searchType?: code;
    profile?: Reference;
    binding?: OperationDefinitionParameterBinding;
    part?: OperationDefinitionParameter[];
  }
  interface OperationDefinitionParameterBinding extends Element {
    strength: code;
    valueSetUri?: uri;
    valueSetReference?: Reference;
  }
  interface OperationDefinitionOverload extends Element {
    parameterName?: string[];
    comment?: string;
  }
  interface OperationOutcome extends DomainResource {
    issue: OperationOutcomeIssue[];
  }
  interface OperationOutcomeIssue extends Element {
    severity: code;
    code: code;
    details?: CodeableConcept;
    diagnostics?: string;
    location?: string[];
    expression?: string[];
  }
  interface Organization extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    type?: CodeableConcept[];
    name?: string;
    alias?: string[];
    telecom?: ContactPoint[];
    address?: Address[];
    partOf?: Reference;
    contact?: OrganizationContact[];
    endpoint?: Reference[];
  }
  interface OrganizationContact extends Element {
    purpose?: CodeableConcept;
    name?: HumanName;
    telecom?: ContactPoint[];
    address?: Address;
  }
  interface Parameters extends ResourceBase {
    parameter?: ParametersParameter[];
  }
  interface ParametersParameter extends Element {
    name: string;
    valueBase64Binary?: base64Binary;
    valueBoolean?: boolean;
    valueCode?: code;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueDecimal?: decimal;
    valueId?: id;
    valueInstant?: instant;
    valueInteger?: integer;
    valueMarkdown?: markdown;
    valueOid?: oid;
    valuePositiveInt?: positiveInt;
    valueString?: string;
    valueTime?: time;
    valueUnsignedInt?: unsignedInt;
    valueUri?: uri;
    valueAddress?: Address;
    valueAge?: Age;
    valueAnnotation?: Annotation;
    valueAttachment?: Attachment;
    valueCodeableConcept?: CodeableConcept;
    valueCoding?: Coding;
    valueContactPoint?: ContactPoint;
    valueCount?: Count;
    valueDistance?: Distance;
    valueDuration?: Duration;
    valueHumanName?: HumanName;
    valueIdentifier?: Identifier;
    valueMoney?: Money;
    valuePeriod?: Period;
    valueQuantity?: Quantity;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueReference?: Reference;
    valueSampledData?: SampledData;
    valueSignature?: Signature;
    valueTiming?: Timing;
    valueMeta?: Meta;
    resource?: any;
    part?: ParametersParameter[];
  }
  interface Patient extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: code;
    birthDate?: date;
    deceasedBoolean?: boolean;
    deceasedDateTime?: dateTime;
    address?: Address[];
    maritalStatus?: CodeableConcept;
    multipleBirthBoolean?: boolean;
    multipleBirthInteger?: integer;
    photo?: Attachment[];
    contact?: PatientContact[];
    animal?: PatientAnimal;
    communication?: PatientCommunication[];
    generalPractitioner?: Reference[];
    managingOrganization?: Reference;
    link?: PatientLink[];
  }
  interface PatientContact extends Element {
    relationship?: CodeableConcept[];
    name?: HumanName;
    telecom?: ContactPoint[];
    address?: Address;
    gender?: code;
    organization?: Reference;
    period?: Period;
  }
  interface PatientAnimal extends Element {
    species: CodeableConcept;
    breed?: CodeableConcept;
    genderStatus?: CodeableConcept;
  }
  interface PatientCommunication extends Element {
    language: CodeableConcept;
    preferred?: boolean;
  }
  interface PatientLink extends Element {
    other: Reference;
    type: code;
  }
  interface PaymentNotice extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    request?: Reference;
    response?: Reference;
    statusDate?: date;
    created?: dateTime;
    target?: Reference;
    provider?: Reference;
    organization?: Reference;
    paymentStatus?: CodeableConcept;
  }
  interface PaymentReconciliation extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    period?: Period;
    created?: dateTime;
    organization?: Reference;
    request?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    requestProvider?: Reference;
    requestOrganization?: Reference;
    detail?: PaymentReconciliationDetail[];
    form?: CodeableConcept;
    total?: Money;
    note?: PaymentReconciliationNote[];
  }
  interface PaymentReconciliationDetail extends Element {
    type: CodeableConcept;
    request?: Reference;
    response?: Reference;
    submitter?: Reference;
    payee?: Reference;
    date?: date;
    amount?: Money;
  }
  interface PaymentReconciliationNote extends Element {
    type?: CodeableConcept;
    text?: string;
  }
  interface Person extends DomainResource {
    identifier?: Identifier[];
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: code;
    birthDate?: date;
    address?: Address[];
    photo?: Attachment;
    managingOrganization?: Reference;
    active?: boolean;
    link?: PersonLink[];
  }
  interface PersonLink extends Element {
    target: Reference;
    assurance?: code;
  }
  interface PlanDefinition extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    type?: CodeableConcept;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    usage?: string;
    approvalDate?: date;
    lastReviewDate?: date;
    effectivePeriod?: Period;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    topic?: CodeableConcept[];
    contributor?: Contributor[];
    publisher?: string;
    contact?: ContactDetail[];
    copyright?: markdown;
    relatedArtifact?: RelatedArtifact[];
    library?: Reference[];
    actionDefinition?: PlanDefinitionActionDefinition[];
  }
  interface PlanDefinitionActionDefinition extends Element {
    actionIdentifier?: Identifier;
    label?: string;
    title?: string;
    description?: string;
    textEquivalent?: string;
    code?: CodeableConcept[];
    documentation?: RelatedArtifact[];
    triggerDefinition?: TriggerDefinition[];
    condition?: PlanDefinitionActionDefinitionCondition[];
    input?: DataRequirement[];
    output?: DataRequirement[];
    relatedAction?: PlanDefinitionActionDefinitionRelatedAction[];
    timingDateTime?: dateTime;
    timingPeriod?: Period;
    timingDuration?: Duration;
    timingRange?: Range;
    timingTiming?: Timing;
    participantType?: code[];
    type?: Coding;
    groupingBehavior?: code;
    selectionBehavior?: code;
    requiredBehavior?: code;
    precheckBehavior?: code;
    cardinalityBehavior?: code;
    activityDefinition?: Reference;
    transform?: Reference;
    dynamicValue?: PlanDefinitionActionDefinitionDynamicValue[];
    actionDefinition?: PlanDefinitionActionDefinition[];
  }
  interface PlanDefinitionActionDefinitionCondition extends Element {
    kind: code;
    description?: string;
    language?: string;
    expression?: string;
  }
  interface PlanDefinitionActionDefinitionRelatedAction extends Element {
    actionIdentifier: Identifier;
    relationship: code;
    offsetDuration?: Duration;
    offsetRange?: Range;
  }
  interface PlanDefinitionActionDefinitionDynamicValue extends Element {
    description?: string;
    path?: string;
    language?: string;
    expression?: string;
  }
  interface Practitioner extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
    telecom?: ContactPoint[];
    address?: Address[];
    gender?: code;
    birthDate?: date;
    photo?: Attachment[];
    role?: PractitionerRole[];
    qualification?: PractitionerQualification[];
    communication?: CodeableConcept[];
  }
  interface PractitionerRole extends Element {
    organization?: Reference;
    code?: CodeableConcept;
    specialty?: CodeableConcept[];
    identifier?: Identifier[];
    telecom?: ContactPoint[];
    period?: Period;
    location?: Reference[];
    healthcareService?: Reference[];
    endpoint?: Reference[];
  }
  interface PractitionerQualification extends Element {
    identifier?: Identifier[];
    code: CodeableConcept;
    period?: Period;
    issuer?: Reference;
  }
  interface Procedure extends DomainResource {
    identifier?: Identifier[];
    status: code;
    notDone?: boolean;
    notDoneReason?: CodeableConcept;
    category?: CodeableConcept;
    code?: CodeableConcept;
    subject: Reference;
    context?: Reference;
    performedDateTime?: dateTime;
    performedPeriod?: Period;
    performer?: ProcedurePerformer[];
    location?: Reference;
    reasonReference?: Reference[];
    reasonCode?: CodeableConcept[];
    bodySite?: CodeableConcept[];
    outcome?: CodeableConcept;
    report?: Reference[];
    complication?: CodeableConcept[];
    complicationDetail?: Reference[];
    followUp?: CodeableConcept[];
    note?: Annotation[];
    focalDevice?: ProcedureFocalDevice[];
    usedReference?: Reference[];
    usedCode?: CodeableConcept[];
  }
  interface ProcedurePerformer extends Element {
    actor: Reference;
    role?: CodeableConcept;
    onBehalfOf?: Reference;
  }
  interface ProcedureFocalDevice extends Element {
    action?: CodeableConcept;
    manipulated: Reference;
  }
  interface ProcedureRequest extends DomainResource {
    identifier?: Identifier[];
    subject: Reference;
    code: CodeableConcept;
    bodySite?: CodeableConcept[];
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    occurrenceDateTime?: dateTime;
    occurrencePeriod?: Period;
    occurrenceTiming?: Timing;
    encounter?: Reference;
    performer?: Reference;
    status?: code;
    intent?: string;
    supportingInfo?: Reference[];
    notes?: Annotation[];
    asNeededBoolean?: boolean;
    asNeededCodeableConcept?: CodeableConcept;
    orderedOn?: dateTime;
    requester?: ProcedureRequestRequester;
    priority?: code;
  }
  interface ProcedureRequestRequester extends Element {
    agent?: Reference;
    onBehalfOf?: Reference;
  }
  interface ProcessRequest extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    action?: code;
    target?: Reference;
    created?: dateTime;
    provider?: Reference;
    organization?: Reference;
    request?: Reference;
    response?: Reference;
    nullify?: boolean;
    reference?: string;
    item?: ProcessRequestItem[];
    include?: string[];
    exclude?: string[];
    period?: Period;
  }
  interface ProcessRequestItem extends Element {
    sequenceLinkId: integer;
  }
  interface ProcessResponse extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    created?: dateTime;
    organization?: Reference;
    request?: Reference;
    outcome?: CodeableConcept;
    disposition?: string;
    requestProvider?: Reference;
    requestOrganization?: Reference;
    form?: CodeableConcept;
    note?: ProcessResponseNote[];
    error?: CodeableConcept[];
    communicationRequest?: Reference[];
  }
  interface ProcessResponseNote extends Element {
    type?: CodeableConcept;
    text?: string;
  }
  interface Provenance extends DomainResource {
    target: Reference[];
    period?: Period;
    recorded: instant;
    reason?: Coding[];
    activity?: Coding;
    location?: Reference;
    policy?: uri[];
    agent: ProvenanceAgent[];
    entity?: ProvenanceEntity[];
    signature?: Signature[];
  }
  interface ProvenanceAgent extends Element {
    role: Coding;
    whoUri?: uri;
    whoReference?: Reference;
    onBehalfOfUri?: uri;
    onBehalfOfReference?: Reference;
    relatedAgentType?: CodeableConcept;
  }
  interface ProvenanceEntity extends Element {
    role: code;
    reference: Reference;
    agent?: ProvenanceAgent[];
  }
  interface Questionnaire extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    name?: string;
    version?: string;
    status: code;
    date?: dateTime;
    publisher?: string;
    telecom?: ContactPoint[];
    useContext?: CodeableConcept[];
    title?: string;
    concept?: Coding[];
    subjectType?: code[];
    item?: QuestionnaireItem[];
  }
  interface QuestionnaireItem extends Element {
    linkId: string;
    definition?: uri;
    code?: Coding[];
    prefix?: string;
    text?: string;
    type?: code;
    enableWhen?: QuestionnaireItemEnableWhen[];
    required?: boolean;
    repeats?: boolean;
    readOnly?: boolean;
    maxLength?: integer;
    options?: Reference;
    option?: QuestionnaireItemOption[];
    initialBoolean?: boolean;
    initialDecimal?: decimal;
    initialInteger?: integer;
    initialDate?: date;
    initialDateTime?: dateTime;
    initialInstant?: instant;
    initialTime?: time;
    initialString?: string;
    initialUri?: uri;
    initialAttachment?: Attachment;
    initialCoding?: Coding;
    initialQuantity?: Quantity;
    initialReference?: Reference;
    item?: QuestionnaireItem[];
  }
  interface QuestionnaireItemEnableWhen extends Element {
    question: string;
    hasAnswer?: boolean;
    answerBoolean?: boolean;
    answerDecimal?: decimal;
    answerInteger?: integer;
    answerDate?: date;
    answerDateTime?: dateTime;
    answerInstant?: instant;
    answerTime?: time;
    answerString?: string;
    answerUri?: uri;
    answerAttachment?: Attachment;
    answerCoding?: Coding;
    answerQuantity?: Quantity;
    answerReference?: Reference;
  }
  interface QuestionnaireItemOption extends Element {
    valueInteger?: integer;
    valueDate?: date;
    valueTime?: time;
    valueString?: string;
    valueCoding?: Coding;
  }
  interface QuestionnaireResponse extends DomainResource {
    identifier?: Identifier;
    basedOn?: Reference[];
    parent?: Reference[];
    questionnaire?: Reference;
    status: code;
    subject?: Reference;
    context?: Reference;
    author?: Reference;
    authored?: dateTime;
    source?: Reference;
    item?: QuestionnaireResponseItem[];
  }
  interface QuestionnaireResponseItem extends Element {
    linkId: string;
    definition?: uri;
    text?: string;
    subject?: Reference;
    answer?: QuestionnaireResponseItemAnswer[];
    item?: QuestionnaireResponseItem[];
  }
  interface QuestionnaireResponseItemAnswer extends Element {
    valueBoolean?: boolean;
    valueDecimal?: decimal;
    valueInteger?: integer;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueInstant?: instant;
    valueTime?: time;
    valueString?: string;
    valueUri?: uri;
    valueAttachment?: Attachment;
    valueCoding?: Coding;
    valueQuantity?: Quantity;
    valueReference?: Reference;
    item?: QuestionnaireResponseItem[];
  }
  interface ReferralRequest extends DomainResource {
    identifier?: Identifier[];
    basedOn?: Reference[];
    parent?: Identifier;
    status: code;
    intent: code;
    category: code;
    type?: CodeableConcept;
    priority?: code;
    subject: Reference;
    context?: Reference;
    occurrenceDateTime: dateTime;
    occurrencePeriod?: Period;
    authoredOn?: dateTime;
    requester?: ReferralRequestRequester;
    specialty?: CodeableConcept;
    recipient?: Reference[];
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    description?: string;
    serviceRequested?: CodeableConcept[];
    supportingInformation?: Reference[];
    note?: Annotation[];
  }
  interface ReferralRequestRequester extends Element {
    agent?: Reference;
    onBehalfOf?: Reference;
  }
  interface RelatedPerson extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    patient: Reference;
    relationship?: CodeableConcept;
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: code;
    birthDate?: date;
    address?: Address[];
    photo?: Attachment[];
    period?: Period;
  }
  interface RequestGroup extends DomainResource {
    identifier?: Identifier;
    subject?: Reference;
    context?: Reference;
    occurrenceDateTime?: dateTime;
    author?: Reference;
    reasonCodeableConcept?: CodeableConcept;
    reasonReference?: Reference;
    note?: Annotation[];
    action?: RequestGroupAction[];
  }
  interface RequestGroupAction extends Element {
    actionIdentifier?: Identifier;
    label?: string;
    title?: string;
    description?: string;
    textEquivalent?: string;
    code?: CodeableConcept[];
    documentation?: RelatedArtifact[];
    condition?: RequestGroupActionCondition[];
    relatedAction?: RequestGroupActionRelatedAction[];
    timingDateTime?: dateTime;
    timingPeriod?: Period;
    timingDuration?: Duration;
    timingRange?: Range;
    timingTiming?: Timing;
    participant?: Reference[];
    type?: Coding;
    groupingBehavior?: code;
    selectionBehavior?: code;
    requiredBehavior?: code;
    precheckBehavior?: code;
    cardinalityBehavior?: code;
    resource?: Reference;
    action?: RequestGroupAction[];
  }
  interface RequestGroupActionCondition extends Element {
    kind: code;
    description?: string;
    language?: string;
    expression?: string;
  }
  interface RequestGroupActionRelatedAction extends Element {
    actionIdentifier: Identifier;
    relationship: code;
    offsetDuration?: Duration;
    offsetRange?: Range;
  }
  interface ResearchStudy extends DomainResource {
    identifier?: Identifier[];
    title?: string;
    protocol?: Reference[];
    partOf?: Reference[];
    status: code;
    category?: CodeableConcept[];
    focus?: CodeableConcept[];
    contact?: ContactDetail[];
    relatedArtifact?: RelatedArtifact[];
    keyword?: CodeableConcept[];
    jurisdiction?: CodeableConcept[];
    description?: markdown;
    enrollment?: Reference[];
    period?: Period;
    sponsor?: Reference;
    principalInvestigator?: Reference;
    site?: Reference[];
    reasonStopped?: CodeableConcept;
    note?: Annotation[];
    arm?: ResearchStudyArm[];
  }
  interface ResearchStudyArm extends Element {
    name: string;
    code?: CodeableConcept;
    description?: string;
  }
  interface ResearchSubject extends DomainResource {
    identifier?: Identifier;
    status: code;
    period?: Period;
    study: Reference;
    individual: Reference;
    assignedArm?: string;
    actualArm?: string;
    consent?: Reference;
  }
  interface RiskAssessment extends DomainResource {
    identifier?: Identifier;
    basedOn?: Reference;
    parent?: Reference;
    status: code;
    code?: CodeableConcept;
    subject?: Reference;
    context?: Reference;
    occurrenceDateTime?: dateTime;
    occurrencePeriod?: Period;
    condition?: Reference;
    performer?: Reference;
    reasonCodeableConcept?: CodeableConcept;
    reasonReference?: Reference;
    method?: CodeableConcept;
    basis?: Reference[];
    prediction?: RiskAssessmentPrediction[];
    mitigation?: string;
    note?: Annotation;
  }
  interface RiskAssessmentPrediction extends Element {
    outcome: CodeableConcept;
    probabilityDecimal?: decimal;
    probabilityRange?: Range;
    probabilityCodeableConcept?: CodeableConcept;
    relativeRisk?: decimal;
    whenPeriod?: Period;
    whenRange?: Range;
    rationale?: string;
  }
  interface Schedule extends DomainResource {
    identifier?: Identifier[];
    active?: boolean;
    serviceCategory?: CodeableConcept;
    serviceType?: CodeableConcept[];
    specialty?: CodeableConcept[];
    actor: Reference;
    planningHorizon?: Period;
    comment?: string;
  }
  interface SearchParameter extends DomainResource {
    url: uri;
    version?: string;
    name: string;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    publisher?: string;
    contact?: ContactDetail[];
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    code: code;
    base: code[];
    type: code;
    derivedFrom?: uri;
    description: markdown;
    expression?: string;
    xpath?: string;
    xpathUsage?: code;
    target?: code[];
    comparator?: code[];
    modifier?: code[];
    chain?: string[];
    component?: SearchParameterComponent[];
  }
  interface SearchParameterComponent extends Element {
    definition: Reference;
    expression: string;
  }
  interface Sequence extends DomainResource {
    identifier?: Identifier[];
    type?: code;
    coordinateSystem: integer;
    patient?: Reference;
    specimen?: Reference;
    device?: Reference;
    performer?: Reference;
    quantity?: Quantity;
    referenceSeq?: SequenceReferenceSeq;
    variant?: SequenceVariant[];
    observedSeq?: string;
    quality?: SequenceQuality[];
    readCoverage?: integer;
    repository?: SequenceRepository[];
    pointer?: Reference[];
    structureVariant?: SequenceStructureVariant[];
  }
  interface SequenceReferenceSeq extends Element {
    chromosome?: CodeableConcept;
    genomeBuild?: string;
    referenceSeqId?: CodeableConcept;
    referenceSeqPointer?: Reference;
    referenceSeqString?: string;
    strand?: integer;
    windowStart: integer;
    windowEnd: integer;
  }
  interface SequenceVariant extends Element {
    start?: integer;
    end?: integer;
    observedAllele?: string;
    referenceAllele?: string;
    cigar?: string;
    variantPointer?: Reference;
  }
  interface SequenceQuality extends Element {
    type: code;
    standardSequence?: CodeableConcept;
    start?: integer;
    end?: integer;
    score?: Quantity;
    method?: CodeableConcept;
    truthTP?: decimal;
    queryTP?: decimal;
    truthFN?: decimal;
    queryFP?: decimal;
    gtFP?: decimal;
    precision?: decimal;
    recall?: decimal;
    fScore?: decimal;
  }
  interface SequenceRepository extends Element {
    type: code;
    url?: uri;
    name?: string;
    datasetId?: string;
    variantsetId?: string;
    readsetId?: string;
  }
  interface SequenceStructureVariant extends Element {
    precisionOfBoundaries?: string;
    reportedaCGHRatio?: decimal;
    length?: integer;
    outer?: SequenceStructureVariantOuter;
    inner?: SequenceStructureVariantInner;
  }
  interface SequenceStructureVariantOuter extends Element {
    start?: integer;
    end?: integer;
  }
  interface SequenceStructureVariantInner extends Element {
    start?: integer;
    end?: integer;
  }
  interface ServiceDefinition extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    date?: dateTime;
    description?: markdown;
    purpose?: markdown;
    usage?: string;
    approvalDate?: date;
    lastReviewDate?: date;
    effectivePeriod?: Period;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    topic?: CodeableConcept[];
    contributor?: Contributor[];
    publisher?: string;
    contact?: ContactDetail[];
    copyright?: markdown;
    relatedArtifact?: RelatedArtifact[];
    trigger?: TriggerDefinition[];
    dataRequirement?: DataRequirement[];
    operationDefinition?: Reference;
  }
  interface Slot extends DomainResource {
    identifier?: Identifier[];
    serviceCategory?: CodeableConcept;
    serviceType?: CodeableConcept[];
    specialty?: CodeableConcept[];
    appointmentType?: CodeableConcept;
    schedule: Reference;
    status: code;
    start: instant;
    end: instant;
    overbooked?: boolean;
    comment?: string;
  }
  interface Specimen extends DomainResource {
    identifier?: Identifier[];
    accessionIdentifier?: Identifier;
    status?: code;
    type?: CodeableConcept;
    subject: Reference;
    receivedTime?: dateTime;
    parent?: Reference[];
    request?: Reference[];
    collection?: SpecimenCollection;
    treatment?: SpecimenTreatment[];
    container?: SpecimenContainer[];
    note?: Annotation[];
  }
  interface SpecimenCollection extends Element {
    collector?: Reference;
    collectedDateTime?: dateTime;
    collectedPeriod?: Period;
    quantity?: Quantity;
    method?: CodeableConcept;
    bodySite?: CodeableConcept;
  }
  interface SpecimenTreatment extends Element {
    description?: string;
    procedure?: CodeableConcept;
    additive?: Reference[];
    timeDateTime?: dateTime;
    timePeriod?: Period;
  }
  interface SpecimenContainer extends Element {
    identifier?: Identifier[];
    description?: string;
    type?: CodeableConcept;
    capacity?: Quantity;
    specimenQuantity?: Quantity;
    additiveCodeableConcept?: CodeableConcept;
    additiveReference?: Reference;
  }
  interface StructureDefinition extends DomainResource {
    url: uri;
    identifier?: Identifier[];
    version?: string;
    name: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    keyword?: Coding[];
    fhirVersion?: id;
    mapping?: StructureDefinitionMapping[];
    kind: code;
    abstract: boolean;
    contextType?: code;
    context?: string[];
    contextInvariant?: string[];
    type: code;
    baseDefinition?: uri;
    derivation?: code;
    snapshot?: StructureDefinitionSnapshot;
    differential?: StructureDefinitionDifferential;
  }
  interface StructureDefinitionMapping extends Element {
    identity: id;
    uri?: uri;
    name?: string;
    comments?: string;
  }
  interface StructureDefinitionSnapshot extends Element {
    element: ElementDefinition[];
  }
  interface StructureDefinitionDifferential extends Element {
    element: ElementDefinition[];
  }
  interface StructureMap extends DomainResource {
    url: uri;
    identifier?: Identifier[];
    version?: string;
    name: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    structure?: StructureMapStructure[];
    import?: uri[];
    group: StructureMapGroup[];
  }
  interface StructureMapStructure extends Element {
    url: uri;
    mode: code;
    documentation?: string;
  }
  interface StructureMapGroup extends Element {
    name: id;
    extends?: id;
    documentation?: string;
    input: StructureMapGroupInput[];
    rule: StructureMapGroupRule[];
  }
  interface StructureMapGroupInput extends Element {
    name: id;
    type?: string;
    mode: code;
    documentation?: string;
  }
  interface StructureMapGroupRule extends Element {
    name: id;
    source: StructureMapGroupRuleSource[];
    target?: StructureMapGroupRuleTarget[];
    rule?: StructureMapGroupRule[];
    dependent?: StructureMapGroupRuleDependent[];
    documentation?: string;
  }
  interface StructureMapGroupRuleSource extends Element {
    required: boolean;
    context: id;
    contextType: code;
    min?: integer;
    max?: string;
    type?: string;
    element?: string;
    listMode?: code;
    variable?: id;
    condition?: string;
    check?: string;
  }
  interface StructureMapGroupRuleTarget extends Element {
    context?: id;
    contextType?: code;
    element?: string;
    variable?: id;
    listMode?: code[];
    listRuleId?: id;
    transform?: code;
    parameter?: StructureMapGroupRuleTargetParameter[];
  }
  interface StructureMapGroupRuleTargetParameter extends Element {
    valueId?: id;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: integer;
    valueDecimal?: decimal;
  }
  interface StructureMapGroupRuleDependent extends Element {
    name: id;
    variable: string[];
  }
  interface Subscription extends DomainResource {
    criteria: string;
    contact?: ContactPoint[];
    reason: string;
    status: code;
    error?: string;
    channel: SubscriptionChannel;
    end?: instant;
    tag?: Coding[];
  }
  interface SubscriptionChannel extends Element {
    type: code;
    endpoint?: uri;
    payload?: string;
    header?: string;
  }
  interface Substance extends DomainResource {
    identifier?: Identifier[];
    category?: CodeableConcept[];
    code: CodeableConcept;
    description?: string;
    instance?: SubstanceInstance[];
    ingredient?: SubstanceIngredient[];
  }
  interface SubstanceInstance extends Element {
    identifier?: Identifier;
    expiry?: dateTime;
    quantity?: Quantity;
  }
  interface SubstanceIngredient extends Element {
    quantity?: Ratio;
    substanceCodeableConcept?: CodeableConcept;
    substanceReference?: Reference;
  }
  interface SupplyDelivery extends DomainResource {
    identifier?: Identifier;
    status?: code;
    patient?: Reference;
    type?: CodeableConcept;
    quantity?: Quantity;
    suppliedItemCodeableConcept?: CodeableConcept;
    suppliedItemReference?: Reference;
    supplier?: Reference;
    whenPrepared?: Period;
    time?: dateTime;
    destination?: Reference;
    receiver?: Reference[];
  }
  interface SupplyRequest extends DomainResource {
    patient?: Reference;
    source?: Reference;
    date?: dateTime;
    identifier?: Identifier;
    status?: code;
    kind?: CodeableConcept;
    orderedItemCodeableConcept?: CodeableConcept;
    orderedItemReference?: Reference;
    supplier?: Reference[];
    reasonCodeableConcept?: CodeableConcept;
    reasonReference?: Reference;
    when?: SupplyRequestWhen;
  }
  interface SupplyRequestWhen extends Element {
    code?: CodeableConcept;
    schedule?: Timing;
  }
  interface Task extends DomainResource {
    identifier?: Identifier[];
    definitionUri?: uri;
    definitionReference?: Reference;
    basedOn?: Reference[];
    groupIdentifier?: Identifier;
    partOf?: Reference[];
    status: code;
    statusReason?: CodeableConcept;
    businessStatus?: CodeableConcept;
    intent: code;
    priority?: code;
    code?: CodeableConcept;
    description?: string;
    focus?: Reference;
    for?: Reference;
    context?: Reference;
    executionPeriod?: Period;
    authoredOn?: dateTime;
    lastModified?: dateTime;
    requester?: TaskRequester;
    performerType?: CodeableConcept[];
    owner?: Reference;
    reason?: CodeableConcept;
    note?: Annotation[];
    relevantHistory?: Reference[];
    restriction?: TaskRestriction;
    input?: TaskInput[];
    output?: TaskOutput[];
  }
  interface TaskRequester extends Element {
    agent: Reference;
    onBehalfOf?: Reference;
  }
  interface TaskRestriction extends Element {
    repetitions?: positiveInt;
    period?: Period;
    recipient?: Reference[];
  }
  interface TaskInput extends Element {
    type: CodeableConcept;
    valueBase64Binary?: base64Binary;
    valueBoolean?: boolean;
    valueCode?: code;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueDecimal?: decimal;
    valueId?: id;
    valueInstant?: instant;
    valueInteger?: integer;
    valueMarkdown?: markdown;
    valueOid?: oid;
    valuePositiveInt?: positiveInt;
    valueString?: string;
    valueTime?: time;
    valueUnsignedInt?: unsignedInt;
    valueUri?: uri;
    valueAddress?: Address;
    valueAge?: Age;
    valueAnnotation?: Annotation;
    valueAttachment?: Attachment;
    valueCodeableConcept?: CodeableConcept;
    valueCoding?: Coding;
    valueContactPoint?: ContactPoint;
    valueCount?: Count;
    valueDistance?: Distance;
    valueDuration?: Duration;
    valueHumanName?: HumanName;
    valueIdentifier?: Identifier;
    valueMoney?: Money;
    valuePeriod?: Period;
    valueQuantity?: Quantity;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueReference?: Reference;
    valueSampledData?: SampledData;
    valueSignature?: Signature;
    valueTiming?: Timing;
    valueMeta?: Meta;
  }
  interface TaskOutput extends Element {
    type: CodeableConcept;
    valueBase64Binary?: base64Binary;
    valueBoolean?: boolean;
    valueCode?: code;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueDecimal?: decimal;
    valueId?: id;
    valueInstant?: instant;
    valueInteger?: integer;
    valueMarkdown?: markdown;
    valueOid?: oid;
    valuePositiveInt?: positiveInt;
    valueString?: string;
    valueTime?: time;
    valueUnsignedInt?: unsignedInt;
    valueUri?: uri;
    valueAddress?: Address;
    valueAge?: Age;
    valueAnnotation?: Annotation;
    valueAttachment?: Attachment;
    valueCodeableConcept?: CodeableConcept;
    valueCoding?: Coding;
    valueContactPoint?: ContactPoint;
    valueCount?: Count;
    valueDistance?: Distance;
    valueDuration?: Duration;
    valueHumanName?: HumanName;
    valueIdentifier?: Identifier;
    valueMoney?: Money;
    valuePeriod?: Period;
    valueQuantity?: Quantity;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueReference?: Reference;
    valueSampledData?: SampledData;
    valueSignature?: Signature;
    valueTiming?: Timing;
    valueMeta?: Meta;
  }
  interface TestScript extends DomainResource {
    url: uri;
    identifier?: Identifier;
    version?: string;
    name: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    purpose?: markdown;
    copyright?: markdown;
    origin?: TestScriptOrigin[];
    destination?: TestScriptDestination[];
    metadata?: TestScriptMetadata;
    fixture?: TestScriptFixture[];
    profile?: Reference[];
    variable?: TestScriptVariable[];
    rule?: TestScriptRule[];
    ruleset?: TestScriptRuleset[];
    setup?: TestScriptSetup;
    test?: TestScriptTest[];
    teardown?: TestScriptTeardown;
  }
  interface TestScriptOrigin extends Element {
    index: integer;
    profile: Coding;
  }
  interface TestScriptDestination extends Element {
    index: integer;
    profile: Coding;
  }
  interface TestScriptMetadata extends Element {
    link?: TestScriptMetadataLink[];
    capability: TestScriptMetadataCapability[];
  }
  interface TestScriptMetadataLink extends Element {
    url: uri;
    description?: string;
  }
  interface TestScriptMetadataCapability extends Element {
    required?: boolean;
    validated?: boolean;
    description?: string;
    origin?: integer[];
    destination?: integer;
    link?: uri[];
    capabilities: Reference;
  }
  interface TestScriptFixture extends Element {
    autocreate?: boolean;
    autodelete?: boolean;
    resource?: Reference;
  }
  interface TestScriptVariable extends Element {
    name: string;
    defaultValue?: string;
    description?: string;
    expression?: string;
    headerField?: string;
    hint?: string;
    path?: string;
    sourceId?: id;
  }
  interface TestScriptRule extends Element {
    resource: Reference;
    param?: TestScriptRuleParam[];
  }
  interface TestScriptRuleParam extends Element {
    name: string;
    value?: string;
  }
  interface TestScriptRuleset extends Element {
    resource: Reference;
    rule: TestScriptRulesetRule[];
  }
  interface TestScriptRulesetRule extends Element {
    ruleId: id;
    param?: TestScriptRulesetRuleParam[];
  }
  interface TestScriptRulesetRuleParam extends Element {
    name: string;
    value?: string;
  }
  interface TestScriptSetup extends Element {
    action: TestScriptSetupAction[];
  }
  interface TestScriptSetupAction extends Element {
    operation?: TestScriptSetupActionOperation;
    assert?: TestScriptSetupActionAssert;
  }
  interface TestScriptSetupActionOperation extends Element {
    type?: Coding;
    resource?: code;
    label?: string;
    description?: string;
    accept?: code;
    contentType?: code;
    destination?: integer;
    encodeRequestUrl?: boolean;
    origin?: integer;
    params?: string;
    requestHeader?: TestScriptSetupActionOperationRequestHeader[];
    requestId?: id;
    responseId?: id;
    sourceId?: id;
    targetId?: id;
    url?: string;
  }
  interface TestScriptSetupActionOperationRequestHeader extends Element {
    field: string;
    value: string;
  }
  interface TestScriptSetupActionAssert extends Element {
    label?: string;
    description?: string;
    direction?: code;
    compareToSourceId?: string;
    compareToSourceExpression?: string;
    compareToSourcePath?: string;
    contentType?: code;
    expression?: string;
    headerField?: string;
    minimumId?: string;
    navigationLinks?: boolean;
    operator?: code;
    path?: string;
    requestURL?: string;
    resource?: code;
    response?: code;
    responseCode?: string;
    rule?: TestScriptSetupActionAssertRule;
    ruleset?: TestScriptSetupActionAssertRuleset;
    sourceId?: id;
    validateProfileId?: id;
    value?: string;
    warningOnly?: boolean;
  }
  interface TestScriptSetupActionAssertRule extends Element {
    ruleId: id;
    param?: TestScriptSetupActionAssertRuleParam[];
  }
  interface TestScriptSetupActionAssertRuleParam extends Element {
    name: string;
    value: string;
  }
  interface TestScriptSetupActionAssertRuleset extends Element {
    rulesetId: id;
    rule?: TestScriptSetupActionAssertRulesetRule[];
  }
  interface TestScriptSetupActionAssertRulesetRule extends Element {
    ruleId: id;
    param?: TestScriptSetupActionAssertRulesetRuleParam[];
  }
  interface TestScriptSetupActionAssertRulesetRuleParam extends Element {
    name: string;
    value: string;
  }
  interface TestScriptTest extends Element {
    name?: string;
    description?: string;
    action: TestScriptTestAction[];
  }
  interface TestScriptTestAction extends Element {
    operation?: TestScriptSetupActionOperation;
    assert?: TestScriptSetupActionAssert;
  }
  interface TestScriptTeardown extends Element {
    action: TestScriptTeardownAction[];
  }
  interface TestScriptTeardownAction extends Element {
    operation: TestScriptSetupActionOperation;
  }
  interface TestReport extends DomainResource {
    identifier?: Identifier;
    name?: string;
    status: code;
    score?: decimal;
    tester?: string;
    testScript: Reference;
    issued?: dateTime;
    participant?: TestReportParticipant[];
    setup?: TestReportSetup;
    test?: TestReportTest[];
    teardown?: TestReportTeardown;
  }
  interface TestReportParticipant extends Element {
    type: code;
    uri: uri;
    display?: string;
  }
  interface TestReportSetup extends Element {
    action: TestReportSetupAction[];
  }
  interface TestReportSetupAction extends Element {
    operation?: TestReportSetupActionOperation;
    assert?: TestReportSetupActionAssert;
  }
  interface TestReportSetupActionOperation extends Element {
    result: code;
    message?: markdown;
    detail?: uri;
  }
  interface TestReportSetupActionAssert extends Element {
    result: code;
    message?: markdown;
    detail?: string;
  }
  interface TestReportTest extends Element {
    name?: string;
    description?: string;
    action: TestReportTestAction[];
  }
  interface TestReportTestAction extends Element {
    operation?: TestReportSetupActionOperation;
    assert?: TestReportSetupActionAssert;
  }
  interface TestReportTeardown extends Element {
    action: TestReportTeardownAction[];
  }
  interface TestReportTeardownAction extends Element {
    operation: TestReportSetupActionOperation;
  }
  interface ValueSet extends DomainResource {
    url?: uri;
    identifier?: Identifier[];
    version?: string;
    name?: string;
    title?: string;
    status: code;
    experimental?: boolean;
    publisher?: string;
    contact?: ContactDetail[];
    date?: dateTime;
    description?: markdown;
    useContext?: UsageContext[];
    jurisdiction?: CodeableConcept[];
    immutable?: boolean;
    purpose?: markdown;
    copyright?: markdown;
    extensible?: boolean;
    compose?: ValueSetCompose;
    expansion?: ValueSetExpansion;
  }
  interface ValueSetCompose extends Element {
    lockedDate?: date;
    inactive?: boolean;
    include: ValueSetComposeInclude[];
    exclude?: ValueSetComposeInclude[];
  }
  interface ValueSetComposeInclude extends Element {
    system?: uri;
    version?: string;
    concept?: ValueSetComposeIncludeConcept[];
    filter?: ValueSetComposeIncludeFilter[];
    valueSet?: uri[];
  }
  interface ValueSetComposeIncludeConcept extends Element {
    code: code;
    display?: string;
    designation?: ValueSetComposeIncludeConceptDesignation[];
  }
  interface ValueSetComposeIncludeConceptDesignation extends Element {
    language?: code;
    use?: Coding;
    value: string;
  }
  interface ValueSetComposeIncludeFilter extends Element {
    property: code;
    op: code;
    value: code;
  }
  interface ValueSetExpansion extends Element {
    identifier: uri;
    timestamp: dateTime;
    total?: integer;
    offset?: integer;
    parameter?: ValueSetExpansionParameter[];
    contains?: ValueSetExpansionContains[];
  }
  interface ValueSetExpansionParameter extends Element {
    name: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: integer;
    valueDecimal?: decimal;
    valueUri?: uri;
    valueCode?: code;
  }
  interface ValueSetExpansionContains extends Element {
    system?: uri;
    abstract?: boolean;
    inactive?: boolean;
    version?: string;
    code?: code;
    display?: string;
    designation?: ValueSetComposeIncludeConceptDesignation[];
    contains?: ValueSetExpansionContains[];
  }
  interface VisionPrescription extends DomainResource {
    identifier?: Identifier[];
    status?: code;
    patient?: Reference;
    encounter?: Reference;
    dateWritten?: dateTime;
    prescriber?: Reference;
    reasonCodeableConcept?: CodeableConcept;
    reasonReference?: Reference;
    dispense?: VisionPrescriptionDispense[];
  }
  interface VisionPrescriptionDispense extends Element {
    product?: CodeableConcept;
    eye?: CodeableConcept;
    sphere?: decimal;
    cylinder?: decimal;
    axis?: integer;
    prism?: decimal;
    base?: CodeableConcept;
    add?: decimal;
    power?: decimal;
    backCurve?: decimal;
    diameter?: decimal;
    duration?: Quantity;
    color?: string;
    brand?: string;
    note?: string;
  }
  interface Address extends Element {
    use?: code;
    type?: code;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    period?: Period;
  }
  interface TriggerDefinition extends Element {
    type: code;
    eventName?: string;
    eventTimingTiming?: Timing;
    eventTimingReference?: Reference;
    eventTimingDate?: date;
    eventTimingDateTime?: dateTime;
    eventData?: DataRequirement;
  }
  interface Contributor extends Element {
    type: code;
    name: string;
    contact?: ContactDetail[];
  }
  interface Attachment extends Element {
    contentType?: code;
    language?: code;
    data?: base64Binary;
    url?: uri;
    size?: unsignedInt;
    hash?: base64Binary;
    title?: string;
    creation?: dateTime;
  }
  interface Duration extends Quantity {
  }
  interface Count extends Quantity {
  }
  interface DataRequirement extends Element {
    type: code;
    profile?: uri[];
    mustSupport?: string[];
    codeFilter?: DataRequirementCodeFilter[];
    dateFilter?: DataRequirementDateFilter[];
  }
  interface DataRequirementCodeFilter extends Element {
    path: string;
    valueSetString?: string;
    valueSetReference?: Reference;
    valueCode?: code[];
    valueCoding?: Coding[];
    valueCodeableConcept?: CodeableConcept[];
  }
  interface DataRequirementDateFilter extends Element {
    path: string;
    valueDateTime?: dateTime;
    valuePeriod?: Period;
    valueDuration?: Duration;
  }
  interface Range extends Element {
    low?: Quantity;
    high?: Quantity;
  }
  interface RelatedArtifact extends Element {
    type: code;
    display?: string;
    citation?: string;
    url?: uri;
    document?: Attachment;
    resource?: Reference;
  }
  interface Annotation extends Element {
    authorReference?: Reference;
    authorString?: string;
    time?: dateTime;
    text: string;
  }
  interface ContactDetail extends Element {
    name?: string;
    telecom?: ContactPoint[];
  }
  interface ContactPoint extends Element {
    system?: code;
    value?: string;
    use?: code;
    rank?: positiveInt;
    period?: Period;
  }
  interface HumanName extends Element {
    use?: code;
    text?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
    period?: Period;
  }
  interface Money extends Quantity {
  }
  interface Signature extends Element {
    type: Coding[];
    when: instant;
    whoUri?: uri;
    whoReference?: Reference;
    onBehalfOfUri?: uri;
    onBehalfOfReference?: Reference;
    contentType?: code;
    blob?: base64Binary;
  }
  interface SampledData extends Element {
    origin: Quantity;
    period: decimal;
    factor?: decimal;
    lowerLimit?: decimal;
    upperLimit?: decimal;
    dimensions: positiveInt;
    data: string;
  }
  interface Ratio extends Element {
    numerator?: Quantity;
    denominator?: Quantity;
  }
  interface Timing extends Element {
    event?: dateTime[];
    repeat?: TimingRepeat;
    code?: CodeableConcept;
  }
  interface TimingRepeat extends Element {
    boundsDuration?: Duration;
    boundsRange?: Range;
    boundsPeriod?: Period;
    count?: integer;
    countMax?: integer;
    duration?: decimal;
    durationMax?: decimal;
    durationUnit?: code;
    frequency?: integer;
    frequencyMax?: integer;
    period?: decimal;
    periodMax?: decimal;
    periodUnit?: code;
    dayOfWeek?: code[];
    timeOfDay?: time[];
    when?: code[];
    offset?: unsignedInt;
  }
  interface ElementDefinition extends Element {
    path: string;
    representation?: code[];
    sliceName?: string;
    label?: string;
    code?: Coding[];
    slicing?: ElementDefinitionSlicing;
    short?: string;
    definition?: markdown;
    comment?: markdown;
    requirements?: markdown;
    alias?: string[];
    min?: integer;
    max?: string;
    base?: ElementDefinitionBase;
    contentReference?: uri;
    type?: ElementDefinitionType[];
    defaultValueBase64Binary?: base64Binary;
    defaultValueBoolean?: boolean;
    defaultValueCode?: code;
    defaultValueDate?: date;
    defaultValueDateTime?: dateTime;
    defaultValueDecimal?: decimal;
    defaultValueId?: id;
    defaultValueInstant?: instant;
    defaultValueInteger?: integer;
    defaultValueMarkdown?: markdown;
    defaultValueOid?: oid;
    defaultValuePositiveInt?: positiveInt;
    defaultValueString?: string;
    defaultValueTime?: time;
    defaultValueUnsignedInt?: unsignedInt;
    defaultValueUri?: uri;
    defaultValueAddress?: Address;
    defaultValueAge?: Age;
    defaultValueAnnotation?: Annotation;
    defaultValueAttachment?: Attachment;
    defaultValueCodeableConcept?: CodeableConcept;
    defaultValueCoding?: Coding;
    defaultValueContactPoint?: ContactPoint;
    defaultValueCount?: Count;
    defaultValueDistance?: Distance;
    defaultValueDuration?: Duration;
    defaultValueHumanName?: HumanName;
    defaultValueIdentifier?: Identifier;
    defaultValueMoney?: Money;
    defaultValuePeriod?: Period;
    defaultValueQuantity?: Quantity;
    defaultValueRange?: Range;
    defaultValueRatio?: Ratio;
    defaultValueReference?: Reference;
    defaultValueSampledData?: SampledData;
    defaultValueSignature?: Signature;
    defaultValueTiming?: Timing;
    defaultValueMeta?: Meta;
    meaningWhenMissing?: markdown;
    fixedBase64Binary?: base64Binary;
    fixedBoolean?: boolean;
    fixedCode?: code;
    fixedDate?: date;
    fixedDateTime?: dateTime;
    fixedDecimal?: decimal;
    fixedId?: id;
    fixedInstant?: instant;
    fixedInteger?: integer;
    fixedMarkdown?: markdown;
    fixedOid?: oid;
    fixedPositiveInt?: positiveInt;
    fixedString?: string;
    fixedTime?: time;
    fixedUnsignedInt?: unsignedInt;
    fixedUri?: uri;
    fixedAddress?: Address;
    fixedAge?: Age;
    fixedAnnotation?: Annotation;
    fixedAttachment?: Attachment;
    fixedCodeableConcept?: CodeableConcept;
    fixedCoding?: Coding;
    fixedContactPoint?: ContactPoint;
    fixedCount?: Count;
    fixedDistance?: Distance;
    fixedDuration?: Duration;
    fixedHumanName?: HumanName;
    fixedIdentifier?: Identifier;
    fixedMoney?: Money;
    fixedPeriod?: Period;
    fixedQuantity?: Quantity;
    fixedRange?: Range;
    fixedRatio?: Ratio;
    fixedReference?: Reference;
    fixedSampledData?: SampledData;
    fixedSignature?: Signature;
    fixedTiming?: Timing;
    fixedMeta?: Meta;
    patternBase64Binary?: base64Binary;
    patternBoolean?: boolean;
    patternCode?: code;
    patternDate?: date;
    patternDateTime?: dateTime;
    patternDecimal?: decimal;
    patternId?: id;
    patternInstant?: instant;
    patternInteger?: integer;
    patternMarkdown?: markdown;
    patternOid?: oid;
    patternPositiveInt?: positiveInt;
    patternString?: string;
    patternTime?: time;
    patternUnsignedInt?: unsignedInt;
    patternUri?: uri;
    patternAddress?: Address;
    patternAge?: Age;
    patternAnnotation?: Annotation;
    patternAttachment?: Attachment;
    patternCodeableConcept?: CodeableConcept;
    patternCoding?: Coding;
    patternContactPoint?: ContactPoint;
    patternCount?: Count;
    patternDistance?: Distance;
    patternDuration?: Duration;
    patternHumanName?: HumanName;
    patternIdentifier?: Identifier;
    patternMoney?: Money;
    patternPeriod?: Period;
    patternQuantity?: Quantity;
    patternRange?: Range;
    patternRatio?: Ratio;
    patternReference?: Reference;
    patternSampledData?: SampledData;
    patternSignature?: Signature;
    patternTiming?: Timing;
    patternMeta?: Meta;
    example?: ElementDefinitionExample[];
    minValueDate?: date;
    minValueDateTime?: dateTime;
    minValueInstant?: instant;
    minValueTime?: time;
    minValueDecimal?: decimal;
    minValueInteger?: integer;
    minValuePositiveInt?: positiveInt;
    minValueUnsignedInt?: unsignedInt;
    minValueQuantity?: Quantity;
    maxValueDate?: date;
    maxValueDateTime?: dateTime;
    maxValueInstant?: instant;
    maxValueTime?: time;
    maxValueDecimal?: decimal;
    maxValueInteger?: integer;
    maxValuePositiveInt?: positiveInt;
    maxValueUnsignedInt?: unsignedInt;
    maxValueQuantity?: Quantity;
    maxLength?: integer;
    condition?: id[];
    constraint?: ElementDefinitionConstraint[];
    mustSupport?: boolean;
    isModifier?: boolean;
    isSummary?: boolean;
    binding?: ElementDefinitionBinding;
    mapping?: ElementDefinitionMapping[];
  }
  interface ElementDefinitionSlicing extends Element {
    discriminator?: string[];
    description?: string;
    ordered?: boolean;
    rules: code;
  }
  interface ElementDefinitionBase extends Element {
    path: string;
    min: integer;
    max: string;
  }
  interface ElementDefinitionType extends Element {
    code: uri;
    profile?: uri[];
    targetProfile?: uri[];
    aggregation?: code[];
    versioning?: code;
  }
  interface ElementDefinitionExample extends Element {
    label: string;
    valueBase64Binary?: base64Binary;
    valueBoolean?: boolean;
    valueCode?: code;
    valueDate?: date;
    valueDateTime?: dateTime;
    valueDecimal?: decimal;
    valueId?: id;
    valueInstant?: instant;
    valueInteger?: integer;
    valueMarkdown?: markdown;
    valueOid?: oid;
    valuePositiveInt?: positiveInt;
    valueString?: string;
    valueTime?: time;
    valueUnsignedInt?: unsignedInt;
    valueUri?: uri;
    valueAddress?: Address;
    valueAge?: Age;
    valueAnnotation?: Annotation;
    valueAttachment?: Attachment;
    valueCodeableConcept?: CodeableConcept;
    valueCoding?: Coding;
    valueContactPoint?: ContactPoint;
    valueCount?: Count;
    valueDistance?: Distance;
    valueDuration?: Duration;
    valueHumanName?: HumanName;
    valueIdentifier?: Identifier;
    valueMoney?: Money;
    valuePeriod?: Period;
    valueQuantity?: Quantity;
    valueRange?: Range;
    valueRatio?: Ratio;
    valueReference?: Reference;
    valueSampledData?: SampledData;
    valueSignature?: Signature;
    valueTiming?: Timing;
    valueMeta?: Meta;
  }
  interface ElementDefinitionConstraint extends Element {
    key: id;
    requirements?: string;
    severity: code;
    human: string;
    expression: string;
    xpath?: string;
    source?: uri;
  }
  interface ElementDefinitionBinding extends Element {
    strength: code;
    description?: string;
    valueSetUri?: uri;
    valueSetReference?: Reference;
  }
  interface ElementDefinitionMapping extends Element {
    identity: id;
    language?: code;
    map: string;
  }
  interface Age extends Quantity {
  }
  interface Distance extends Quantity {
  }
  interface DosageInstruction extends Element {
    sequence?: integer;
    text?: string;
    additionalInstructions?: CodeableConcept[];
    timing?: Timing;
    asNeededBoolean?: boolean;
    asNeededCodeableConcept?: CodeableConcept;
    site?: CodeableConcept;
    route?: CodeableConcept;
    method?: CodeableConcept;
    doseAndRate: DoseAndRateElement[];
    maxDosePerPeriod?: Ratio;
    maxDosePerAdministration?: Quantity;
    maxDosePerLifetime?: Quantity;
    rateRatio?: Ratio;
  }
  interface DoseAndRateElement extends Element {
    type?: CodeableConcept;
    doseRange?: Range;
    doseQuantity?: Quantity;
    rateRange?: Range;
    rateQuantity?: Quantity;
  }
  interface ParameterDefinition extends Element {
    name?: code;
    use: code;
    min?: integer;
    max?: string;
    documentation?: string;
    type: code;
    profile?: Reference;
  }
  interface ElementTree {
    label?: string
    value?: string
    definition?: string
    comment?: string
    short?: string
    min?: integer
    max?: string
    type?: ElementTree[]
    selectedType?: string
    noTick?: boolean
    children?: ElementTree[]
    lazy?: boolean // To dynamically fetch the structure of data type
    targetProfile?: string[]
    error?: boolean
    fixedUri?: string
    selectedUri?: string
  }
  type Resource = (DomainResource|Account|ActivityDefinition|AllergyIntolerance|Appointment|AppointmentResponse|
    AuditEvent|Basic|Binary|BodySite|Bundle|CarePlan|CareTeam|Claim|ClaimResponse|ClinicalImpression|CodeSystem|
    Communication|CommunicationRequest|CompartmentDefinition|Composition|ConceptMap|Condition|CapabilityStatement|
    Consent|Contract|Coverage|DataElement|DetectedIssue|Device|DeviceComponent|DeviceMetric|DeviceRequest|
    DeviceUseStatement|DiagnosticRequest|DiagnosticReport|DocumentManifest|DocumentReference|EligibilityRequest|
    EligibilityResponse|Encounter|Endpoint|EnrollmentRequest|EnrollmentResponse|EpisodeOfCare|ExpansionProfile|
    ExplanationOfBenefit|FamilyMemberHistory|Flag|Goal|Group|GuidanceResponse|HealthcareService|ImagingManifest|
    Immunization|ImmunizationRecommendation|ImplementationGuide|Library|Linkage|List|Location|Measure|MeasureReport|
    Media|Medication|MedicationAdministration|MedicationDispense|MedicationRequest|MedicationStatement|
    MessageDefinition|MessageHeader|NamingSystem|NutritionRequest|Observation|OperationDefinition|OperationOutcome|
    Organization|Parameters|Patient|PaymentNotice|PaymentReconciliation|Person|PlanDefinition|Practitioner|Procedure|
    ProcedureRequest|ProcessRequest|ProcessResponse|Provenance|Questionnaire|QuestionnaireResponse|ReferralRequest|
    RelatedPerson|RequestGroup|ResearchStudy|ResearchSubject|RiskAssessment|Schedule|SearchParameter|Sequence|
    ServiceDefinition|Slot|Specimen|StructureDefinition|StructureMap|Subscription|Substance|SupplyDelivery|
    SupplyRequest|Task|TestScript|TestReport|ValueSet|VisionPrescription);

}

interface Date {
  toISODateString (): string;
}

declare namespace ResourceGenerator {
  interface Payload {
    value: any,
    sourceType: string | undefined, // 'Text' | 'Date' | 'Number' | 'Boolean'
    targetField: string,
    targetSubFields: string[],
    fhirType?: string
  }
}

declare namespace store {
  interface MappingObject {
    date: string
    data: object
    name: string
    index: number
  }
  interface SavedRecord {
    fileName: string
    sheets: Sheet[]
  }
  interface Sheet {
    sheetName: string
    records: Record[]
  }
  interface Record {
    recordId: string
    resource: string
    profile: string
    data: SourceTargetGroup[]
  }
  interface SourceTargetGroup {
    type: string
    value: string
    target: Target[],
    conceptMap?: {id: string, name: string}
    defaultValue?: string
  }
  interface Target {
    resource: string
    profile: string
    value: string
    type?: string
    fixedUri?: string
  }
}

declare type status = 'success' | 'warning' | 'error' | 'in-progress' | 'pending' | 'validating' | 'transforming'

declare interface OutcomeDetail {
  status: status
  resourceType: string
  message: string
  outcomeDetails?: OutcomeDetail[]
}

declare interface TransformListItem {
  status: status
  resourceType: string
  count: number
  createdCount?: number
}

declare interface BufferResource {
  value: any
  sourceType: string
  targetType: string | undefined
  conceptMap?: fhir.ConceptMap
  fixedUri?: string
}

declare interface StepItem {
  title: string,
  icon: string,
  stepId: any
}

declare interface MenuItem {
  label: string
  submenu?: MenuItem[]
  separate?: boolean
  icon?: string
  action? (): void
}
