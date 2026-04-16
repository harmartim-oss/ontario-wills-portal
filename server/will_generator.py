"""
Ontario Will Document Generator
Generates formatted will documents and PDFs using the NLP clause engine
"""

from datetime import datetime
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from io import BytesIO
import json

from nlp_engine import clause_generator, OntarioWillClauseGenerator


class OntarioWillGenerator:
    """Generates professionally formatted Ontario will documents"""
    
    def __init__(self):
        self.clause_generator = clause_generator
        self.styles = self._create_styles()
        
    def _create_styles(self):
        """Create custom styles for will document"""
        styles = getSampleStyleSheet()
        
        # Title style
        styles.add(ParagraphStyle(
            name='WillTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a3a52'),  # Navy
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Heading style
        styles.add(ParagraphStyle(
            name='WillHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#2c5aa0'),  # Slate
            spaceAfter=8,
            spaceBefore=8,
            fontName='Helvetica-Bold'
        ))
        
        # Body text style
        styles.add(ParagraphStyle(
            name='WillBody',
            parent=styles['BodyText'],
            fontSize=11,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=14,
            fontName='Helvetica'
        ))
        
        # Clause style
        styles.add(ParagraphStyle(
            name='WillClause',
            parent=styles['BodyText'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=12,
            leftIndent=0.25*inch,
            fontName='Helvetica'
        ))
        
        return styles
    
    def generate_will_pdf(self, will_data: Dict[str, Any]) -> bytes:
        """Generate a complete will PDF document"""
        
        # Create PDF in memory
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch,
            title=f"{will_data.get('testatorName', 'Will')}'s Will"
        )
        
        # Build story (content)
        story = []
        
        # Title
        story.append(Paragraph("LAST WILL AND TESTAMENT", self.styles['WillTitle']))
        story.append(Spacer(1, 0.3*inch))
        
        # Opening clause
        opening = self.clause_generator.generate_opening_clause(
            will_data.get('testatorName', ''),
            will_data.get('testatorAddress', '')
        )
        story.append(Paragraph(opening, self.styles['WillBody']))
        story.append(Spacer(1, 0.2*inch))
        
        # Revocation clause
        revocation = self.clause_generator.generate_revocation_clause()
        story.append(Paragraph(revocation, self.styles['WillBody']))
        story.append(Spacer(1, 0.2*inch))
        
        # Executor clause
        if will_data.get('executorName'):
            executor_clause = self.clause_generator.generate_executor_clause(
                will_data.get('executorName', ''),
                will_data.get('alternateExecutor', ''),
                will_data.get('executorPowers', [])
            )
            story.append(Paragraph("APPOINTMENT OF EXECUTOR", self.styles['WillHeading']))
            story.append(Paragraph(executor_clause, self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Specific bequests
        if will_data.get('bequests'):
            story.append(Paragraph("SPECIFIC BEQUESTS", self.styles['WillHeading']))
            for i, bequest in enumerate(will_data.get('bequests', []), 1):
                bequest_clause = self.clause_generator.generate_specific_bequest_clause(
                    bequest.get('description', ''),
                    bequest.get('beneficiary', ''),
                    bequest.get('conditions')
                )
                story.append(Paragraph(f"<b>{i}.</b> {bequest_clause}", self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Monetary bequests
        if will_data.get('monetaryBequests'):
            story.append(Paragraph("MONETARY BEQUESTS", self.styles['WillHeading']))
            for i, bequest in enumerate(will_data.get('monetaryBequests', []), 1):
                monetary_clause = self.clause_generator.generate_monetary_bequest_clause(
                    bequest.get('amount', 0),
                    bequest.get('beneficiary', ''),
                    bequest.get('percentage')
                )
                story.append(Paragraph(f"<b>{i}.</b> {monetary_clause}", self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Residuary clause
        if will_data.get('residuaryBeneficiary'):
            residuary_clause = self.clause_generator.generate_residuary_clause(
                will_data.get('residuaryBeneficiary', '')
            )
            story.append(Paragraph("RESIDUARY ESTATE", self.styles['WillHeading']))
            story.append(Paragraph(residuary_clause, self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Guardian clause
        if will_data.get('guardianName') and will_data.get('childrenNames'):
            guardian_clause = self.clause_generator.generate_guardian_clause(
                will_data.get('guardianName', ''),
                will_data.get('alternateGuardian', ''),
                will_data.get('childrenNames', [])
            )
            story.append(Paragraph("GUARDIANSHIP", self.styles['WillHeading']))
            story.append(Paragraph(guardian_clause, self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Henson Trust clause
        if will_data.get('hasHensonTrust'):
            henson_clause = self.clause_generator.generate_henson_trust_clause(
                will_data.get('hensonBeneficiary', ''),
                will_data.get('hensonTrustee', ''),
                will_data.get('trusteePowers', [])
            )
            story.append(Paragraph("HENSON TRUST PROVISION", self.styles['WillHeading']))
            story.append(Paragraph(henson_clause, self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Special provisions
        if will_data.get('specialProvisions'):
            story.append(Paragraph("SPECIAL PROVISIONS", self.styles['WillHeading']))
            story.append(Paragraph(will_data.get('specialProvisions', ''), self.styles['WillClause']))
            story.append(Spacer(1, 0.15*inch))
        
        # Page break before signature page
        story.append(PageBreak())
        
        # Signature section
        story.append(Paragraph("EXECUTION OF WILL", self.styles['WillHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        signature_text = f"""
        IN WITNESS WHEREOF I have hereunto set my hand to this my Will this _____ day of ______________, 20_____.
        <br/><br/>
        SIGNED, PUBLISHED AND DECLARED by the above-named testator as their Last Will in the presence of us, 
        both present at the same time, who at their request and in their presence and in the presence of each other 
        have hereunto subscribed our names as witnesses.
        """
        story.append(Paragraph(signature_text, self.styles['WillBody']))
        story.append(Spacer(1, 0.4*inch))
        
        # Signature lines
        signature_table_data = [
            [
                Paragraph("<b>TESTATOR</b>", self.styles['WillBody']),
                Paragraph("<b>WITNESS 1</b>", self.styles['WillBody']),
                Paragraph("<b>WITNESS 2</b>", self.styles['WillBody'])
            ],
            [
                Paragraph("_________________________<br/>Name: " + will_data.get('testatorName', ''), self.styles['WillBody']),
                Paragraph("_________________________<br/>Name: " + will_data.get('witness1Name', ''), self.styles['WillBody']),
                Paragraph("_________________________<br/>Name: " + will_data.get('witness2Name', ''), self.styles['WillBody'])
            ]
        ]
        
        signature_table = Table(signature_table_data, colWidths=[2*inch, 2*inch, 2*inch])
        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        
        story.append(signature_table)
        
        # Footer with compliance notice
        story.append(Spacer(1, 0.3*inch))
        footer_text = """
        <font size=8>
        This will has been created in compliance with the Ontario Succession Law Reform Act and Trustees Act. 
        It is recommended that this will be reviewed by a qualified lawyer before execution, particularly if your 
        situation involves complex family matters, significant assets, or special needs beneficiaries.
        </font>
        """
        story.append(Paragraph(footer_text, self.styles['WillBody']))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF bytes
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
    
    def generate_will_text(self, will_data: Dict[str, Any]) -> str:
        """Generate plain text version of will"""
        return self.clause_generator.generate_full_will_document(will_data)
    
    def validate_and_check_compliance(self, will_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate will data and check compliance"""
        return self.clause_generator.check_compliance(will_data)


# Initialize the will generator
will_generator = OntarioWillGenerator()
