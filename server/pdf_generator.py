"""
PDF Generator for Ontario Wills & POA Documents
Generates professionally formatted PDF documents with legal compliance recommendations
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
import io


class OntarioWillPDFGenerator:
    """Generate professionally formatted Ontario Wills"""
    
    def __init__(self):
        self.page_width, self.page_height = letter
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles for legal documents"""
        self.styles.add(ParagraphStyle(
            name='LegalTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#0F172A'),  # Navy
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='LegalBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#1E293B'),  # Slate
            spaceAfter=6,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=14
        ))
        
        self.styles.add(ParagraphStyle(
            name='LegalClause',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=12,
            leftIndent=0.5*inch
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        ))
    
    def generate_will_pdf(self, will_data: Dict[str, Any], compliance_issues: Optional[List[Dict]] = None) -> bytes:
        """Generate a professionally formatted Will PDF"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
            title="Ontario Will",
            author="Ontario Wills & POA Creator"
        )
        
        story = []
        
        # Title
        story.append(Paragraph("LAST WILL AND TESTAMENT", self.styles['LegalTitle']))
        story.append(Spacer(1, 0.2*inch))
        
        # Opening Clause
        testator_name = will_data.get('testatorName', 'Testator')
        story.append(Paragraph(
            f"I, <u>{testator_name}</u>, of the {will_data.get('province', 'Province of Ontario')}, "
            f"being of sound mind and memory, do hereby make, publish and declare this to be my Last Will and Testament, "
            f"hereby revoking all former Wills and Testamentary dispositions heretofore made by me.",
            self.styles['LegalBody']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        # Revocation Clause
        story.append(Paragraph("REVOCATION", self.styles['SectionHeading']))
        story.append(Paragraph(
            "I hereby revoke and annul all former Wills, Codicils and Testamentary dispositions made by me and declare this only to be my Will.",
            self.styles['LegalClause']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        # Executor Clause
        if will_data.get('executorName'):
            story.append(Paragraph("EXECUTOR", self.styles['SectionHeading']))
            executor_name = will_data.get('executorName')
            alternate = will_data.get('alternateExecutorName', 'to be appointed by the court')
            story.append(Paragraph(
                f"I appoint <u>{executor_name}</u> to be my Executor. Should my Executor predecease me or be unable or unwilling to act, "
                f"I appoint <u>{alternate}</u> to be my Executor in their place.",
                self.styles['LegalClause']
            ))
            story.append(Spacer(1, 0.15*inch))
        
        # Executor Powers
        story.append(Paragraph("POWERS OF EXECUTOR", self.styles['SectionHeading']))
        story.append(Paragraph(
            "I give my Executor full power and authority to sell, mortgage, pledge or lease any real or personal property "
            "forming part of my estate, and to invest and reinvest the proceeds. My Executor shall have all powers conferred "
            "by the Succession Law Reform Act.",
            self.styles['LegalClause']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        # Guardianship Clause
        if will_data.get('hasChildren') == 'Yes' and will_data.get('minorChildren') == 'Yes':
            if will_data.get('guardianName'):
                story.append(Paragraph("GUARDIANSHIP", self.styles['SectionHeading']))
                guardian_name = will_data.get('guardianName')
                alternate_guardian = will_data.get('alternateGuardianName', 'to be appointed by the court')
                story.append(Paragraph(
                    f"I appoint <u>{guardian_name}</u> as guardian of the person and property of my minor children. "
                    f"Should they be unable or unwilling to act, I appoint <u>{alternate_guardian}</u> as guardian.",
                    self.styles['LegalClause']
                ))
                story.append(Spacer(1, 0.15*inch))
        
        # Bequests
        if will_data.get('bequests'):
            story.append(Paragraph("BEQUESTS", self.styles['SectionHeading']))
            for bequest in will_data.get('bequests', []):
                story.append(Paragraph(
                    f"I give, devise and bequeath to <u>{bequest.get('beneficiary')}</u> "
                    f"the sum of ${bequest.get('amount', 0):,.2f} (or {bequest.get('percentage', 0)}% of my estate).",
                    self.styles['LegalClause']
                ))
            story.append(Spacer(1, 0.15*inch))
        
        # Residue
        story.append(Paragraph("RESIDUE", self.styles['SectionHeading']))
        residue = will_data.get('residueDistribution', 'to my executor in trust')
        story.append(Paragraph(
            f"I give, devise and bequeath the residue of my estate {residue}.",
            self.styles['LegalClause']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        # Trust Provisions
        if will_data.get('trustProvisions'):
            story.append(Paragraph("TRUST PROVISIONS", self.styles['SectionHeading']))
            story.append(Paragraph(
                will_data.get('trustProvisions'),
                self.styles['LegalClause']
            ))
            story.append(Spacer(1, 0.15*inch))
        
        # Special Provisions
        if will_data.get('specialInstructions'):
            story.append(Paragraph("SPECIAL PROVISIONS", self.styles['SectionHeading']))
            story.append(Paragraph(
                will_data.get('specialInstructions'),
                self.styles['LegalClause']
            ))
            story.append(Spacer(1, 0.15*inch))
        
        # Signature Block
        story.append(PageBreak())
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("IN WITNESS WHEREOF I have hereunto set my hand to this my Will.", self.styles['LegalBody']))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph(f"{testator_name}", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        # Witness Block
        story.append(Paragraph("SIGNED, PUBLISHED AND DECLARED by the above-named Testator as their Last Will "
                              "in the presence of us, both present at the same time, who at their request and in their presence "
                              "and in the presence of each other, have subscribed our names as witnesses.", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 1 (Signature)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 1 (Print Name)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 2 (Signature)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 2 (Print Name)", self.styles['LegalBody']))
        
        # Compliance Recommendations (if provided)
        if compliance_issues:
            story.append(PageBreak())
            story.append(Paragraph("LEGAL COMPLIANCE REVIEW", self.styles['SectionHeading']))
            story.append(Paragraph(
                "This will has been reviewed for compliance with Ontario's Succession Law Reform Act. "
                "The following recommendations should be considered:",
                self.styles['LegalBody']
            ))
            story.append(Spacer(1, 0.15*inch))
            
            for issue in compliance_issues[:5]:  # Show top 5 issues
                story.append(Paragraph(
                    f"<b>{issue.get('title', 'Issue')}:</b> {issue.get('description', '')}",
                    self.styles['LegalBody']
                ))
                story.append(Spacer(1, 0.1*inch))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            f"<i>Generated on {datetime.now().strftime('%B %d, %Y')} by Ontario Wills & POA Creator. "
            "This document is for informational purposes and should be reviewed by a legal professional before execution.</i>",
            self.styles['LegalBody']
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()


class OntarioPOAPDFGenerator:
    """Generate professionally formatted Ontario Powers of Attorney"""
    
    def __init__(self):
        self.page_width, self.page_height = letter
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles for legal documents"""
        self.styles.add(ParagraphStyle(
            name='LegalTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='LegalBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=6,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=14
        ))
        
        self.styles.add(ParagraphStyle(
            name='LegalClause',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=12,
            leftIndent=0.5*inch
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        ))
    
    def generate_poa_pdf(self, poa_data: Dict[str, Any], poa_type: str = "Property") -> bytes:
        """Generate a professionally formatted POA PDF"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
            title=f"Ontario POA for {poa_type}",
            author="Ontario Wills & POA Creator"
        )
        
        story = []
        
        # Title
        if poa_type == "Property":
            title = "POWER OF ATTORNEY FOR PROPERTY"
        else:
            title = "POWER OF ATTORNEY FOR PERSONAL CARE"
        
        story.append(Paragraph(title, self.styles['LegalTitle']))
        story.append(Spacer(1, 0.2*inch))
        
        # Opening
        grantor_name = poa_data.get('grantorName', 'Grantor')
        story.append(Paragraph(
            f"I, <u>{grantor_name}</u>, of the Province of Ontario, being of sound mind, "
            f"hereby appoint <u>{poa_data.get('attorneyName', 'Attorney')}</u> as my attorney.",
            self.styles['LegalBody']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        # Powers
        story.append(Paragraph("POWERS GRANTED", self.styles['SectionHeading']))
        
        if poa_type == "Property":
            story.append(Paragraph(
                "I authorize my attorney to manage my property, including but not limited to: "
                "selling or mortgaging real property, managing bank accounts, managing investments, "
                "managing business interests, paying taxes, and managing digital assets.",
                self.styles['LegalClause']
            ))
        else:
            story.append(Paragraph(
                "I authorize my attorney to make decisions regarding my personal care, including but not limited to: "
                "healthcare decisions, living arrangements, social activities, and end-of-life preferences.",
                self.styles['LegalClause']
            ))
        
        story.append(Spacer(1, 0.15*inch))
        
        # Successor Attorney
        if poa_data.get('successorAttorney'):
            story.append(Paragraph("SUCCESSOR ATTORNEY", self.styles['SectionHeading']))
            story.append(Paragraph(
                f"If my attorney is unable or unwilling to act, I appoint <u>{poa_data.get('successorAttorney')}</u> "
                f"as my successor attorney.",
                self.styles['LegalClause']
            ))
            story.append(Spacer(1, 0.15*inch))
        
        # Special Instructions
        if poa_data.get('specialInstructions'):
            story.append(Paragraph("SPECIAL INSTRUCTIONS", self.styles['SectionHeading']))
            story.append(Paragraph(
                poa_data.get('specialInstructions'),
                self.styles['LegalClause']
            ))
            story.append(Spacer(1, 0.15*inch))
        
        # Signature Block
        story.append(PageBreak())
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("IN WITNESS WHEREOF I have executed this Power of Attorney.", self.styles['LegalBody']))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph(f"{grantor_name}", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        # Witness Block
        story.append(Paragraph("SIGNED, PUBLISHED AND DECLARED by the above-named Grantor as their Power of Attorney "
                              "in the presence of us, both present at the same time, who at their request and in their presence "
                              "and in the presence of each other, have subscribed our names as witnesses.", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 1 (Signature)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 1 (Print Name)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 2 (Signature)", self.styles['LegalBody']))
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph("_" * 50, self.styles['LegalBody']))
        story.append(Paragraph("Witness 2 (Print Name)", self.styles['LegalBody']))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            f"<i>Generated on {datetime.now().strftime('%B %d, %Y')} by Ontario Wills & POA Creator. "
            "This document is for informational purposes and should be reviewed by a legal professional before execution.</i>",
            self.styles['LegalBody']
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()


# Initialize generators
will_pdf_generator = OntarioWillPDFGenerator()
poa_pdf_generator = OntarioPOAPDFGenerator()
