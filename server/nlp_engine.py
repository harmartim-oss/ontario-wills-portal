"""
Ontario Will NLP & Clause Generation Engine
Generates legally compliant will clauses using spaCy NLP and AI
"""

import spacy
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None


class OntarioWillClauseGenerator:
    """Generates Ontario-compliant will clauses using NLP and templates"""
    
    def __init__(self):
        self.nlp = nlp
        self.compliance_rules = self._load_compliance_rules()
        
    def _load_compliance_rules(self) -> Dict[str, Any]:
        """Load SLRA compliance rules"""
        return {
            "min_testator_age": 18,
            "witness_count": 2,
            "witness_restrictions": ["beneficiary", "spouse_of_beneficiary", "creditor"],
            "required_elements": [
                "testator_declaration",
                "revocation_clause",
                "family_information",
                "executor_appointment",
                "asset_distribution",
                "witness_attestation"
            ],
            "signature_position": "end_of_will"
        }
    
    def generate_opening_clause(self, testator_name: str, testator_address: str) -> str:
        """Generate opening/declaration clause"""
        return f"""I, {testator_name}, of {testator_address}, being of sound mind, memory, and understanding, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and testamentary dispositions made by me at any time heretofore.

FIRST, I declare that I am married to [spouse name, if applicable] and that I have [number] child/children, namely [names], all of whom are referred to herein as my "children"."""
    
    def generate_revocation_clause(self) -> str:
        """Generate revocation of previous wills clause"""
        return """I hereby revoke, cancel, and annul all former wills, codicils, and testamentary dispositions made by me at any time heretofore."""
    
    def generate_executor_clause(self, executor_name: str, alternate_executor: str, 
                                executor_powers: List[str]) -> str:
        """Generate executor appointment clause with powers"""
        powers_text = ", ".join(executor_powers) if executor_powers else "all powers granted by law"
        
        return f"""I hereby nominate, constitute, and appoint {executor_name} as the Estate Trustee of my estate (hereinafter called the "Estate Trustee"). If {executor_name} is unable or unwilling to act, I nominate, constitute, and appoint {alternate_executor} as the Estate Trustee in their place.

The Estate Trustee shall have full power and authority to do all things necessary or desirable for the proper administration of my estate, including but not limited to: {powers_text}. The Estate Trustee shall have the power to sell, lease, or mortgage any part of my estate without requiring the consent of any beneficiary."""
    
    def generate_specific_bequest_clause(self, item_description: str, beneficiary_name: str, 
                                       conditions: Optional[str] = None) -> str:
        """Generate specific bequest clause"""
        clause = f"""I give, devise, and bequeath {item_description} to {beneficiary_name}."""
        
        if conditions:
            clause += f" This bequest is conditional upon: {conditions}."
        
        return clause
    
    def generate_monetary_bequest_clause(self, amount: float, beneficiary_name: str,
                                       percentage: Optional[float] = None) -> str:
        """Generate monetary bequest clause"""
        if percentage:
            return f"""I give, devise, and bequeath to {beneficiary_name} the sum of ${amount:,.2f}, representing {percentage}% of my estate."""
        else:
            return f"""I give, devise, and bequeath to {beneficiary_name} the sum of ${amount:,.2f}."""
    
    def generate_residuary_clause(self, residuary_beneficiary: str, percentage: float = 100) -> str:
        """Generate residuary estate clause"""
        return f"""I give, devise, and bequeath the whole of the residue of my estate, both real and personal, of whatsoever kind and wheresoever situate, to {residuary_beneficiary}, to be held and enjoyed absolutely."""
    
    def generate_guardian_clause(self, guardian_name: str, alternate_guardian: str,
                               children_names: List[str]) -> str:
        """Generate guardian appointment clause for minor children"""
        children_str = ", ".join(children_names)
        
        return f"""I nominate and appoint {guardian_name} as guardian of the person and property of my minor child/children, namely {children_str}. If {guardian_name} is unable or unwilling to act, I nominate and appoint {alternate_guardian} as guardian in their place."""
    
    def generate_henson_trust_clause(self, beneficiary_name: str, trustee_name: str,
                                    trustee_powers: List[str]) -> str:
        """Generate Henson Trust clause for disabled beneficiaries (ODSP-compliant)"""
        powers_text = ", ".join(trustee_powers) if trustee_powers else "absolute discretion"
        
        return f"""I hereby create a trust for the benefit of {beneficiary_name}, who has a disability. I appoint {trustee_name} as trustee of this trust.

The trustee shall hold the trust property in trust and shall pay or apply to or for the benefit of {beneficiary_name} such part or all of the net income and capital of the trust estate as the trustee, in their absolute discretion, considers appropriate for {beneficiary_name}'s maintenance, support, education, and general welfare.

Notwithstanding any other provision, the trustee shall not make any payment or transfer to {beneficiary_name} that would result in the loss or reduction of any government benefits to which {beneficiary_name} is entitled, including but not limited to the Ontario Disability Support Program (ODSP) and Canada Pension Plan Disability (CPP-D)."""
    
    def generate_trustee_clause(self, trustee_name: str, alternate_trustee: str,
                              distribution_instructions: str) -> str:
        """Generate trustee appointment and powers clause"""
        return f"""I nominate and appoint {trustee_name} as trustee of any trusts created under this will. If {trustee_name} is unable or unwilling to act, I nominate and appoint {alternate_trustee} as trustee in their place.

The trustee shall have full power to invest and reinvest the trust estate in any investments or securities as the trustee deems appropriate. The trustee shall distribute the trust estate in accordance with the following instructions: {distribution_instructions}."""
    
    def generate_attestation_clause(self, witness1_name: str, witness2_name: str) -> str:
        """Generate attestation clause for witnesses"""
        return f"""IN WITNESS WHEREOF I have hereunto set my hand to this my Will this _____ day of ______________, 20_____.

SIGNED, PUBLISHED AND DECLARED by the above-named testator as their Last Will in the presence of us, both present at the same time, who at their request and in their presence and in the presence of each other have hereunto subscribed our names as witnesses.

Witness 1: {witness1_name}
_________________________________
Signature

Witness 2: {witness2_name}
_________________________________
Signature"""
    
    def extract_entities_from_text(self, text: str) -> Dict[str, List[str]]:
        """Use spaCy NLP to extract entities from user input"""
        if not self.nlp:
            return {}
        
        doc = self.nlp(text)
        entities = {
            "persons": [],
            "organizations": [],
            "money": [],
            "dates": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["persons"].append(ent.text)
            elif ent.label_ == "ORG":
                entities["organizations"].append(ent.text)
            elif ent.label_ == "MONEY":
                entities["money"].append(ent.text)
            elif ent.label_ == "DATE":
                entities["dates"].append(ent.text)
        
        return entities
    
    def validate_clause_compliance(self, clause_text: str, clause_type: str) -> Dict[str, Any]:
        """Validate clause against SLRA compliance rules"""
        validation_result = {
            "is_compliant": True,
            "warnings": [],
            "errors": [],
            "suggestions": []
        }
        
        # Check for required legal language
        required_phrases = {
            "executor_clause": ["nominate", "constitute", "appoint"],
            "bequest_clause": ["give", "devise", "bequeath"],
            "guardian_clause": ["guardian", "minor", "appoint"],
            "henson_trust": ["disability", "trustee", "discretion", "ODSP"]
        }
        
        if clause_type in required_phrases:
            for phrase in required_phrases[clause_type]:
                if phrase.lower() not in clause_text.lower():
                    validation_result["warnings"].append(f"Missing recommended phrase: '{phrase}'")
        
        # Check for ambiguous language
        ambiguous_terms = ["maybe", "might", "could", "perhaps", "probably"]
        for term in ambiguous_terms:
            if term.lower() in clause_text.lower():
                validation_result["warnings"].append(f"Ambiguous language detected: '{term}'. Consider using definitive language.")
        
        # Check for beneficiary conflicts
        if "beneficiary" in clause_text.lower() and "witness" in clause_text.lower():
            validation_result["warnings"].append("Ensure witnesses are not beneficiaries under the will.")
        
        return validation_result
    
    def generate_full_will_document(self, will_data: Dict[str, Any]) -> str:
        """Generate complete will document from structured data"""
        will_text = "LAST WILL AND TESTAMENT\n\n"
        
        # Opening clause
        will_text += self.generate_opening_clause(
            will_data.get("testator_name", ""),
            will_data.get("testator_address", "")
        )
        will_text += "\n\n"
        
        # Revocation clause
        will_text += self.generate_revocation_clause()
        will_text += "\n\n"
        
        # Executor clause
        if will_data.get("executor_name"):
            will_text += self.generate_executor_clause(
                will_data.get("executor_name", ""),
                will_data.get("alternate_executor", ""),
                will_data.get("executor_powers", [])
            )
            will_text += "\n\n"
        
        # Specific bequests
        for bequest in will_data.get("bequests", []):
            will_text += self.generate_specific_bequest_clause(
                bequest.get("description", ""),
                bequest.get("beneficiary", ""),
                bequest.get("conditions")
            )
            will_text += "\n\n"
        
        # Monetary bequests
        for bequest in will_data.get("monetary_bequests", []):
            will_text += self.generate_monetary_bequest_clause(
                bequest.get("amount", 0),
                bequest.get("beneficiary", ""),
                bequest.get("percentage")
            )
            will_text += "\n\n"
        
        # Residuary clause
        if will_data.get("residuary_beneficiary"):
            will_text += self.generate_residuary_clause(
                will_data.get("residuary_beneficiary", "")
            )
            will_text += "\n\n"
        
        # Guardian clause
        if will_data.get("guardian_name"):
            will_text += self.generate_guardian_clause(
                will_data.get("guardian_name", ""),
                will_data.get("alternate_guardian", ""),
                will_data.get("children_names", [])
            )
            will_text += "\n\n"
        
        # Henson Trust clause (if applicable)
        if will_data.get("has_henson_trust"):
            will_text += self.generate_henson_trust_clause(
                will_data.get("henson_beneficiary", ""),
                will_data.get("henson_trustee", ""),
                will_data.get("trustee_powers", [])
            )
            will_text += "\n\n"
        
        # Attestation clause
        will_text += self.generate_attestation_clause(
            will_data.get("witness1_name", ""),
            will_data.get("witness2_name", "")
        )
        
        return will_text
    
    def check_compliance(self, will_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive compliance check against SLRA requirements"""
        compliance_report = {
            "is_compliant": True,
            "missing_elements": [],
            "warnings": [],
            "critical_issues": [],
            "recommendations": []
        }
        
        # Check testator age
        if will_data.get("testator_age", 0) < self.compliance_rules["min_testator_age"]:
            compliance_report["critical_issues"].append(
                f"Testator must be at least {self.compliance_rules['min_testator_age']} years old"
            )
            compliance_report["is_compliant"] = False
        
        # Check required elements
        for element in self.compliance_rules["required_elements"]:
            if element == "testator_declaration" and not will_data.get("testator_name"):
                compliance_report["missing_elements"].append("Testator name and declaration")
            elif element == "executor_appointment" and not will_data.get("executor_name"):
                compliance_report["missing_elements"].append("Executor appointment")
            elif element == "asset_distribution" and not will_data.get("bequests") and not will_data.get("monetary_bequests"):
                compliance_report["missing_elements"].append("Asset distribution instructions")
        
        # Check witness requirements
        if not will_data.get("witness1_name") or not will_data.get("witness2_name"):
            compliance_report["critical_issues"].append("Must have at least 2 witnesses")
            compliance_report["is_compliant"] = False
        
        # Check for beneficiary-witness conflicts
        witnesses = [will_data.get("witness1_name"), will_data.get("witness2_name")]
        beneficiaries = [b.get("beneficiary") for b in will_data.get("bequests", [])]
        
        for witness in witnesses:
            if witness in beneficiaries:
                compliance_report["critical_issues"].append(
                    f"Witness '{witness}' cannot be a beneficiary under the will"
                )
                compliance_report["is_compliant"] = False
        
        # Recommendations for Henson Trust
        if will_data.get("has_disabled_beneficiary") and not will_data.get("has_henson_trust"):
            compliance_report["recommendations"].append(
                "Consider using a Henson Trust for disabled beneficiaries to protect government benefits"
            )
        
        # Recommendations for professional review
        if will_data.get("estate_value", 0) > 500000:
            compliance_report["recommendations"].append(
                "Estate value exceeds $500,000. Recommend professional legal review to optimize tax planning"
            )
        
        if will_data.get("has_business_interest"):
            compliance_report["recommendations"].append(
                "Business interests detected. Recommend consulting with accountant for succession planning"
            )
        
        return compliance_report


# Initialize the clause generator
clause_generator = OntarioWillClauseGenerator()
