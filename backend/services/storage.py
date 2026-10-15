import base64
import os
import uuid
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def get_s3_client():
    """Returns a boto3 s3 client if credentials/IAM instance role is available"""
    try:
        import boto3
        region = os.getenv("AWS_REGION", "ap-south-1")
        return boto3.client("s3", region_name=region)
    except Exception as e:
        logger.debug(f"S3 client not initialized: {e}")
        return None


def get_s3_bucket_name():
    return os.getenv("S3_MEDIA_BUCKET") or os.getenv("MEDIA_BUCKET_NAME") or os.getenv("SSL_BUCKET_NAME") or "wingroo-23243253453"


def upload_to_s3(file_path_or_bytes, relative_key, content_type=None):
    """
    Uploads a file or bytes to the S3 bucket under the configured prefix (default: 'media/').
    Returns True if successfully uploaded, False otherwise.
    """
    bucket_name = get_s3_bucket_name()
    s3 = get_s3_client()
    if not s3 or not bucket_name:
        return False

    prefix = os.getenv("S3_MEDIA_PREFIX", "media").strip("/")
    clean_key = relative_key.lstrip("/")
    full_key = f"{prefix}/{clean_key}" if prefix else clean_key

    extra_args = {}
    if content_type:
        extra_args["ContentType"] = content_type

    try:
        if isinstance(file_path_or_bytes, (bytes, bytearray)):
            s3.put_object(Bucket=bucket_name, Key=full_key, Body=file_path_or_bytes, **extra_args)
        else:
            s3.upload_file(str(file_path_or_bytes), bucket_name, full_key, ExtraArgs=extra_args if extra_args else None)
        return True
    except Exception as e:
        logger.warning(f"S3 upload error for {full_key}: {e}")
        return False


def download_from_s3(relative_key, local_target_path):
    """
    Downloads an object from S3 to local disk cache if missing locally.
    Returns True if successfully downloaded, False otherwise.
    """
    bucket_name = get_s3_bucket_name()
    s3 = get_s3_client()
    if not s3 or not bucket_name:
        return False

    prefix = os.getenv("S3_MEDIA_PREFIX", "media").strip("/")
    clean_key = relative_key.lstrip("/")
    full_key = f"{prefix}/{clean_key}" if prefix else clean_key

    try:
        target = Path(local_target_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file(bucket_name, full_key, str(target))
        return True
    except Exception as e:
        logger.debug(f"S3 download skipped/failed for {full_key}: {e}")
        return False


def save_base64_file(data_uri, media_folder, subfolder="uploads", prefix="file"):
    """
    Decodes a base64 Data URL and saves it to local disk cache and syncs to S3.
    Returns the relative path from media folder (e.g. 'selfies/selfie_abc123.jpg').
    """
    if not data_uri:
        return None
    if not isinstance(data_uri, str) or not data_uri.startswith("data:"):
        # If it's already a saved filename/url, return as is
        return data_uri

    try:
        header, encoded = data_uri.split(";base64,", 1)
        mime = header.split(":", 1)[-1].split(";")[0].lower()
        ext = mime.split("/")[-1] if "/" in mime else "jpg"
        if ext in ["jpeg", "jpg"]:
            ext = "jpg"
        elif ext == "png":
            ext = "png"
        elif ext == "webp":
            ext = "webp"
        elif ext == "pdf":
            ext = "pdf"
        else:
            ext = "jpg"

        decoded = base64.b64decode(encoded)
        filename = f"{prefix}_{uuid.uuid4().hex[:10]}.{ext}"

        target_dir = Path(media_folder) / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)

        file_path = target_dir / filename
        with open(file_path, "wb") as f:
            f.write(decoded)

        rel_path = f"{subfolder}/{filename}"

        # Sync to S3 bucket
        upload_to_s3(decoded, rel_path, content_type=mime)

        # Return relative path for database storage (matching standard format)
        return rel_path
    except Exception as e:
        print(f"Error saving base64 file: {e}")
        return None

