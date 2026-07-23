/**
 * Enhanced Document Generation with Answer-Based Customization
 * Generates legally compliant documents based on user answers
 */

import { invokeLLM } from "./_core/llm";

export interface DocumentGenerationContext {
  documentType: 'will' | 'poa-property' | 'poa-personal-care';
  answers: Record<string, any>;
  userTier: 'basic' | 'advanced';
}

export interface GeneratedDocument {
  title: string;
  content: string;
  sections: DocumentSection[];
  metadata: {
    generatedAt: Date;
    documentType: string;
    jurisdiction: 'Ontario';
    legalCompliance: string[];
  };
}

export interface DocumentSection {
  title: string;
  content: string;
  legalBasis?: string;
  conditional?: boolean;
}

// ============================================================================
// WILL DOCUMENT GENERATION
// ============================================================================

/**
 * Generate a customized will based on user answers
 */
export async function generateWillDocument(
  context: DocumentGenerationContext
): Promise<GeneratedDocument> {
  const { answers, userTier } = context;

  // Build sections based on answers
  const sections: DocumentSection[] = [];

  // 1. Title and Opening
  sections.push({
    title: 'TITLE',
    content: 'LAST WILL AND TESTAMENT',
  });

  // 2. Testator Information
  sections.push(
    buildTestatorSection(answers)
  );

  // 3. Revocation Clause
  sections.push({
    title: 'REVOCATION',
    content: `I hereby revoke and annul all former Wills, Codicils and Testamentary dispositions made by me and declare this only to be my Will.`,
    legalBasis: 'Succession Law Reform Act, s. 2',
  });

  // 4. Family Status Declaration
  if (answers.maritalStatus || answers.hasChildren === 'Yes') {
    sections.push(
      buildFamilyStatusSection(answers)
    );
  }

  // 5. Executor Appointment
  sections.push(
    buildExecutorSection(answers)
  );

  // 6. Powers of Executor
  sections.push({
    title: 'POWERS OF EXECUTOR',
    content: buildExecutorPowersClause(answers),
    legalBasis: 'Succession Law Reform Act, s. 36',
  });

  // 7. Guardianship (if applicable)
  if (answers.hasMinorChildren === 'Yes') {
    sections.push(
      buildGuardianshipSection(answers)
    );
  }

  // 8. Estate Distribution
  sections.push(
    buildDistributionSection(answers)
  );

  // 9. Specific Bequests (if applicable)
  if (answers.specificBequests) {
    sections.push(
      buildBequeststSection(answers)
    );
  }

  // 10. Trust Provisions (if applicable)
  if (answers.hasTrust === 'Yes' && userTier === 'advanced') {
    sections.push(
      buildTrustSection(answers)
    );
  }

  // 11. Charitable Donations (if applicable)
  if (answers.hasCharitableDonations === 'Yes' && userTier === 'advanced') {
    sections.push(
      buildCharitableSection(answers)
    );
  }

  // 12. Execution and Attestation
  sections.push({
    title: 'EXECUTION AND ATTESTATION',
    content: buildExecutionClause(answers),
    legalBasis: 'Succession Law Reform Act, s. 4',
  });

  // 13. Legal Disclaimer
  sections.push({
    title: 'LEGAL NOTICE',
    content: `This Will has been created in compliance with Ontario's Succession Law Reform Act and other applicable legislation. It is strongly recommended that this document be reviewed by a qualified lawyer before execution to ensure it meets all legal requirements and reflects your true wishes.`,
  });

  // Generate full content
  const content = sections
    .map((section) => {
      let text = `\n${section.title}\n`;
      text += '='.repeat(section.title.length) + '\n\n';
      text += section.content;
      if (section.legalBasis) {
        text += `\n\n[Legal Basis: ${section.legalBasis}]`;
      }
      return text;
    })
    .join('\n\n');

  return {
    title: `Last Will and Testament of ${answers.testatorFullName}`,
    content,
    sections,
    metadata: {
      generatedAt: new Date(),
      documentType: 'will',
      jurisdiction: 'Ontario',
      legalCompliance: [
        'Succession Law Reform Act',
        'Estates Act',
        'Common Law Requirements',
      ],
    },
  };
}

// ============================================================================
// SECTION BUILDERS
// ============================================================================

function buildTestatorSection(answers: Record<string, any>): DocumentSection {
  return {
    title: 'TESTATOR INFORMATION',
    content: `I, ${answers.testatorFullName}, of ${answers.testatorAddress}, being of sound mind and memory, do hereby make, publish and declare this to be my Last Will and Testament.`,
    legalBasis: 'Succession Law Reform Act, s. 1',
  };
}

function buildFamilyStatusSection(answers: Record<string, any>): DocumentSection {
  let content = 'For the purposes of this Will, I declare that:\n\n';

  if (answers.maritalStatus === 'Married' || answers.maritalStatus === 'Common-law partnership') {
    content += `1. I am ${answers.maritalStatus === 'Married' ? 'married to' : 'in a common-law partnership with'} ${answers.spouseName}.\n\n`;
  } else if (answers.maritalStatus === 'Divorced') {
    content += `1. I am divorced and not currently married or in a common-law partnership.\n\n`;
  } else if (answers.maritalStatus === 'Widowed') {
    content += `1. I am widowed and not currently married or in a common-law partnership.\n\n`;
  } else {
    content += `1. I am single and not currently married or in a common-law partnership.\n\n`;
  }

  if (answers.hasChildren === 'Yes') {
    content += `2. I have ${answers.numberOfChildren} child(ren). All references to "my children" in this Will refer to my biological, adopted, and step-children.`;
  }

  return {
    title: 'FAMILY STATUS',
    content,
    legalBasis: 'Succession Law Reform Act, s. 1(1)',
  };
}

function buildExecutorSection(answers: Record<string, any>): DocumentSection {
  let content = `I appoint ${answers.primaryExecutor} to be my Executor and Trustee.\n\n`;
  content += `Should ${answers.primaryExecutor} predecease me or be unable or unwilling to act, I appoint ${answers.alternateExecutor} to be my Executor and Trustee.\n\n`;

  if (answers.executorCompensation === 'No compensation') {
    content += `My Executor shall serve without compensation.`;
  } else if (answers.executorCompensation === 'Statutory fee (as per Succession Law Reform Act)') {
    content += `My Executor shall be entitled to reasonable compensation as provided by the Succession Law Reform Act.`;
  } else if (answers.executorCompensation === 'Fixed amount') {
    content += `My Executor shall receive a fixed fee of $${answers.executorCompensationAmount} for their services.`;
  } else if (answers.executorCompensation === 'Percentage of estate') {
    content += `My Executor shall receive compensation equal to [percentage]% of the gross estate value.`;
  }

  return {
    title: 'EXECUTOR APPOINTMENT',
    content,
    legalBasis: 'Succession Law Reform Act, s. 36',
  };
}

function buildExecutorPowersClause(answers: Record<string, any>): string {
  return `I give my Executor full power and authority to:

1. Sell, mortgage, pledge or lease any real or personal property forming part of my estate;
2. Invest and reinvest the proceeds in such securities as my Executor deems fit;
3. Collect all debts and monies due to my estate;
4. Pay all my debts, funeral expenses, and testamentary expenses;
5. Compromise or settle any claims;
6. Retain any property in the form in which it was left;
7. Exercise all powers conferred by the Succession Law Reform Act and common law.

My Executor shall have all powers conferred by the Succession Law Reform Act, including the power to make distributions to beneficiaries at such times and in such manner as my Executor deems appropriate.`;
}

function buildGuardianshipSection(answers: Record<string, any>): DocumentSection {
  let content = `I appoint ${answers.primaryGuardian} to be the guardian of my minor children and to have custody and control of their persons and education.\n\n`;
  content += `Should ${answers.primaryGuardian} be unable or unwilling to act, I appoint ${answers.alternateGuardian} to be the guardian of my minor children.\n\n`;
  content += `I direct my Executor to hold and manage the property of my minor children in trust and to apply the income and capital for their maintenance, education, and benefit until they reach the age of majority.`;

  return {
    title: 'GUARDIANSHIP OF MINOR CHILDREN',
    content,
    legalBasis: 'Children\'s Law Reform Act, s. 17',
  };
}

function buildDistributionSection(answers: Record<string, any>): DocumentSection {
  let content = 'I direct my Executor to distribute my estate as follows:\n\n';

  if (answers.primaryBeneficiaries) {
    content += `PRIMARY BENEFICIARIES:\n${answers.primaryBeneficiaries}\n\n`;
  }

  if (answers.contingentBeneficiaries) {
    content += `CONTINGENT BENEFICIARIES:\nIf any of my primary beneficiaries predecease me, I direct that their share shall be distributed to:\n${answers.contingentBeneficiaries}\n\n`;
  }

  if (answers.excludedBeneficiaries) {
    content += `EXCLUDED BENEFICIARIES:\nI intentionally exclude the following person(s) from my estate:\n${answers.excludedBeneficiaries}`;
  }

  return {
    title: 'DISTRIBUTION OF ESTATE',
    content,
    legalBasis: 'Succession Law Reform Act, s. 1',
  };
}

function buildBequeststSection(answers: Record<string, any>): DocumentSection {
  return {
    title: 'SPECIFIC BEQUESTS',
    content: `In addition to the general distribution above, I make the following specific bequests:\n\n${answers.specificBequests}`,
  };
}

function buildTrustSection(answers: Record<string, any>): DocumentSection {
  return {
    title: 'TRUST PROVISIONS',
    content: `I direct my Executor to establish a trust as follows:\n\n${answers.trustDetails}`,
    legalBasis: 'Succession Law Reform Act, s. 1',
    conditional: true,
  };
}

function buildCharitableSection(answers: Record<string, any>): DocumentSection {
  return {
    title: 'CHARITABLE DONATIONS',
    content: `I direct my Executor to make the following charitable donations from my estate:\n\n${answers.charitableDonationDetails}`,
    conditional: true,
  };
}

function buildExecutionClause(answers: Record<string, any>): string {
  return `IN WITNESS WHEREOF I have hereunto set my hand to this my Will this _____ day of ______________, 20_____.

SIGNED, PUBLISHED AND DECLARED
by the above-named Testator as their
Last Will and Testament in the presence
of us, both present at the same time,
who in their presence and in the presence
of each other have subscribed our names
as witnesses thereto.

_____________________________
Testator: ${answers.testatorFullName}

_____________________________
Witness #1

_____________________________
Witness #2

NOTE: This Will must be signed by the testator and witnessed by two independent witnesses who are not beneficiaries under the Will.`;
}

// ============================================================================
// POA PROPERTY DOCUMENT GENERATION
// ============================================================================

export async function generatePOAPropertyDocument(
  context: DocumentGenerationContext
): Promise<GeneratedDocument> {
  const { answers } = context;

  const sections: DocumentSection[] = [
    {
      title: 'POWER OF ATTORNEY FOR PROPERTY',
      content: 'POWER OF ATTORNEY FOR PROPERTY',
    },
    {
      title: 'GRANTOR INFORMATION',
      content: `I, ${answers.grantorFullName}, of ${answers.grantorAddress}, being of sound mind, do hereby make, constitute and appoint this Power of Attorney for Property.`,
      legalBasis: 'Powers of Attorney Act, s. 1',
    },
    {
      title: 'APPOINTMENT OF ATTORNEY',
      content: `I appoint ${answers.attorneyName} to be my attorney for property with full power and authority to manage, control, and dispose of all my property, real and personal, including but not limited to:

1. Real property and interests therein;
2. Personal property and chattels;
3. Bank accounts and investments;
4. Business interests;
5. All other property of which I am possessed or entitled.`,
      legalBasis: 'Powers of Attorney Act, s. 7',
    },
    {
      title: 'POWERS GRANTED',
      content: `My attorney shall have all powers granted under the Powers of Attorney Act, including the power to:
1. Sell, mortgage, or lease property;
2. Invest and reinvest funds;
3. Collect debts and rents;
4. Pay bills and expenses;
5. Enter into contracts;
6. Manage business affairs;
7. File tax returns;
8. Exercise all other powers as if I were personally present.`,
      legalBasis: 'Powers of Attorney Act, s. 7(1)',
    },
    {
      title: 'EXECUTION AND ATTESTATION',
      content: `IN WITNESS WHEREOF I have executed this Power of Attorney this _____ day of ______________, 20_____.

SIGNED, PUBLISHED AND DECLARED
by the above-named Grantor as their
Power of Attorney for Property in the
presence of us, both present at the same
time, who in their presence and in the
presence of each other have subscribed
our names as witnesses thereto.

_____________________________
Grantor: ${answers.grantorFullName}

_____________________________
Witness #1

_____________________________
Witness #2`,
      legalBasis: 'Powers of Attorney Act, s. 10',
    },
  ];

  const content = sections
    .map((section) => {
      let text = `\n${section.title}\n`;
      text += '='.repeat(section.title.length) + '\n\n';
      text += section.content;
      if (section.legalBasis) {
        text += `\n\n[Legal Basis: ${section.legalBasis}]`;
      }
      return text;
    })
    .join('\n\n');

  return {
    title: `Power of Attorney for Property - ${answers.grantorFullName}`,
    content,
    sections,
    metadata: {
      generatedAt: new Date(),
      documentType: 'poa-property',
      jurisdiction: 'Ontario',
      legalCompliance: [
        'Powers of Attorney Act',
        'Substitute Decisions Act',
      ],
    },
  };
}

// ============================================================================
// POA PERSONAL CARE DOCUMENT GENERATION
// ============================================================================

export async function generatePOAPersonalCareDocument(
  context: DocumentGenerationContext
): Promise<GeneratedDocument> {
  const { answers } = context;

  const sections: DocumentSection[] = [
    {
      title: 'POWER OF ATTORNEY FOR PERSONAL CARE',
      content: 'POWER OF ATTORNEY FOR PERSONAL CARE',
    },
    {
      title: 'GRANTOR INFORMATION',
      content: `I, ${answers.grantorFullName}, of ${answers.grantorAddress}, being of sound mind, do hereby make, constitute and appoint this Power of Attorney for Personal Care.`,
      legalBasis: 'Health Care Consent Act, s. 20',
    },
    {
      title: 'APPOINTMENT OF ATTORNEY',
      content: `I appoint ${answers.attorneyName} to be my attorney for personal care with authority to make decisions regarding my personal care, including but not limited to:

1. Decisions about my health care and medical treatment;
2. Decisions about my living arrangements;
3. Decisions about my nutrition and diet;
4. Decisions about my hygiene and personal care;
5. Decisions about my clothing and appearance;
6. Decisions about my social activities and relationships;
7. Decisions about my education and training;
8. All other matters related to my personal care.`,
      legalBasis: 'Health Care Consent Act, s. 20(1)',
    },
    {
      title: 'SCOPE OF AUTHORITY',
      content: `My attorney shall have authority to:
1. Consent to or refuse medical treatment;
2. Communicate with health care providers;
3. Access my medical records;
4. Make decisions about my living arrangements;
5. Manage my personal affairs;
6. Make all decisions necessary for my personal care and well-being.`,
      legalBasis: 'Substitute Decisions Act, s. 17',
    },
    {
      title: 'EXECUTION AND ATTESTATION',
      content: `IN WITNESS WHEREOF I have executed this Power of Attorney for Personal Care this _____ day of ______________, 20_____.

SIGNED, PUBLISHED AND DECLARED
by the above-named Grantor as their
Power of Attorney for Personal Care in
the presence of us, both present at the
same time, who in their presence and in
the presence of each other have subscribed
our names as witnesses thereto.

_____________________________
Grantor: ${answers.grantorFullName}

_____________________________
Witness #1

_____________________________
Witness #2`,
      legalBasis: 'Health Care Consent Act, s. 20(2)',
    },
  ];

  const content = sections
    .map((section) => {
      let text = `\n${section.title}\n`;
      text += '='.repeat(section.title.length) + '\n\n';
      text += section.content;
      if (section.legalBasis) {
        text += `\n\n[Legal Basis: ${section.legalBasis}]`;
      }
      return text;
    })
    .join('\n\n');

  return {
    title: `Power of Attorney for Personal Care - ${answers.grantorFullName}`,
    content,
    sections,
    metadata: {
      generatedAt: new Date(),
      documentType: 'poa-personal-care',
      jurisdiction: 'Ontario',
      legalCompliance: [
        'Health Care Consent Act',
        'Substitute Decisions Act',
      ],
    },
  };
}

/**
 * Generate document based on type
 */
export async function generateDocument(
  context: DocumentGenerationContext
): Promise<GeneratedDocument> {
  switch (context.documentType) {
    case 'will':
      return generateWillDocument(context);
    case 'poa-property':
      return generatePOAPropertyDocument(context);
    case 'poa-personal-care':
      return generatePOAPersonalCareDocument(context);
    default:
      throw new Error(`Unknown document type: ${context.documentType}`);
  }
}
