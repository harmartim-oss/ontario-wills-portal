/**
 * Document Validation and Data Consistency Checks
 * Ensures answers are valid, consistent, and legally sound
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// WILL VALIDATION
// ============================================================================

/**
 * Validate will answers for completeness and consistency
 */
export function validateWillAnswers(answers: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Testator Information Validation
  if (!answers.testatorFullName || answers.testatorFullName.trim().length === 0) {
    errors.push({
      field: 'testatorFullName',
      message: 'Testator full name is required',
      severity: 'critical',
    });
  }

  if (!answers.testatorDateOfBirth) {
    errors.push({
      field: 'testatorDateOfBirth',
      message: 'Date of birth is required',
      severity: 'critical',
    });
  } else {
    const age = calculateAge(new Date(answers.testatorDateOfBirth));
    if (age < 18) {
      errors.push({
        field: 'testatorDateOfBirth',
        message: 'Testator must be at least 18 years old',
        severity: 'critical',
      });
    }
    if (age > 150) {
      warnings.push({
        field: 'testatorDateOfBirth',
        message: 'Age appears unusually high',
        suggestion: 'Please verify the date of birth is correct',
      });
    }
  }

  if (!answers.testatorAddress || answers.testatorAddress.trim().length < 10) {
    errors.push({
      field: 'testatorAddress',
      message: 'Complete residential address is required',
      severity: 'critical',
    });
  }

  // 2. Marital Status Consistency
  if (answers.maritalStatus === 'Married' || answers.maritalStatus === 'Common-law partnership') {
    if (!answers.spouseName || answers.spouseName.trim().length === 0) {
      errors.push({
        field: 'spouseName',
        message: 'Spouse name is required for married/common-law status',
        severity: 'critical',
      });
    }
  }

  // 3. Children Information Consistency
  if (answers.hasChildren === 'Yes') {
    if (!answers.numberOfChildren || answers.numberOfChildren < 1) {
      errors.push({
        field: 'numberOfChildren',
        message: 'Number of children must be at least 1',
        severity: 'critical',
      });
    }

    if (!answers.childrenDetails || answers.childrenDetails.trim().length === 0) {
      errors.push({
        field: 'childrenDetails',
        message: 'Children details are required',
        severity: 'critical',
      });
    }

    // Check for minor children without guardians
    if (answers.hasMinorChildren === 'Yes') {
      if (!answers.primaryGuardian || answers.primaryGuardian.trim().length === 0) {
        errors.push({
          field: 'primaryGuardian',
          message: 'Primary guardian is required for minor children',
          severity: 'critical',
        });
      }

      if (!answers.alternateGuardian || answers.alternateGuardian.trim().length === 0) {
        warnings.push({
          field: 'alternateGuardian',
          message: 'No alternate guardian specified',
          suggestion: 'It is recommended to specify an alternate guardian',
        });
      }

      // Check for guardian conflicts
      if (answers.primaryGuardian === answers.alternateGuardian) {
        warnings.push({
          field: 'alternateGuardian',
          message: 'Primary and alternate guardians are the same',
          suggestion: 'Consider specifying a different alternate guardian',
        });
      }
    }
  }

  // 4. Executor Information Validation
  if (!answers.primaryExecutor || answers.primaryExecutor.trim().length === 0) {
    errors.push({
      field: 'primaryExecutor',
      message: 'Primary executor is required',
      severity: 'critical',
    });
  }

  if (!answers.alternateExecutor || answers.alternateExecutor.trim().length === 0) {
    warnings.push({
      field: 'alternateExecutor',
      message: 'No alternate executor specified',
      suggestion: 'It is recommended to specify an alternate executor',
    });
  }

  // Check for executor conflicts
  if (answers.primaryExecutor === answers.alternateExecutor) {
    warnings.push({
      field: 'alternateExecutor',
      message: 'Primary and alternate executors are the same',
      suggestion: 'Consider specifying a different alternate executor',
    });
  }

  // 5. Beneficiary Information Validation
  if (!answers.primaryBeneficiaries || answers.primaryBeneficiaries.trim().length === 0) {
    errors.push({
      field: 'primaryBeneficiaries',
      message: 'At least one primary beneficiary is required',
      severity: 'critical',
    });
  } else {
    // Validate beneficiary percentages if provided
    const percentageMatch = answers.primaryBeneficiaries.match(/(\d+)%/g);
    if (percentageMatch) {
      const total = percentageMatch.reduce((sum: number, p: string) => sum + parseInt(p), 0);
      if (total !== 100) {
        warnings.push({
          field: 'primaryBeneficiaries',
          message: `Beneficiary percentages total ${total}%, not 100%`,
          suggestion: 'Ensure all percentages add up to 100%',
        });
      }
    }
  }

  if (!answers.contingentBeneficiaries || answers.contingentBeneficiaries.trim().length === 0) {
    warnings.push({
      field: 'contingentBeneficiaries',
      message: 'No contingent beneficiaries specified',
      suggestion: 'It is recommended to specify contingent beneficiaries',
    });
  }

  // 6. Estate Information Validation
  if (!answers.estateValue) {
    warnings.push({
      field: 'estateValue',
      message: 'Estate value not specified',
      suggestion: 'Knowing your estate value helps with tax planning',
    });
  }

  // 7. Real Property Validation
  if (answers.ownsRealProperty === 'Yes') {
    if (!answers.realPropertyDetails || answers.realPropertyDetails.trim().length === 0) {
      warnings.push({
        field: 'realPropertyDetails',
        message: 'Real property details not provided',
        suggestion: 'Provide details about your real property for clarity',
      });
    }
  }

  // 8. Debt Information Validation
  if (answers.hasDebts === 'Yes') {
    if (!answers.debtDetails || answers.debtDetails.trim().length === 0) {
      warnings.push({
        field: 'debtDetails',
        message: 'Debt details not provided',
        suggestion: 'Provide details about your debts for estate planning',
      });
    }
  }

  // 9. Trust Information Validation
  if (answers.hasTrust === 'Yes') {
    if (!answers.trustDetails || answers.trustDetails.trim().length === 0) {
      errors.push({
        field: 'trustDetails',
        message: 'Trust details are required',
        severity: 'high',
      });
    }
  }

  // 10. Charitable Donations Validation
  if (answers.hasCharitableDonations === 'Yes') {
    if (!answers.charitableDonationDetails || answers.charitableDonationDetails.trim().length === 0) {
      errors.push({
        field: 'charitableDonationDetails',
        message: 'Charitable donation details are required',
        severity: 'high',
      });
    }
  }

  // 11. Executor Compensation Validation
  if (answers.executorCompensation === 'Fixed amount') {
    if (!answers.executorCompensationAmount || answers.executorCompensationAmount <= 0) {
      errors.push({
        field: 'executorCompensationAmount',
        message: 'Executor compensation amount must be greater than 0',
        severity: 'high',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// POA PROPERTY VALIDATION
// ============================================================================

/**
 * Validate Power of Attorney for Property answers
 */
export function validatePOAPropertyAnswers(answers: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Grantor Information
  if (!answers.grantorFullName || answers.grantorFullName.trim().length === 0) {
    errors.push({
      field: 'grantorFullName',
      message: 'Grantor full name is required',
      severity: 'critical',
    });
  }

  if (!answers.grantorDateOfBirth) {
    errors.push({
      field: 'grantorDateOfBirth',
      message: 'Date of birth is required',
      severity: 'critical',
    });
  } else {
    const age = calculateAge(new Date(answers.grantorDateOfBirth));
    if (age < 18) {
      errors.push({
        field: 'grantorDateOfBirth',
        message: 'Grantor must be at least 18 years old',
        severity: 'critical',
      });
    }
  }

  if (!answers.grantorAddress || answers.grantorAddress.trim().length < 10) {
    errors.push({
      field: 'grantorAddress',
      message: 'Complete residential address is required',
      severity: 'critical',
    });
  }

  // 2. Attorney Information
  if (!answers.attorneyName || answers.attorneyName.trim().length === 0) {
    errors.push({
      field: 'attorneyName',
      message: 'Attorney name is required',
      severity: 'critical',
    });
  }

  if (!answers.alternateAttorney || answers.alternateAttorney.trim().length === 0) {
    warnings.push({
      field: 'alternateAttorney',
      message: 'No alternate attorney specified',
      suggestion: 'It is recommended to specify an alternate attorney',
    });
  }

  // Check for attorney conflicts
  if (answers.attorneyName === answers.alternateAttorney) {
    warnings.push({
      field: 'alternateAttorney',
      message: 'Primary and alternate attorneys are the same',
      suggestion: 'Consider specifying a different alternate attorney',
    });
  }

  // 3. Powers Scope
  if (answers.powerScope === 'Limited' && (!answers.limitedPowers || answers.limitedPowers.trim().length === 0)) {
    errors.push({
      field: 'limitedPowers',
      message: 'Limited powers must be specified',
      severity: 'high',
    });
  }

  // 4. Effective Date
  if (answers.effectiveDate && answers.effectiveDate > new Date()) {
    warnings.push({
      field: 'effectiveDate',
      message: 'Effective date is in the future',
      suggestion: 'POA typically becomes effective immediately or upon incapacity',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// POA PERSONAL CARE VALIDATION
// ============================================================================

/**
 * Validate Power of Attorney for Personal Care answers
 */
export function validatePOAPersonalCareAnswers(answers: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Grantor Information
  if (!answers.grantorFullName || answers.grantorFullName.trim().length === 0) {
    errors.push({
      field: 'grantorFullName',
      message: 'Grantor full name is required',
      severity: 'critical',
    });
  }

  if (!answers.grantorDateOfBirth) {
    errors.push({
      field: 'grantorDateOfBirth',
      message: 'Date of birth is required',
      severity: 'critical',
    });
  } else {
    const age = calculateAge(new Date(answers.grantorDateOfBirth));
    if (age < 16) {
      errors.push({
        field: 'grantorDateOfBirth',
        message: 'Grantor must be at least 16 years old',
        severity: 'critical',
      });
    }
  }

  // 2. Attorney Information
  if (!answers.attorneyName || answers.attorneyName.trim().length === 0) {
    errors.push({
      field: 'attorneyName',
      message: 'Attorney name is required',
      severity: 'critical',
    });
  }

  if (!answers.alternateAttorney || answers.alternateAttorney.trim().length === 0) {
    warnings.push({
      field: 'alternateAttorney',
      message: 'No alternate attorney specified',
      suggestion: 'It is recommended to specify an alternate attorney',
    });
  }

  // 3. Healthcare Preferences
  if (!answers.healthcarePreferences || answers.healthcarePreferences.trim().length === 0) {
    warnings.push({
      field: 'healthcarePreferences',
      message: 'No healthcare preferences specified',
      suggestion: 'Consider specifying your healthcare preferences and values',
    });
  }

  // 4. Living Arrangements Preferences
  if (!answers.livingArrangements || answers.livingArrangements.trim().length === 0) {
    warnings.push({
      field: 'livingArrangements',
      message: 'No living arrangement preferences specified',
      suggestion: 'Consider specifying your preferences for living arrangements',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check for data consistency issues
 */
export function checkDataConsistency(answers: Record<string, any>, documentType: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (documentType === 'will') {
    // Check for conflicting information
    if (answers.maritalStatus === 'Single' && answers.spouseName) {
      warnings.push({
        field: 'maritalStatus',
        message: 'Marital status is "Single" but spouse name is provided',
        suggestion: 'Update marital status or remove spouse name',
      });
    }

    if (answers.hasChildren === 'No' && answers.childrenDetails) {
      warnings.push({
        field: 'hasChildren',
        message: 'Stated no children but provided children details',
        suggestion: 'Update children information or change hasChildren to "Yes"',
      });
    }

    // Check for guardian without minor children
    if (answers.hasMinorChildren === 'No' && answers.primaryGuardian) {
      warnings.push({
        field: 'hasMinorChildren',
        message: 'No minor children but guardian information provided',
        suggestion: 'Remove guardian information or update children status',
      });
    }
  }

  return warnings;
}

/**
 * Get validation result for any document type
 */
export function validateDocumentAnswers(
  answers: Record<string, any>,
  documentType: string
): ValidationResult {
  let result: ValidationResult;

  switch (documentType) {
    case 'will':
      result = validateWillAnswers(answers);
      break;
    case 'poa-property':
      result = validatePOAPropertyAnswers(answers);
      break;
    case 'poa-personal-care':
      result = validatePOAPersonalCareAnswers(answers);
      break;
    default:
      result = { valid: true, errors: [], warnings: [] };
  }

  // Add consistency check warnings
  const consistencyWarnings = checkDataConsistency(answers, documentType);
  result.warnings = [...result.warnings, ...consistencyWarnings];

  return result;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) {
    return 'No errors found';
  }

  const criticalErrors = result.errors.filter((e) => e.severity === 'critical');
  const highErrors = result.errors.filter((e) => e.severity === 'high');

  let message = '';

  if (criticalErrors.length > 0) {
    message += `Critical Issues (${criticalErrors.length}):\n`;
    criticalErrors.forEach((e) => {
      message += `• ${e.field}: ${e.message}\n`;
    });
    message += '\n';
  }

  if (highErrors.length > 0) {
    message += `Important Issues (${highErrors.length}):\n`;
    highErrors.forEach((e) => {
      message += `• ${e.field}: ${e.message}\n`;
    });
  }

  return message;
}
