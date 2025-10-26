"""
Attachment Processing Service
Secure extraction and analysis of email attachments
"""
import base64
import io
import os
from typing import Dict, List, Optional
from datetime import datetime

import anthropic
from PyPDF2 import PdfReader
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.trusted_sender import TrustedSender


# Security constants
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/html': 'html',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
}

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class AttachmentInfo:
    """Information about an email attachment"""
    def __init__(self, filename: str, mime_type: str, size: int, data: str):
        self.filename = filename
        self.mime_type = mime_type
        self.size = size
        self.data = data  # base64 encoded
        self.extracted_text: Optional[str] = None
        self.summary: Optional[str] = None


def extract_attachments_from_message(message: Dict) -> List[AttachmentInfo]:
    """
    Extract attachment metadata from Gmail message
    Returns list of AttachmentInfo objects (not yet downloaded)
    """
    attachments = []
    
    def process_part(part):
        if 'filename' in part and part['filename']:
            # Found an attachment
            mime_type = part.get('mimeType', 'application/octet-stream')
            filename = part['filename']
            
            # Get size
            size = 0
            if 'body' in part and 'size' in part['body']:
                size = part['body']['size']
            
            # Get attachment ID (for downloading later)
            attachment_id = None
            if 'body' in part and 'attachmentId' in part['body']:
                attachment_id = part['body']['attachmentId']
            
            attachments.append({
                'filename': filename,
                'mime_type': mime_type,
                'size': size,
                'attachment_id': attachment_id
            })
    
    # Process message parts
    if 'parts' in message['payload']:
        for part in message['payload']['parts']:
            process_part(part)
            # Handle nested parts (multipart/mixed, etc.)
            if 'parts' in part:
                for subpart in part['parts']:
                    process_part(subpart)
    
    return attachments


def is_attachment_safe(attachment_info: Dict) -> tuple[bool, str]:
    """
    Check if attachment is safe to process
    Returns (is_safe, reason)
    """
    mime_type = attachment_info.get('mime_type', '')
    size = attachment_info.get('size', 0)
    filename = attachment_info.get('filename', '')
    
    # Check size
    if size > MAX_ATTACHMENT_SIZE:
        return False, f"Attachment too large ({size / 1024 / 1024:.1f}MB, max 10MB)"
    
    # Check mime type
    if mime_type not in ALLOWED_MIME_TYPES:
        return False, f"Unsupported file type: {mime_type}"
    
    # Check for suspicious extensions
    suspicious_extensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.js', '.vbs']
    if any(filename.lower().endswith(ext) for ext in suspicious_extensions):
        return False, "Executable files are not allowed"
    
    return True, "Safe"


def download_attachment(gmail_service, user_id: str, message_id: str, attachment_id: str) -> Optional[bytes]:
    """
    Download attachment from Gmail
    Returns attachment data as bytes
    """
    try:
        attachment = gmail_service.users().messages().attachments().get(
            userId=user_id,
            messageId=message_id,
            id=attachment_id
        ).execute()
        
        # Decode base64 data
        import base64
        attachment_data = base64.urlsafe_b64decode(attachment['data'])
        return attachment_data
    except Exception as e:
        print(f"Error downloading attachment: {str(e)}")
        return None


def extract_pdf_text(pdf_data: bytes) -> str:
    """Extract text content from PDF"""
    try:
        pdf_file = io.BytesIO(pdf_data)
        reader = PdfReader(pdf_file)
        
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n\n"
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return ""


def extract_text_from_attachment(attachment_data: bytes, mime_type: str) -> str:
    """
    Extract text from attachment based on type
    """
    file_type = ALLOWED_MIME_TYPES.get(mime_type)
    
    if file_type == 'pdf':
        return extract_pdf_text(attachment_data)
    elif file_type in ['txt', 'html']:
        try:
            return attachment_data.decode('utf-8')
        except:
            return attachment_data.decode('latin-1', errors='ignore')
    elif file_type in ['doc', 'docx']:
        # For Word docs, we'd need python-docx library
        # For now, return placeholder
        return "[Word document - text extraction coming soon]"
    
    return ""


async def summarize_attachment_with_ai(
    filename: str,
    extracted_text: str,
    context: str = ""
) -> str:
    """
    Use Claude to summarize attachment content
    """
    if not extracted_text:
        return f"Unable to extract text from {filename}"
    
    # Truncate if too long (Claude has token limits)
    max_chars = 50000
    if len(extracted_text) > max_chars:
        extracted_text = extracted_text[:max_chars] + "\n\n[... content truncated ...]"
    
    prompt = f"""Analyze this attachment and provide a concise summary (2-3 sentences).

Filename: {filename}
{f'Context: {context}' if context else ''}

Content:
{extracted_text}

Provide a brief summary highlighting:
1. Main topic/purpose
2. Key points or findings
3. Any action items or deadlines mentioned

Summary:"""

    try:
        response = anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    except Exception as e:
        print(f"Error summarizing attachment: {str(e)}")
        return f"[Attachment: {filename}]"


async def process_attachments_for_message(
    gmail_service,
    message_id: str,
    attachments: List[Dict],
    user_email: str
) -> List[Dict]:
    """
    Download and process all attachments for a message
    Returns list of processed attachments with extracted text and summaries
    """
    processed_attachments = []
    
    for att_info in attachments:
        # Check if safe
        is_safe, reason = is_attachment_safe(att_info)
        if not is_safe:
            print(f"⚠️ Skipping unsafe attachment {att_info['filename']}: {reason}")
            continue
        
        # Download attachment
        print(f"📎 Downloading attachment: {att_info['filename']}")
        attachment_data = download_attachment(
            gmail_service,
            'me',
            message_id,
            att_info['attachment_id']
        )
        
        if not attachment_data:
            print(f"❌ Failed to download {att_info['filename']}")
            continue
        
        # Extract text
        print(f"📄 Extracting text from {att_info['filename']}")
        extracted_text = extract_text_from_attachment(
            attachment_data,
            att_info['mime_type']
        )
        
        # Summarize with AI
        summary = ""
        if extracted_text:
            print(f"🤖 Summarizing {att_info['filename']} with AI")
            summary = await summarize_attachment_with_ai(
                att_info['filename'],
                extracted_text,
                context=f"Email to {user_email}"
            )
        
        processed_attachments.append({
            'filename': att_info['filename'],
            'mime_type': att_info['mime_type'],
            'size': att_info['size'],
            'extracted_text': extracted_text[:1000] if extracted_text else None,  # First 1000 chars
            'summary': summary,
            'text_length': len(extracted_text) if extracted_text else 0
        })
        
        print(f"✅ Processed {att_info['filename']}: {len(extracted_text) if extracted_text else 0} chars extracted")
    
    return processed_attachments


def check_sender_trust(
    db: Session,
    user_email: str,
    sender_email: str
) -> tuple[bool, bool]:
    """
    Check if sender is trusted for attachment processing
    Returns (is_trusted, auto_approved)
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return False, False
        
        trusted_sender = db.query(TrustedSender).filter(
            TrustedSender.user_id == user.id,
            TrustedSender.sender_email == sender_email,
            TrustedSender.allow_attachments == True
        ).first()
        
        if trusted_sender:
            return True, trusted_sender.auto_approved
        
        return False, False
    except Exception as e:
        # If trusted_senders table doesn't exist yet, treat as untrusted
        print(f"⚠️ Error checking sender trust (table may not exist): {e}")
        return False, False


def update_sender_attachment_count(
    db: Session,
    user_email: str,
    sender_email: str
):
    """Increment attachment count for trusted sender"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return
        
        trusted_sender = db.query(TrustedSender).filter(
            TrustedSender.user_id == user.id,
            TrustedSender.sender_email == sender_email
        ).first()
        
        if trusted_sender:
            trusted_sender.attachment_count += 1
            trusted_sender.last_used = datetime.utcnow()
            db.commit()
    except Exception as e:
        # If trusted_senders table doesn't exist yet, silently skip
        print(f"⚠️ Error updating sender attachment count (table may not exist): {e}")
